import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile, readDir } from '@tauri-apps/plugin-fs';

export type GitStatusResult = {
  branch: string;
  ahead: number;
  behind: number;
  changes: { path: string; status: string; staged: boolean }[];
};

export async function openFolderDialog(): Promise<string | null> {
  const result = await open({ directory: true, multiple: false, title: 'Open Folder' });
  if (typeof result === 'string') return result;
  return null;
}

export async function readFile(path: string): Promise<string> {
  return readTextFile(path);
}

export async function saveFile(path: string, content: string): Promise<void> {
  return writeTextFile(path, content);
}

export async function listDir(path: string) {
  return readDir(path);
}

export async function getGitStatus(cwd: string): Promise<GitStatusResult> {
  return invoke('git_status', { cwd });
}

export async function getGitDiff(cwd: string, path: string, staged: boolean): Promise<string> {
  return invoke('git_diff', { cwd, path, staged });
}

export async function gitStage(cwd: string, path: string): Promise<void> {
  return invoke('git_stage', { cwd, path });
}

export async function gitUnstage(cwd: string, path: string): Promise<void> {
  return invoke('git_unstage', { cwd, path });
}

export async function gitCommit(cwd: string, message: string, amend: boolean, signOff: boolean): Promise<string> {
  return invoke('git_commit', { cwd, message, amend, signOff });
}

export async function gitPush(cwd: string): Promise<string> {
  return invoke('git_push', { cwd });
}

export async function gitPull(cwd: string): Promise<string> {
  return invoke('git_pull', { cwd });
}

