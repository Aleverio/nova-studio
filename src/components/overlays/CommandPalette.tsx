import { useEffect, useRef, useState } from 'react';
import { FileCode, Users, Terminal, Settings, Search, Puzzle } from 'lucide-react';
import { Keycap } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import type { Screen } from '../../types';

// Map command ids to the screen they activate
const COMMAND_SCREENS: Record<string, Screen> = {
  c3: 'search',
  c4: 'extensions',
  c5: 'room',
};

const COMMANDS = [
  { id: 'c1', label: 'Open Command Palette',  icon: Terminal, shortcut: '⌘K' },
  { id: 'c2', label: 'Go to File',             icon: FileCode, shortcut: '⌘P' },
  { id: 'c3', label: 'Search Workspace',        icon: Search,   shortcut: '⌘⇧F' },
  { id: 'c4', label: 'Open Extensions',         icon: Puzzle,   shortcut: '⌘⇧X' },
  { id: 'c5', label: 'Open Team Room',          icon: Users,    shortcut: '⌘⇧R' },
  { id: 'c6', label: 'Open Settings',           icon: Settings, shortcut: '⌘,' },
];

const FILES = [
  { id: 'createSession', label: 'createSession.ts', meta: 'packages/core/session' },
  { id: 'types',         label: 'types.ts',         meta: 'packages/core/session' },
  { id: 'store',         label: 'store.ts',         meta: 'packages/core/session' },
  { id: 'agent-index',   label: 'index.ts',         meta: 'packages/core/agent'   },
];

const SYMBOLS = [
  { id: 's1', label: 'createSession()',     meta: 'createSession.ts:1' },
  { id: 's2', label: 'Session',             meta: 'types.ts:5' },
  { id: 's3', label: 'SessionConfig',       meta: 'types.ts:12' },
];

type Row = {
  id: string;
  label: string;
  meta?: string;
  shortcut?: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  kind: 'command' | 'file' | 'symbol';
};

export function CommandPalette() {
  const { closePalette, setScreen, setRightPanel, openFile } = useAppStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = (list: Omit<Row, 'kind'>[], kind: Row['kind'], q: string): Row[] =>
    (q ? list.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())) : list)
      .map((r) => ({ ...r, kind }));

  const fCommands = filtered(COMMANDS, 'command', query);
  const fFiles    = filtered(FILES, 'file', query);
  const fSymbols  = filtered(SYMBOLS, 'symbol', query);

  const isEmpty = !fCommands.length && !fFiles.length && !fSymbols.length;

  const allRows: Row[] = [...fCommands, ...fFiles, ...fSymbols];
  const safeSelected = selected % Math.max(1, allRows.length);

  const selectedRowRef   = useRef<Row | null>(null);
  const allRowsLengthRef = useRef<number>(0);
  // Update refs every render — no stale closure issues in the keyboard handler
  selectedRowRef.current   = allRows[safeSelected] ?? null;
  allRowsLengthRef.current = allRows.length;

  const executeRow = (row: Row) => {
    if (row.kind === 'command') {
      const screen = COMMAND_SCREENS[row.id];
      if (screen) {
        setScreen(screen);
        if (screen === 'room') setRightPanel('room');
        else setRightPanel('none');
      }
    } else if (row.kind === 'file') {
      openFile(row.id);
    }
    closePalette();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closePalette(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, Math.max(0, allRowsLengthRef.current - 1))); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(0, s - 1)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedRowRef.current) executeRow(selectedRowRef.current);
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closePalette]);

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-[80px] z-50"
      style={{ background: '#080808B8' }}
      onClick={closePalette}
    >
      <div
        className="flex flex-col rounded-[14px] border overflow-hidden"
        style={{
          width: 568,
          background: 'var(--n-card)',
          borderColor: 'var(--n-line2)',
          boxShadow: '0 26px 60px #000000CC',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        aria-modal
      >
        {/* Query input */}
        <div className="flex items-center px-[14px]" style={{ height: 52, borderBottom: '1px solid var(--n-line)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--n-low)" strokeWidth="2" className="shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search commands, files, symbols…"
            className="flex-1 ml-[10px] bg-transparent outline-none text-[13px] font-['JetBrains_Mono',monospace] placeholder:text-[--n-faint]"
            style={{ color: 'var(--n-hi)' }}
          />
          <Keycap>esc</Keycap>
        </div>

        {/* Results */}
        <div className="overflow-y-auto p-[6px]" style={{ maxHeight: 420 }}>
          {isEmpty && (
            <div className="flex flex-col items-center py-[26px] gap-[8px]">
              <div className="w-[38px] h-[38px] rounded-full border flex items-center justify-center"
                style={{ borderColor: 'var(--n-line2)' }}>
                <Search size={16} color="var(--n-faint)" />
              </div>
              <span className="text-[12.5px] font-semibold" style={{ color: 'var(--n-hi)' }}>No results</span>
              <p className="text-[10.5px] text-center" style={{ color: 'var(--n-low)', maxWidth: 320, lineHeight: 1.55 }}>
                Try a different query or try one of the suggestions below.
              </p>
              <p className="text-[9px] font-semibold tracking-[1.2px] uppercase mt-[4px]"
                style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Try instead</p>
              {[
                { label: 'Open recent files', shortcut: '⌘E' },
                { label: 'Go to symbol in workspace', shortcut: '⌘T' },
              ].map((s) => (
                <div key={s.label} className="w-full flex items-center justify-between px-[10px] rounded-[7px] hover:bg-[--n-hover] cursor-pointer"
                  style={{ height: 34 }}>
                  <span className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>{s.label}</span>
                  <Keycap>{s.shortcut}</Keycap>
                </div>
              ))}
            </div>
          )}

          {fCommands.length > 0 && (
            <Section label="Commands" rows={fCommands} offset={0} selected={safeSelected} onExecute={executeRow} />
          )}
          {fFiles.length > 0 && (
            <Section label="Files" rows={fFiles} offset={fCommands.length} selected={safeSelected} onExecute={executeRow} />
          )}
          {fSymbols.length > 0 && (
            <Section label="Symbols" rows={fSymbols} offset={fCommands.length + fFiles.length} selected={safeSelected} onExecute={executeRow} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[10px] shrink-0"
          style={{ height: 34, borderTop: '1px solid var(--n-line)' }}>
          <div className="flex items-center gap-[8px]">
            {[
              { key: '↑↓', hint: 'navigate' },
              { key: '↵', hint: 'open' },
              { key: 'esc', hint: 'close' },
            ].map(({ key, hint }) => (
              <div key={key} className="flex items-center gap-[4px]">
                <Keycap small>{key}</Keycap>
                <span className="text-[9px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>{hint}</span>
              </div>
            ))}
          </div>
          {allRows.length > 0 && (
            <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
              {allRows.length} results
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  label, rows, offset, selected, onExecute,
}: {
  label: string;
  rows: Row[];
  offset: number;
  selected: number;
  onExecute: (row: Row) => void;
}) {
  return (
    <div className="mb-[4px]">
      <div className="px-[10px] py-[4px]">
        <span className="text-[9px] font-semibold tracking-[1.2px] uppercase"
          style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {label}
        </span>
      </div>
      {rows.map((row, i) => {
        const globalIdx = offset + i;
        const isSelected = selected === globalIdx;
        const Icon = row.icon;

        return (
          <div
            key={row.id}
            className="flex items-center gap-[10px] px-[10px] rounded-[7px] cursor-pointer relative"
            style={{
              height: 34,
              background: isSelected ? 'var(--n-hover)' : 'transparent',
            }}
            role="option"
            aria-selected={isSelected}
            onClick={() => onExecute(row)}
          >
            {/* Selected marker */}
            {isSelected && (
              <span className="absolute left-0 top-[8px] bottom-[8px] w-[2px] rounded-[2px]"
                style={{ background: 'var(--n-paper)' }} />
            )}

            {Icon ? (
              <Icon size={13} color="var(--n-low)" />
            ) : (
              <FileCode size={13} color="var(--n-low)" />
            )}

            <span className="text-[11.5px] flex-1 truncate"
              style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {row.label}
            </span>

            {row.meta && (
              <span className="text-[9.5px] font-['JetBrains_Mono',monospace] truncate max-w-[120px]"
                style={{ color: 'var(--n-faint)' }}>
                {row.meta}
              </span>
            )}

            {row.shortcut && (
              <Keycap>{row.shortcut}</Keycap>
            )}
          </div>
        );
      })}
    </div>
  );
}


