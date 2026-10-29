import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type {
  Screen, RightPanel, Theme, Workspace, SearchState,
  GitState, Extension, RoomState, AIState, Toast, FileNode, Change,
} from '../types';
import {
  mockExtensions, mockMessages, mockAIMessages, mockSearchResults,
} from '../data/mockData';
import {
  openFolderDialog, readFile, saveFile, listDir, getGitStatus,
  gitStage, gitUnstage, gitCommit, gitPush, gitPull,
} from '../lib/tauri';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'out', 'build', '.next', 'target']);

async function buildFileTree(dirPath: string, depth = 0): Promise<FileNode[]> {
  if (depth > 3) return [];
  try {
    const entries = await listDir(dirPath);
    const nodes: FileNode[] = [];
    for (const entry of entries) {
      if (!entry.name) continue;
      const sep = dirPath.includes('\\') ? '\\' : '/';
      const entryPath = `${dirPath}${sep}${entry.name}`;
      if (entry.isDirectory) {
        if (SKIP_DIRS.has(entry.name)) continue;
        const children = await buildFileTree(entryPath, depth + 1);
        nodes.push({ id: entryPath, name: entry.name, path: entryPath, kind: 'folder', children });
      } else if (entry.isFile) {
        nodes.push({ id: entryPath, name: entry.name, path: entryPath, kind: 'file', language: detectLanguage(entry.name) });
      }
    }
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return nodes;
  } catch { return []; }
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', md: 'markdown', yaml: 'yaml', yml: 'yaml',
    css: 'css', html: 'html', rs: 'rust', toml: 'toml', sh: 'shell',
    py: 'python', go: 'go', rb: 'ruby',
  };
  return map[ext] ?? 'plaintext';
}

interface AppState {
  screen: Screen;
  rightPanel: RightPanel;
  theme: Theme;
  paletteOpen: boolean;
  workspace: Workspace;
  workspacePath: string | null;
  fileContents: Record<string, string>;
  search: SearchState;
  git: GitState;
  extensions: Extension[];
  selectedExtension: string | null;
  extensionTab: 'installed' | 'marketplace';
  extensionLoading: boolean;
  room: RoomState;
  ai: AIState;
  progressMap: Record<string, { message: string; percent: number | null; error: boolean }>;
  toasts: Toast[];
  discardDialogOpen: boolean;
  permissionDialogFor: string | null;

  setScreen: (s: Screen) => void;
  setRightPanel: (p: RightPanel) => void;
  toggleTheme: () => void;
  openPalette: () => void;
  closePalette: () => void;
  openWorkspace: () => Promise<void>;
  loadFileTree: () => Promise<void>;
  refreshGitStatus: () => Promise<void>;
  openFile: (id: string) => void;
  openFileContent: (id: string, path: string) => Promise<void>;
  closeTab: (id: string) => void;
  setFileContent: (id: string, content: string) => void;
  saveFileContent: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  runSearch: () => void;
  stageChange: (path: string, staged: boolean) => void;
  stageAll: (staged: boolean) => void;
  setCommitMessage: (msg: string) => void;
  toggleAmend: () => void;
  toggleSignOff: () => void;
  commit: () => void;
  push: () => Promise<void>;
  pull: () => void;
  discardAll: () => void;
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
  selectExtension: (id: string | null) => void;
  setExtensionTab: (tab: 'installed' | 'marketplace') => void;
  openPermissionDialog: (id: string) => void;
  closePermissionDialog: () => void;
  sendMessage: (text: string) => void;
  sendAIMessage: (text: string) => void;
  applyPatch: (patchId: string) => void;
  dismissPatch: (patchId: string) => void;
  setProgress: (id: string, val: { message: string; percent: number | null; error: boolean }) => void;
  clearProgress: (id: string) => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearTyping: () => void;
  openDiscardDialog: () => void;
  closeDiscardDialog: () => void;
}

let toastCounter = 0;

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'editor',
  rightPanel: 'ai',
  theme: (localStorage.getItem('nova-theme') as 'dark' | 'light') ?? 'dark',
  paletteOpen: false,
  workspacePath: null,
  fileContents: {},
  workspace: {
    repo: 'nova.',
    branch: '',
    files: [],
    openTabs: [],
    activeTab: undefined,
    dirty: {},
  },
  search: {
    query: '', caseSensitive: false, wholeWord: false, regex: false,
    include: '', exclude: '', status: 'idle', results: [], activeMatch: 0, durationMs: 0,
  },
  git: {
    changes: [], message: '', amend: false, signOff: false,
    recent: [], commitsToPush: 0, behind: 0, syncState: 'idle',
  },
  extensions: mockExtensions,
  selectedExtension: 'nova-lint',
  extensionTab: 'installed',
  extensionLoading: false,
  room: {
    name: 'design-system', members: 12, online: 4,
    messages: mockMessages, typing: [], offline: false,
  },
  ai: {
    messages: mockAIMessages, contextFiles: 3, contextTokens: '4.2k',
    mode: 'agent', thinking: false,
  },
  toasts: [],
  progressMap: {},
  discardDialogOpen: false,
  permissionDialogFor: null,

  setScreen: (screen) => set({ screen }),
  setRightPanel: (rightPanel) => set({ rightPanel }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),

  openWorkspace: async () => {
    const path = await openFolderDialog();
    if (!path) return;
    const folderName = path.split(/[\/]/).pop() ?? path;
    set((s) => ({
      workspacePath: path,
      workspace: { ...s.workspace, repo: folderName, openTabs: [], activeTab: undefined, dirty: {} },
      fileContents: {},
      git: { ...s.git, changes: [], message: '', commitsToPush: 0, syncState: 'idle' },
    }));
    await get().loadFileTree();
    await get().refreshGitStatus();
  },

  loadFileTree: async () => {
    const { workspacePath } = get();
    if (!workspacePath) return;
    try {
      const files = await buildFileTree(workspacePath, 0);
      set((s) => ({ workspace: { ...s.workspace, files } }));
    } catch (err) { console.error('loadFileTree error:', err); }
  },

  refreshGitStatus: async () => {
    const { workspacePath } = get();
    if (!workspacePath) return;
    try {
      const result = await getGitStatus(workspacePath);
      const changes: Change[] = result.changes.map((c) => ({
        path: c.path,
        status: (c.status as Change['status']) || 'M',
        adds: 0, dels: 0,
        staged: c.staged,
      }));
      set((s) => ({
        workspace: { ...s.workspace, branch: result.branch || s.workspace.branch },
        git: {
          ...s.git, changes, behind: result.behind,
          commitsToPush: result.ahead > 0 ? result.ahead : s.git.commitsToPush,
        },
      }));
    } catch (err) { console.error('refreshGitStatus error:', err); }
  },

  openFile: (id) => {
    const { workspacePath } = get();
    set((s) => {
      const tabs = s.workspace.openTabs.includes(id) ? s.workspace.openTabs : [...s.workspace.openTabs, id];
      return { workspace: { ...s.workspace, openTabs: tabs, activeTab: id } };
    });
    if (workspacePath && (id.startsWith('/') || /^[A-Za-z]:[\/]/.test(id))) {
      get().openFileContent(id, id);
    }
  },

  openFileContent: async (id, path) => {
    const { fileContents } = get();
    if (fileContents[id] !== undefined) return;
    try {
      const content = await readFile(path);
      set((s) => ({ fileContents: { ...s.fileContents, [id]: content } }));
    } catch (err) { console.error('openFileContent error:', err); }
  },

  closeTab: (id) =>
    set((s) => {
      const tabs = s.workspace.openTabs.filter((t) => t !== id);
      const active = s.workspace.activeTab === id ? tabs[tabs.length - 1] : s.workspace.activeTab;
      const newContents = { ...s.fileContents };
      delete newContents[id];
      return { workspace: { ...s.workspace, openTabs: tabs, activeTab: active }, fileContents: newContents };
    }),

  setFileContent: (id, content) =>
    set((s) => ({
      fileContents: { ...s.fileContents, [id]: content },
      workspace: { ...s.workspace, dirty: { ...s.workspace.dirty, [id]: true } },
    })),

  saveFileContent: async (id) => {
    const { fileContents } = get();
    const content = fileContents[id];
    if (content === undefined) return;
    try {
      await saveFile(id, content);
      set((s) => ({ workspace: { ...s.workspace, dirty: { ...s.workspace.dirty, [id]: false } } }));
    } catch (err) { console.error('saveFileContent error:', err); }
  },

  setSearchQuery: (query) => set((s) => ({ search: { ...s.search, query } })),

  runSearch: () => {
    const { search } = get();
    if (!search.query.trim()) {
      set((s) => ({ search: { ...s.search, status: 'idle', results: [] } }));
      return;
    }
    set((s) => ({ search: { ...s.search, status: 'searching' } }));
    setTimeout(() => {
      set((s) => ({
        search: {
          ...s.search,
          status: mockSearchResults.length ? 'done' : 'empty',
          results: mockSearchResults,
          durationMs: 47,
        },
      }));
    }, 400);
  },

  stageChange: (path, staged) => {
    const { workspacePath } = get();
    set((s) => ({ git: { ...s.git, changes: s.git.changes.map((c) => c.path === path ? { ...c, staged } : c) } }));
    if (workspacePath) {
      if (staged) gitStage(workspacePath, path).catch(console.error);
      else gitUnstage(workspacePath, path).catch(console.error);
    }
  },

  stageAll: (staged) => set((s) => ({ git: { ...s.git, changes: s.git.changes.map((c) => ({ ...c, staged })) } })),
  setCommitMessage: (message) => set((s) => ({ git: { ...s.git, message } })),
  toggleAmend: () => set((s) => ({ git: { ...s.git, amend: !s.git.amend } })),
  toggleSignOff: () => set((s) => ({ git: { ...s.git, signOff: !s.git.signOff } })),

  commit: () => {
    const { git, workspacePath } = get();
    if (!git.message.trim() || !git.changes.some((c) => c.staged)) return;
    if (workspacePath) {
      gitCommit(workspacePath, git.message, git.amend, git.signOff)
        .then(() => {
          set((s) => ({ git: { ...s.git, changes: s.git.changes.filter((c) => !c.staged), message: '', commitsToPush: s.git.commitsToPush + 1 } }));
          get().addToast({ variant: 'success', title: 'Changes committed', timeout: 6000 });
        })
        .catch((err: Error) => get().addToast({ variant: 'error', title: 'Commit failed', meta: err.toString(), timeout: 6000 }));
    } else {
      set((s) => ({ git: { ...s.git, changes: s.git.changes.filter((c) => !c.staged), message: '', commitsToPush: s.git.commitsToPush + 1 } }));
      get().addToast({ variant: 'success', title: 'Changes committed', timeout: 6000 });
    }
  },

  push: async () => {
    const { workspacePath } = get();
    set((s) => ({ git: { ...s.git, syncState: 'pushing' } }));
    invoke('start_sync_pulse').catch(() => {});
    try {
      if (workspacePath) await gitPush(workspacePath);
      else await new Promise((r) => setTimeout(r, 1500));
      set((s) => ({ git: { ...s.git, syncState: 'clean', commitsToPush: 0 } }));
      get().addToast({ variant: 'success', title: 'Pushed to origin/main', meta: 'Up to date', action: { label: 'Undo', run: () => {} }, timeout: 6000 });
    } catch (err) {
      set((s) => ({ git: { ...s.git, syncState: 'idle' } }));
      get().addToast({ variant: 'error', title: 'Push failed', meta: String(err), timeout: 8000 });
    }
  },

  pull: () => {
    const { workspacePath } = get();
    set((s) => ({ git: { ...s.git, syncState: 'pulling' } }));
    if (workspacePath) {
      gitPull(workspacePath)
        .then(() => {
          set((s) => ({ git: { ...s.git, syncState: 'clean', behind: 0 } }));
          get().addToast({ variant: 'info', title: 'Pulled successfully', timeout: 6000 });
          get().refreshGitStatus();
        })
        .catch((err: Error) => {
          set((s) => ({ git: { ...s.git, syncState: 'idle' } }));
          get().addToast({ variant: 'error', title: 'Pull failed', meta: err.toString(), timeout: 6000 });
        });
    } else {
      setTimeout(() => {
        set((s) => ({ git: { ...s.git, syncState: 'clean', behind: 0 } }));
        get().addToast({ variant: 'info', title: 'Pulled 2 commits', timeout: 6000 });
      }, 1200);
    }
  },

  discardAll: () => {
    const count = get().git.changes.length;
    const snapshot = [...get().git.changes];
    set((s) => ({ git: { ...s.git, changes: [] }, discardDialogOpen: false }));
    get().addToast({
      variant: 'info',
      title: `Discarded ${count} file${count !== 1 ? 's' : ''}`,
      action: { label: 'Undo', run: () => set((s) => ({ git: { ...s.git, changes: snapshot } })) },
      timeout: 6000,
    });
  },

  installExtension: (id) => {
    set((s) => ({ extensions: s.extensions.map((e) => e.id === id ? { ...e, installed: true } : e), permissionDialogFor: null }));
    const ext = get().extensions.find((e) => e.id === id);
    get().addToast({ variant: 'success', title: `${ext?.name ?? id} installed`, action: { label: 'Reload', run: () => {} }, timeout: 6000 });
  },

  uninstallExtension: (id) => set((s) => ({ extensions: s.extensions.map((e) => e.id === id ? { ...e, installed: false } : e) })),
  selectExtension: (id) => set({ selectedExtension: id }),
  setExtensionTab: (tab) => set({ extensionTab: tab }),
  openPermissionDialog: (id) => set({ permissionDialogFor: id }),
  closePermissionDialog: () => set({ permissionDialogFor: null }),

  sendMessage: (text) => {
    const msg = {
      id: `msg-${Date.now()}`,
      author: 'Ari Rivera', initials: 'AR',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      text, own: true,
    };
    set((s) => ({ room: { ...s.room, messages: [...s.room.messages, msg] } }));
  },

  sendAIMessage: (content) => {
    const userMsg = { id: `ai-u-${Date.now()}`, role: 'user' as const, content };
    set((s) => ({ ai: { ...s.ai, messages: [...s.ai.messages, userMsg], thinking: true } }));
    setTimeout(() => {
      const reply = { id: `ai-a-${Date.now()}`, role: 'assistant' as const, content: "I'm analyzing your code. Here's what I found and recommend...", latency: '1.2s' };
      set((s) => ({ ai: { ...s.ai, messages: [...s.ai.messages, reply], thinking: false } }));
    }, 1500);
  },

  applyPatch: (patchId) => {
    set((s) => ({ ai: { ...s.ai, messages: s.ai.messages.map((m) => m.patch?.id === patchId ? { ...m, patch: { ...m.patch!, status: 'applied' } } : m) } }));
    get().addToast({ variant: 'success', title: 'Patch applied', action: { label: 'Undo', run: () => {} }, timeout: 6000 });
  },

  dismissPatch: (patchId) => {
    set((s) => ({ ai: { ...s.ai, messages: s.ai.messages.map((m) => m.patch?.id === patchId ? { ...m, patch: { ...m.patch!, status: 'dismissed' } } : m) } }));
  },

  setProgress: (id, val) => set((s) => ({ progressMap: { ...s.progressMap, [id]: val } })),
  clearProgress: (id) => set((s) => { const next = { ...s.progressMap }; delete next[id]; return { progressMap: next }; }),

  addToast: (t) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    if (t.timeout > 0 && t.variant !== 'error') setTimeout(() => get().removeToast(id), t.timeout);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearTyping: () => set((s) => ({ room: { ...s.room, typing: [] } })),
  openDiscardDialog: () => set({ discardDialogOpen: true }),
  closeDiscardDialog: () => set({ discardDialogOpen: false }),
}));
