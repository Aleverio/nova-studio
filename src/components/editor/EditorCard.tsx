import { Plus, SplitSquareHorizontal, MoreHorizontal, FileCode } from 'lucide-react';
import { IconButton } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import { CodeView } from './CodeView';
import { OutputCard } from './OutputCard';
import { DiffView } from './DiffView';
import { ExtensionDetail } from '../panels/ExtensionDetail';
import { SearchEmptyState } from '../panels/SearchEmptyState';
import { mockFileTree } from '../../data/mockData';
import type { FileNode } from '../../types';

function findFileName(id: string, files?: FileNode[]): string {
  const nodes = files ?? mockFileTree;
  function search(nodes: FileNode[]): string | null {
    for (const n of nodes) {
      if (n.id === id) return n.name;
      if (n.children) {
        const found = search(n.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(nodes) ?? id.split(/[/\\]/).pop() ?? id;
}

function findFilePath(id: string, files?: FileNode[]): string[] {
  const nodes = files ?? mockFileTree;
  function search(nodes: FileNode[], path: string[]): string[] | null {
    for (const n of nodes) {
      if (n.id === id) return [...path, n.name];
      if (n.children) {
        const found = search(n.children, [...path, n.name]);
        if (found) return found;
      }
    }
    return null;
  }
  const result = search(nodes, []);
  if (result) return result;
  // Fallback for real paths: split by separator
  const parts = id.split(/[/\\]/);
  return parts.length > 0 ? parts : [id];
}

export function EditorCard() {
  const { workspace, screen, closeTab, openFile, search } = useAppStore();

  const renderBody = () => {
    if (screen === 'source-control') return <DiffView />;
    if (screen === 'extensions') return <ExtensionDetail />;
    if (screen === 'search') {
      if (search.status === 'empty') return <SearchEmptyState />;
      return <CodeView />;
    }
    return <CodeView />;
  };

  const pathSegments = (() => {
    if (!workspace.activeTab) return [];
    const { workspacePath } = useAppStore.getState();
    if (workspacePath) {
      const normalizedWp  = workspacePath.replace(/\\/g, '/');
      const normalizedTab = workspace.activeTab.replace(/\\/g, '/');
      if (normalizedTab.startsWith(normalizedWp)) {
        const rel = normalizedTab.slice(normalizedWp.length).replace(/^\//, '');
        return rel.split('/');
      }
    }
    return findFilePath(workspace.activeTab, workspace.files);
  })();

  return (
    <div
      className="editor-area flex flex-col rounded-[12px] border overflow-hidden"
      style={{ background: 'var(--n-card)', borderColor: 'var(--n-line)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[14px] shrink-0"
        style={{ height: 46, borderBottom: '1px solid var(--n-line)' }}
      >
        <div className="flex items-center gap-[4px] min-w-0 overflow-x-auto scrollbar-none">
          {workspace.openTabs.map((tabId) => {
            const name = findFileName(tabId, workspace.files);
            const isActive = tabId === workspace.activeTab;
            const isDirty = workspace.dirty[tabId];
            return (
              <button
                key={tabId}
                onClick={() => openFile(tabId)}
                className={`flex items-center gap-[6px] px-[10px] py-[6px] rounded-[8px] cursor-pointer transition-colors shrink-0 group`}
                style={{
                  background: isActive ? 'var(--n-active)' : 'transparent',
                }}
              >
                <FileCode size={11} color={isActive ? 'var(--n-mid)' : 'var(--n-faint)'} />
                <span
                  className="text-[11.5px]"
                  style={{
                    color: isActive ? 'var(--n-hi)' : 'var(--n-low)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  {name}
                </span>
                {isDirty && (
                  <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--n-low)' }} />
                )}
                <span
                  onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                  className="hidden group-hover:flex w-[14px] h-[14px] items-center justify-center rounded-[3px] text-[--n-faint] hover:text-[--n-low] hover:bg-[--n-hover] cursor-pointer"
                >
                  ×
                </span>
              </button>
            );
          })}

          {/* New tab */}
          <button
            className="w-[24px] h-[24px] flex items-center justify-center rounded-[6px] border cursor-pointer hover:bg-[--n-hover] transition-colors shrink-0"
            style={{ borderColor: 'var(--n-line2)', color: 'var(--n-low)' }}
            aria-label="New tab"
          >
            <Plus size={11} />
          </button>
        </div>

        <div className="flex items-center gap-[4px] shrink-0">
          <IconButton icon={SplitSquareHorizontal} label="Split editor" size={13} />
          <IconButton icon={MoreHorizontal} label="More options" size={13} />
        </div>
      </div>

      {/* Path bar */}
      {workspace.activeTab && (
        <div
          className="flex items-center justify-between px-[14px] shrink-0"
          style={{ height: 26, borderBottom: '1px solid var(--n-line)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          <div className="flex items-center gap-[4px] text-[10.5px] min-w-0">
            {pathSegments.map((seg, i) => (
              <span key={i} className="flex items-center gap-[4px]">
                {i > 0 && <span style={{ color: 'var(--n-faint)' }}>/</span>}
                <span style={{ color: i === pathSegments.length - 1 ? 'var(--n-mid)' : 'var(--n-faint)' }}>
                  {seg}
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>TSX · UTF-8</span>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {renderBody()}
        <OutputCard />
      </div>
    </div>
  );
}
