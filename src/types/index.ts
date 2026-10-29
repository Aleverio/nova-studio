// --- Nova Studio — Shared Types ---

export type Screen =
  | 'editor'
  | 'search'
  | 'extensions'
  | 'source-control'
  | 'room';

export type RightPanel = 'ai' | 'room' | 'none';

// --- File Tree ---

export interface FileNode {
  id: string;
  name: string;
  path: string;
  kind: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
}

// --- Editor ---

export interface Workspace {
  repo: string;
  branch: string;
  files: FileNode[];
  openTabs: string[];
  activeTab?: string;
  dirty: Record<string, boolean>;
}

// --- Search ---

export interface SearchHit {
  line: number;
  preview: string;
}

export interface SearchResult {
  file: FileNode;
  hits: SearchHit[];
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  include: string;
  exclude: string;
  status: 'idle' | 'searching' | 'done' | 'empty';
  results: SearchResult[];
  activeMatch: number;
  durationMs: number;
}

// --- Source Control ---

export interface Change {
  path: string;
  status: 'M' | 'A' | 'D' | 'U' | 'C';
  adds: number;
  dels: number;
  staged: boolean;
}

export interface RecentCommit {
  hash: string;
  message: string;
  when: string;
}

export interface GitState {
  changes: Change[];
  message: string;
  amend: boolean;
  signOff: boolean;
  recent: RecentCommit[];
  commitsToPush: number;
  syncState: 'idle' | 'pushing' | 'pulling' | 'clean';
  behind: number;
  error?: string;
  conflicts?: string[];
}

// --- Extensions ---

export interface ExtensionChangelog {
  version: string;
  date: string;
  note: string;
}

export interface ExtensionDetails {
  version: string;
  released: string;
  license: string;
  repo: string;
  size: string;
  engine: string;
}

export interface ExtensionSetting {
  key: string;
  label: string;
  value: boolean;
}

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  icon: string;
  installs: string;
  rating: number;
  reviews: number;
  version: string;
  installed: boolean;
  updateAvailable: boolean;
  tags: string[];
  description: string;
  features: string[];
  changelog: ExtensionChangelog[];
  details: ExtensionDetails;
  permissions: string[];
  settings: ExtensionSetting[];
}

// --- Team Room ---

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Attachment {
  name: string;
  stat: string;
}

export interface RoomMessage {
  id: string;
  author: string;
  initials: string;
  time: string;
  text: string;
  reactions?: Reaction[];
  attachment?: Attachment;
  own?: boolean;
}

export interface RoomState {
  name: string;
  members: number;
  online: number;
  messages: RoomMessage[];
  typing: string[];
  offline: boolean;
}

// --- AI Agent ---

export interface PatchLine {
  type: 'add' | 'remove' | 'context';
  content: string;
}

export interface AIPatch {
  id: string;
  adds: number;
  removes: number;
  lines: PatchLine[];
  status: 'pending' | 'applied' | 'dismissed';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  patch?: AIPatch;
  plan?: { label: string; done: boolean }[];
  latency?: string;
}

export interface AIState {
  messages: AIMessage[];
  contextFiles: number;
  contextTokens: string;
  mode: 'agent' | 'plan';
  thinking: boolean;
}

// --- Toast ---

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'info';
  title: string;
  meta?: string;
  action?: { label: string; run(): void };
  timeout: number;
}

// --- Theme ---

export type Theme = 'dark' | 'light';
