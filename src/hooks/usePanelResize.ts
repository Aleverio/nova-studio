/**
 * usePanelResize
 *
 * Manages resizable panel widths.
 * - Reads/writes from localStorage for persistence across restarts.
 * - Enforces min/max constraints during drag.
 * - Double-click handle → reset to default width.
 */
import { useCallback, useRef, useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

const STORAGE_KEY = 'nova-panel-sizes';

const LEFT_MIN     = 160;
const LEFT_MAX     = 480;
const RIGHT_MIN    = 200;
const RIGHT_MAX    = 520;
const LEFT_DEFAULT  = 240;
const RIGHT_DEFAULT = 280;

interface PanelSizes { left: number; right: number }

function loadSizes(): PanelSizes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PanelSizes>;
      return {
        left:  clamp(p.left  ?? LEFT_DEFAULT,  LEFT_MIN,  LEFT_MAX),
        right: clamp(p.right ?? RIGHT_DEFAULT, RIGHT_MIN, RIGHT_MAX),
      };
    }
  } catch { /* ignore */ }
  return { left: LEFT_DEFAULT, right: RIGHT_DEFAULT };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function usePanelResize() {
  const [sizes, setSizes] = useState<PanelSizes>(loadSizes);

  // Persist to localStorage on every change (via rAF to batch rapid drags)
  const rafRef = useRef<number>(0);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes)); } catch { /* ignore */ }
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [sizes]);

  // ── Left handle ─────────────────────────────────────────────────────────
  // Use refs so the callback is stable (no re-creation on width change)
  const leftSizeRef  = useRef(sizes.left);
  const rightSizeRef = useRef(sizes.right);
  leftSizeRef.current  = sizes.left;
  rightSizeRef.current = sizes.right;

  const onLeftMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftSizeRef.current;

    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      const next = clamp(startW + (ev.clientX - startX), LEFT_MIN, LEFT_MAX);
      setSizes((s) => ({ ...s, left: next }));
    };
    const onUp = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, []); // stable — uses refs for current values

  // ── Right handle ─────────────────────────────────────────────────────────
  const onRightMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightSizeRef.current;

    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev: MouseEvent) => {
      // Moving left (negative delta) = growing the right panel
      const next = clamp(startW + (startX - ev.clientX), RIGHT_MIN, RIGHT_MAX);
      setSizes((s) => ({ ...s, right: next }));
    };
    const onUp = () => {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, []); // stable

  const resetLeft  = useCallback(() => setSizes((s) => ({ ...s, left:  LEFT_DEFAULT  })), []);
  const resetRight = useCallback(() => setSizes((s) => ({ ...s, right: RIGHT_DEFAULT })), []);

  return {
    leftWidth:         sizes.left,
    rightWidth:        sizes.right,
    onLeftMouseDown,
    onRightMouseDown,
    resetLeft,
    resetRight,
  };
}
