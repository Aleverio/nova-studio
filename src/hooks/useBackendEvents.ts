import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/useAppStore';

export interface ProgressEvent {
  id:      string;
  kind:    'start' | 'tick' | 'done' | 'error';
  message: string;
  percent: number | null;
}

export function useBackendEvents() {
  useEffect(() => {
    const unlisten: Array<() => void> = [];

    listen<ProgressEvent>('progress', (ev) => {
      const { id, kind, message, percent } = ev.payload;
      const { setProgress, clearProgress } = useAppStore.getState();
      if (kind === 'start' || kind === 'tick') {
        setProgress(id, { message, percent: percent ?? null, error: false });
      } else if (kind === 'done') {
        clearProgress(id);
      } else if (kind === 'error') {
        setProgress(id, { message, percent: null, error: true });
        setTimeout(() => useAppStore.getState().clearProgress(id), 4000);
      }
    }).then((fn) => unlisten.push(fn));

    listen('file-changed', () => {
      useAppStore.getState().refreshGitStatus();
    }).then((fn) => unlisten.push(fn));

    listen('window-fade-in', () => {
      document.documentElement.classList.add('ready');
    }).then((fn) => unlisten.push(fn));

    listen('sync-pulse', () => {
      document.getElementById('status-branch')?.classList.add('syncing');
    }).then((fn) => unlisten.push(fn));

    listen('sync-pulse-done', () => {
      document.getElementById('status-branch')?.classList.remove('syncing');
    }).then((fn) => unlisten.push(fn));

    // Fallback: show window if Rust does not respond in 500ms (browser dev mode)
    const fallbackTimer = setTimeout(() => {
      document.documentElement.classList.add('ready');
    }, 500);

    invoke('window_ready')
      .then(() => clearTimeout(fallbackTimer))
      .catch(() => {
        clearTimeout(fallbackTimer);
        document.documentElement.classList.add('ready');
      });

    return () => { unlisten.forEach((fn) => fn()); };
  }, []);
}
