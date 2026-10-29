import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, ChevronRight, ChevronDown, FileCode, Folder, FolderOpen, GitBranch } from 'lucide-react';
import { SectionLabel, SearchField, IconButton, Button } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import type { FileNode } from '../../types';

interface FileRowProps {
  node: FileNode;
  depth: number;
  isOpen?: boolean;
  onToggle?: () => void;
  isSelected?: boolean;
  isDirty?: boolean;
  onClick?: () => void;
}

function FileRowItem({ node, depth, isOpen, onToggle, isSelected, isDirty, onClick }: FileRowProps) {
  const paddingLeft = 6 + depth * 11;

  if (node.kind === 'folder') {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-[6px] rounded-[6px] cursor-pointer hover:bg-[--n-hover] transition-colors"
        style={{
          height: 25,
          paddingLeft,
          paddingRight: 8,
          background: isSelected ? 'var(--n-hover)' : 'transparent',
        }}
      >
        {isOpen
          ? <ChevronDown size={11} color="var(--n-faint)" />
          : <ChevronRight size={11} color="var(--n-faint)" />
        }
        {isOpen
          ? <FolderOpen size={11} color="var(--n-low)" />
          : <Folder size={11} color="var(--n-low)" />
        }
        <span className="text-[12px] truncate" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {node.name}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-[6px] rounded-[6px] cursor-pointer transition-colors"
      style={{
        height: 25,
        paddingLeft,
        paddingRight: 8,
        background: isSelected ? 'var(--n-hover)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--n-hover)'; }}
      onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <FileCode size={11} color={isSelected ? 'var(--n-mid)' : 'var(--n-faint)'} />
      <span
        className="text-[12px] truncate flex-1 text-left"
        style={{
          color: isSelected ? 'var(--n-hi)' : 'var(--n-mid)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {node.name}
      </span>
      {isDirty && <span className="w-[4px] h-[4px] rounded-full shrink-0" style={{ background: 'var(--n-low)' }} />}
    </button>
  );
}

function FileTree({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) {
  const { workspace, openFile } = useAppStore();
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
    const topLevel = new Set<string>();
    nodes.forEach((n) => { if (n.kind === 'folder') topLevel.add(n.id); });
    return topLevel;
  });

  useEffect(() => {
    const topLevel = new Set<string>();
    nodes.forEach((n) => { if (n.kind === 'folder') topLevel.add(n.id); });
    setOpenFolders(topLevel);
  }, [nodes.length]);

  const toggle = (id: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <FileRowItem
            node={node}
            depth={depth}
            isOpen={openFolders.has(node.id)}
            onToggle={() => toggle(node.id)}
            isSelected={workspace.activeTab === node.id}
            isDirty={workspace.dirty[node.id]}
            onClick={() => openFile(node.id)}
          />
          {node.kind === 'folder' && openFolders.has(node.id) && node.children && (
            <FileTree nodes={node.children} depth={depth + 1} />
          )}
        </React.Fragment>
      ))}
    </>
  );
}


function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const results: FileNode[] = [];
  for (const node of nodes) {
    if (node.kind === 'file' && node.name.toLowerCase().includes(query)) {
      results.push(node);
    } else if (node.kind === 'folder' && node.children) {
      const filtered = filterTree(node.children, query);
      if (filtered.length > 0) results.push({ ...node, children: filtered });
    }
  }
  return results;
}

export function FilesPanel({ style }: { style?: React.CSSProperties }) {
  const { workspace, workspacePath, openFile, openWorkspace, git } = useAppStore();
  const [filter, setFilter] = useState('');

  const filteredFiles = filter.trim()
    ? filterTree(workspace.files, filter.toLowerCase())
    : workspace.files;

  // Compute git footer stats
  const staged   = git.changes.filter((c) => c.staged).length;
  const modified = git.changes.filter((c) => !c.staged).length;
  const addCount = git.changes.reduce((s, c) => s + (c.adds ?? 0), 0);
  const delCount = git.changes.reduce((s, c) => s + (c.dels ?? 0), 0);

  return (
    <div
      className="flex flex-col rounded-[12px] border overflow-hidden h-full" style={{ background: 'var(--n-card)', borderColor: 'var(--n-line)', ...style }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[14px] shrink-0"
        style={{ height: 44, borderBottom: '1px solid var(--n-line)' }}
      >
        <span className="text-[10px] font-semibold tracking-[1.3px] uppercase" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          Files
        </span>
        <div className="flex items-center gap-[4px]">
          <button
            onClick={openWorkspace}
            className="flex items-center justify-center w-[24px] h-[24px] rounded-[6px] hover:bg-[--n-hover] transition-colors cursor-pointer"
            style={{ color: 'var(--n-low)' }}
            aria-label="Open folder"
            title="Open Folder"
          >
            <FolderOpen size={13} />
          </button>
          <IconButton icon={Plus} label="New file" size={13} />
          <IconButton icon={MoreHorizontal} label="More actions" size={13} />
        </div>
      </div>

      {/* No workspace open — empty state */}
      {!workspacePath ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-[14px] px-[20px]">
          <FolderOpen size={40} color="var(--n-faint)" />
          <p className="text-[11.5px] text-center" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.55 }}>
            Open a folder to start
          </p>
          <Button variant="primary" size="sm" onClick={openWorkspace}>
            Open Folder
          </Button>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="px-[12px] pb-[10px] pt-[8px] shrink-0">
            <SearchField
              placeholder="Filter files"
              shortcut="⌘P"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Open editors */}
          {workspace.openTabs.length > 0 && (
            <div className="px-[4px] flex flex-col gap-[1px]">
              <SectionLabel>Open</SectionLabel>
              {workspace.openTabs.map((tabId) => {
                const isActive = tabId === workspace.activeTab;
                const name = tabId.split(/[/\\]/).pop() ?? tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => openFile(tabId)}
                    className="w-full flex items-center gap-[6px] rounded-[5px] px-[8px] cursor-pointer transition-colors"
                    style={{
                      height: 25,
                      background: isActive ? 'var(--n-hover)' : 'transparent',
                    }}
                  >
                    <FileCode size={13} color={isActive ? 'var(--n-mid)' : 'var(--n-faint)'} />
                    <span className="text-[12.5px] flex-1 text-left" style={{ color: isActive ? 'var(--n-hi)' : 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      {name}
                    </span>
                    {workspace.dirty[tabId] && (
                      <span className="text-[10px]" style={{ color: 'var(--n-faint)' }}>M</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {workspace.openTabs.length > 0 && (
            <div className="w-full h-[1px] my-[4px]" style={{ background: 'var(--n-line)' }} />
          )}

          {/* Workspace tree */}
          <div className="flex-1 px-[4px] overflow-y-auto flex flex-col gap-[1px]">
            <SectionLabel>Workspace</SectionLabel>
            <FileTree nodes={filteredFiles} />
          </div>

          {/* Git footer */}
          <div className="shrink-0 px-[14px] py-[12px]" style={{ borderTop: '1px solid var(--n-line)' }}>
            <div className="flex items-center gap-[6px]">
              <GitBranch size={12} color="var(--n-low)" />
              <span className="text-[11px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>
                {workspace.branch}
              </span>
              {(addCount > 0 || delCount > 0) && (
                <span className="text-[10px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-low)' }}>
                  +{addCount} −{delCount}
                </span>
              )}
            </div>
            <p className="text-[10.5px] mt-[2px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5 }}>
              {staged > 0 ? `${staged} staged · ` : ''}{modified > 0 ? `${modified} modified` : 'clean'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
