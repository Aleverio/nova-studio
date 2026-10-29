import type {
  FileNode, Change, RecentCommit, Extension,
  RoomMessage, AIMessage, SearchResult,
} from '../types';

// ─── File Tree ────────────────────────────────────────────────────────────

export const mockFileTree: FileNode[] = [
  {
    id: 'packages', name: 'packages', path: 'packages', kind: 'folder',
    children: [
      {
        id: 'core', name: 'core', path: 'packages/core', kind: 'folder',
        children: [
          {
            id: 'session', name: 'session', path: 'packages/core/session', kind: 'folder',
            children: [
              { id: 'createSession', name: 'createSession.ts', path: 'packages/core/session/createSession.ts', kind: 'file', language: 'typescript' },
              { id: 'types', name: 'types.ts', path: 'packages/core/session/types.ts', kind: 'file', language: 'typescript' },
              { id: 'store', name: 'store.ts', path: 'packages/core/session/store.ts', kind: 'file', language: 'typescript' },
            ],
          },
          {
            id: 'agent', name: 'agent', path: 'packages/core/agent', kind: 'folder',
            children: [
              { id: 'agent-index', name: 'index.ts', path: 'packages/core/agent/index.ts', kind: 'file', language: 'typescript' },
            ],
          },
        ],
      },
      {
        id: 'runtime', name: 'runtime', path: 'packages/runtime', kind: 'folder',
        children: [
          { id: 'runtime-index', name: 'index.ts', path: 'packages/runtime/index.ts', kind: 'file', language: 'typescript' },
        ],
      },
      {
        id: 'web', name: 'web', path: 'packages/web', kind: 'folder',
        children: [
          { id: 'web-app', name: 'App.tsx', path: 'packages/web/App.tsx', kind: 'file', language: 'tsx' },
        ],
      },
    ],
  },
  { id: 'package-json', name: 'package.json', path: 'package.json', kind: 'file', language: 'json' },
  { id: 'turbo-json', name: 'turbo.json', path: 'turbo.json', kind: 'file', language: 'json' },
  { id: 'pnpm-lock', name: 'pnpm-lock.yaml', path: 'pnpm-lock.yaml', kind: 'file', language: 'yaml' },
  { id: 'tsconfig', name: 'tsconfig.json', path: 'tsconfig.json', kind: 'file', language: 'json' },
  { id: 'readme', name: 'README.md', path: 'README.md', kind: 'file', language: 'markdown' },
];

// ─── Sample Code ─────────────────────────────────────────────────────────

export const sampleCode = `import { useMemo, useEffect, useRef } from 'react';
import { createStore } from '@nova/store';
import { attach, warmup } from './agent';
import type { Session, SessionConfig } from './types';

const DEFAULTS: SessionConfig = {
  retryDelay: 1500,
  maxRetries: 4,
  heartbeat: 30_000,
  reconnect: true,
};

export function createSession(config: Partial<SessionConfig> = {}) {
  const store = createStore<Session>({
    ...DEFAULTS,
    ...config,
  });

  useEffect(() => {
    warmup(store);
    attach(store, config);
    track('session.warm', config);
  }, []);

  return useMemo(() => ({
    subscribe: store.subscribe,
    dispatch: store.dispatch,
    destroy: () => store.reset(),
  }), [store]);
}
`;

// ─── Git Changes ─────────────────────────────────────────────────────────

export const mockChanges: Change[] = [
  { path: 'packages/core/session/createSession.ts', status: 'M', adds: 18, dels: 4, staged: true },
  { path: 'packages/core/session/types.ts',         status: 'M', adds: 3,  dels: 1, staged: true },
  { path: 'packages/core/agent/index.ts',           status: 'A', adds: 24, dels: 0, staged: false },
  { path: 'packages/runtime/index.ts',              status: 'M', adds: 7,  dels: 2, staged: false },
];

export const mockRecentCommits: RecentCommit[] = [
  { hash: 'a91f2c4', message: 'feat: add session heartbeat mechanism', when: '2h ago' },
  { hash: 'b82e1d3', message: 'fix: reconnect on visibility change',   when: '5h ago' },
  { hash: 'c73d0e2', message: 'chore: update @nova/store to 3.1.0',    when: '1d ago' },
  { hash: 'd64c9f1', message: 'refactor: extract session config type',  when: '2d ago' },
];

// ─── Diff Content ────────────────────────────────────────────────────────

export const mockDiffLines = [
  { type: 'hunk' as const, old: '@@ -18,7 +18,10 @@', file: 'createSession.ts' },
  { type: 'context' as const, oldNo: 18, newNo: 18, content: '  const store = createStore<Session>({' },
  { type: 'context' as const, oldNo: 19, newNo: 19, content: '    ...DEFAULTS,' },
  { type: 'context' as const, oldNo: 20, newNo: 20, content: '    ...config,' },
  { type: 'remove' as const,  oldNo: 21, newNo: null, content: '  });' },
  { type: 'add' as const,     oldNo: null, newNo: 21, content: '    reconnect: config.reconnect ?? true,' },
  { type: 'add' as const,     oldNo: null, newNo: 22, content: '    onReconnect: config.onReconnect,' },
  { type: 'add' as const,     oldNo: null, newNo: 23, content: '  });' },
  { type: 'context' as const, oldNo: 22, newNo: 24, content: '' },
  { type: 'context' as const, oldNo: 23, newNo: 25, content: '  useEffect(() => {' },
  { type: 'context' as const, oldNo: 24, newNo: 26, content: '    warmup(store);' },
  { type: 'remove' as const,  oldNo: 25, newNo: null, content: '    attach(store, config);' },
  { type: 'add' as const,     oldNo: null, newNo: 27, content: '    attach(store, { ...config, version: 2 });' },
  { type: 'add' as const,     oldNo: null, newNo: 28, content: '    track(\'session.warm\', config);' },
  { type: 'context' as const, oldNo: 26, newNo: 29, content: '  }, []);' },
];

// ─── Extensions ──────────────────────────────────────────────────────────

export const mockExtensions: Extension[] = [
  {
    id: 'nova-lint',
    name: 'Nova Lint',
    publisher: 'nova-tools',
    icon: 'shield-check',
    installs: '2.4k',
    rating: 4.8,
    reviews: 312,
    version: 'v2.4.1',
    installed: true,
    updateAvailable: false,
    tags: ['Linter', 'TypeScript', 'Auto-fix'],
    description: 'Intelligent linting with AI-powered auto-fix suggestions for TypeScript and React projects.',
    features: [
      'Real-time lint errors with inline suggestions',
      'Auto-fix on save with configurable rules',
      'Integrates with Nova AI for smart refactors',
    ],
    changelog: [
      { version: 'v2.4.1', date: '2 days ago',  note: 'Fix false positive on optional chaining' },
      { version: 'v2.4.0', date: '1 week ago',  note: 'Add React 19 rule set' },
      { version: 'v2.3.2', date: '3 weeks ago', note: 'Performance improvements' },
    ],
    details: {
      version: 'v2.4.1', released: 'Oct 27, 2026',
      license: 'MIT', repo: 'github.com/nova-tools/nova-lint',
      size: '1.2 MB', engine: 'nova ≥2.0',
    },
    permissions: ['Read workspace files', 'Write workspace files'],
    settings: [
      { key: 'autoFix',      label: 'Auto-fix on save',            value: true  },
      { key: 'showInline',   label: 'Show inline suggestions',      value: true  },
      { key: 'strictMode',   label: 'Enable strict mode rules',     value: false },
    ],
  },
  {
    id: 'graph-lens',
    name: 'Graph Lens',
    publisher: 'graphtools',
    icon: 'network',
    installs: '1.1k',
    rating: 4.5,
    reviews: 98,
    version: 'v1.2.0',
    installed: false,
    updateAvailable: false,
    tags: ['Visualization', 'Graph', 'Dependencies'],
    description: 'Visualize module dependencies as an interactive graph inside Nova Studio.',
    features: [
      'Interactive D3-based dependency graph',
      'Highlight circular dependencies',
      'Export as SVG or PNG',
    ],
    changelog: [
      { version: 'v1.2.0', date: '1 week ago',  note: 'Add circular dependency detection' },
      { version: 'v1.1.0', date: '1 month ago', note: 'Export functionality' },
    ],
    details: {
      version: 'v1.2.0', released: 'Oct 22, 2026',
      license: 'Apache-2.0', repo: 'github.com/graphtools/graph-lens',
      size: '3.4 MB', engine: 'nova ≥1.8',
    },
    permissions: ['Read workspace files', 'Network access'],
    settings: [],
  },
  {
    id: 'nova-snippets',
    name: 'Nova Snippets',
    publisher: 'nova-tools',
    icon: 'zap',
    installs: '5.7k',
    rating: 4.9,
    reviews: 721,
    version: 'v3.1.0',
    installed: true,
    updateAvailable: true,
    tags: ['Snippets', 'Productivity'],
    description: 'Smart code snippets with AI completion for React, TypeScript and more.',
    features: [
      'AI-enhanced snippet suggestions',
      'Team-shared snippet library',
      'Import/export support',
    ],
    changelog: [
      { version: 'v3.1.0', date: '3 days ago',  note: 'AI-powered snippet ranking' },
      { version: 'v3.0.1', date: '2 weeks ago', note: 'Bug fixes' },
    ],
    details: {
      version: 'v3.1.0', released: 'Oct 26, 2026',
      license: 'MIT', repo: 'github.com/nova-tools/nova-snippets',
      size: '0.8 MB', engine: 'nova ≥2.0',
    },
    permissions: ['Read workspace files'],
    settings: [
      { key: 'aiRanking', label: 'Enable AI ranking', value: true },
    ],
  },
  {
    id: 'prettier-nova',
    name: 'Prettier Nova',
    publisher: 'prettier',
    icon: 'align-left',
    installs: '12k',
    rating: 4.7,
    reviews: 1402,
    version: 'v4.0.2',
    installed: true,
    updateAvailable: false,
    tags: ['Formatter', 'TypeScript', 'Verified'],
    description: 'Official Prettier integration for Nova Studio with format-on-save support.',
    features: [
      'Format on save',
      'Supports all Prettier plugins',
      'Per-project config support',
    ],
    changelog: [
      { version: 'v4.0.2', date: '5 days ago',  note: 'Prettier 3.4 compatibility' },
    ],
    details: {
      version: 'v4.0.2', released: 'Oct 24, 2026',
      license: 'MIT', repo: 'github.com/prettier/nova-prettier',
      size: '2.1 MB', engine: 'nova ≥1.5',
    },
    permissions: ['Read workspace files', 'Write workspace files'],
    settings: [
      { key: 'formatOnSave', label: 'Format on save',    value: true  },
      { key: 'singleQuote',  label: 'Use single quotes', value: true  },
    ],
  },
];

// ─── Room Messages ────────────────────────────────────────────────────────

export const mockMessages: RoomMessage[] = [
  {
    id: 'm1', author: 'Jordan Kim', initials: 'JK', time: '10:14',
    text: 'The session heartbeat PR is ready for review. Main change is in createSession.ts — added reconnect on visibility change.',
    reactions: [{ emoji: '👀', count: 2 }],
  },
  {
    id: 'm2', author: 'Ari Rivera', initials: 'AR', time: '10:17',
    text: 'On it. Does this replace the existing retry logic or stack on top?',
  },
  {
    id: 'm3', author: 'Jordan Kim', initials: 'JK', time: '10:18',
    text: 'Stacks on top — retry still handles network errors. Heartbeat handles tab visibility.',
    attachment: { name: 'session-reconnect-spec.ts', stat: '+38' },
  },
  {
    id: 'm4', author: 'Mei Chen', initials: 'MC', time: '10:22',
    text: 'Left some inline comments. The config defaults look good but I\'d expose reconnectDelay separately rather than through the main config spread.',
    reactions: [{ emoji: '✅', count: 1 }, { emoji: '💡', count: 3 }],
  },
  {
    id: 'm5', author: 'Ari Rivera', initials: 'AR', time: '10:25',
    text: 'Agreed with Mei. Also — should we track the reconnect event in telemetry the same way we track session.warm?',
    own: true,
  },
];

// ─── AI Messages ─────────────────────────────────────────────────────────

export const mockAIMessages: AIMessage[] = [
  {
    id: 'ai1',
    role: 'user',
    content: 'Sessions die whenever I switch tabs. Make the connection survive sleep.',
  },
  {
    id: 'ai2',
    role: 'assistant',
    content: 'The session drops because the WebSocket heartbeat pauses when the page visibility changes to `hidden`. Adding a `visibilitychange` listener that re-attaches on wake will fix it.',
    latency: '1.6s',
    patch: {
      id: 'p1',
      adds: 3,
      removes: 1,
      status: 'pending',
      lines: [
        { type: 'context', content: "  useEffect(() => {" },
        { type: 'context', content: "    warmup(store);" },
        { type: 'remove',  content: "    attach(store, config);" },
        { type: 'add',     content: "    attach(store, { ...config, version: 2 });" },
        { type: 'add',     content: "    track('session.warm', config);" },
        { type: 'add',     content: "    document.addEventListener('visibilitychange', () => {" },
        { type: 'context', content: "  }, []);" },
      ],
    },
    plan: [
      { label: 'Add visibility listener in useEffect',  done: true  },
      { label: 'Pass reconnect flag through config',    done: true  },
      { label: 'Track reconnect event in telemetry',    done: false },
    ],
  },
];

// ─── Search Results ───────────────────────────────────────────────────────

export const mockSearchResults: SearchResult[] = [
  {
    file: { id: 'createSession', name: 'createSession.ts', path: 'packages/core/session/createSession.ts', kind: 'file' },
    hits: [
      { line: 2,  preview: "import { attach, warmup } from './agent';" },
      { line: 14, preview: "  const store = createStore<Session>({" },
      { line: 20, preview: "    warmup(store);" },
    ],
  },
  {
    file: { id: 'types', name: 'types.ts', path: 'packages/core/session/types.ts', kind: 'file' },
    hits: [
      { line: 5,  preview: "export interface Session {" },
      { line: 12, preview: "export interface SessionConfig {" },
    ],
  },
  {
    file: { id: 'store', name: 'store.ts', path: 'packages/core/session/store.ts', kind: 'file' },
    hits: [
      { line: 8,  preview: "export function createStore<T>(config: T) {" },
    ],
  },
];

// ─── Conflict ────────────────────────────────────────────────────────────

export const mockConflictCurrent = `  const store = createStore<Session>({
    ...DEFAULTS,
    ...config,
  });

  useEffect(() => {
    warmup(store);
    attach(store, config);
  }, []);`;

export const mockConflictIncoming = `  const store = createStore<Session>({
    ...DEFAULTS,
    ...config,
    reconnect: true,
  });

  useEffect(() => {
    warmup(store);
    attach(store, { ...config, version: 2 });
    track('session.warm', config);
  }, []);`;
