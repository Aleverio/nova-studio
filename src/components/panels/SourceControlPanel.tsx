import React from 'react';
import { GitBranch, RefreshCw, Package, Trash2, MoreHorizontal } from 'lucide-react';
import { SectionLabel, Checkbox, Button, IconButton } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function SourceControlPanel({ style }: { style?: React.CSSProperties }) {
  const {
    git, workspace, stageChange, stageAll, setCommitMessage, toggleAmend, toggleSignOff,
    commit, push, pull, openDiscardDialog,
  } = useAppStore();

  const staged   = git.changes.filter((c) => c.staged);
  const unstaged = git.changes.filter((c) => !c.staged);
  const canCommit = git.message.trim().length > 0 && staged.length > 0;

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
          Source Control
        </span>
        <div className="flex items-center gap-[4px]">
          <IconButton icon={RefreshCw} label="Refresh" size={12} />
          <IconButton icon={MoreHorizontal} label="More" size={13} />
        </div>
      </div>

      {/* Branch bar */}
      <div className="px-[10px] py-[8px] shrink-0">
        <div className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[8px] border"
          style={{ background: 'var(--n-raise)', borderColor: 'var(--n-line)' }}>
          <GitBranch size={12} color="var(--n-low)" />
          <span className="text-[11px] font-['JetBrains_Mono',monospace] flex-1" style={{ color: 'var(--n-mid)' }}>
            {workspace.branch}
          </span>
          {git.behind > 0 && (
            <span className="text-[10px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-low)' }}>
              ↓{git.behind}
            </span>
          )}
          {git.commitsToPush > 0 && (
            <span className="text-[10px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-low)' }}>
              ↑{git.commitsToPush}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* STAGED section */}
        {staged.length > 0 && (
          <div className="px-[4px] mb-[4px]">
            <div className="flex items-center gap-[8px] px-[8px] rounded-[6px]" style={{ height: 28 }}>
              <Checkbox
                checked={staged.length === git.changes.length}
                indeterminate={staged.length > 0 && staged.length < git.changes.length}
                onChange={(c) => stageAll(c)}
              />
              <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase flex-1"
                style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Staged ({staged.length})
              </span>
              <button className="px-[5px] py-[2px] rounded-[4px] text-[9px] cursor-pointer"
                style={{ background: 'var(--n-raise)', color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}
                onClick={() => stageAll(false)}>
                Unstage all
              </button>
            </div>
            {staged.map((change) => (
              <div key={change.path}
                className="flex items-center gap-[7px] px-[8px] rounded-[6px] hover:bg-[--n-hover] cursor-pointer"
                style={{ height: 31 }}>
                <Checkbox checked onChange={(c) => stageChange(change.path, c)} />
                <span className="text-[11.5px] flex-1 truncate" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {change.path.split('/').pop()}
                </span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-add)' }}>+{change.adds}</span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-del)' }}>−{change.dels}</span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>{change.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* CHANGES section */}
        {unstaged.length > 0 && (
          <div className="px-[4px] mb-[4px]">
            <div className="flex items-center gap-[8px] px-[8px] rounded-[6px]" style={{ height: 28 }}>
              <Checkbox
                checked={false}
                indeterminate={false}
                onChange={(checked) => unstaged.forEach((ch) => stageChange(ch.path, checked))}
              />
              <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase flex-1"
                style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                Changes ({unstaged.length})
              </span>
              <button className="px-[5px] py-[2px] rounded-[4px] text-[9px] cursor-pointer"
                style={{ background: 'var(--n-raise)', color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}
                onClick={() => stageAll(true)}>
                Stage all
              </button>
            </div>
            {unstaged.map((change) => (
              <div key={change.path}
                className="flex items-center gap-[7px] px-[8px] rounded-[6px] hover:bg-[--n-hover] cursor-pointer"
                style={{ height: 31 }}>
                <Checkbox checked={false} onChange={(c) => stageChange(change.path, c)} />
                <span className="text-[11.5px] flex-1 truncate" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {change.path.split('/').pop()}
                </span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-add)' }}>+{change.adds}</span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-del)' }}>−{change.dels}</span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>{change.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="px-[4px] mt-[4px]">
          <SectionLabel>Actions</SectionLabel>
          <button className="w-full flex items-center gap-[8px] px-[8px] rounded-[6px] hover:bg-[--n-hover] cursor-pointer"
            style={{ height: 26 }}>
            <Package size={11} color="var(--n-low)" />
            <span className="text-[11px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>Stash changes</span>
          </button>
          <button className="w-full flex items-center gap-[8px] px-[8px] rounded-[6px] hover:bg-[--n-hover] cursor-pointer"
            style={{ height: 26 }}
            onClick={openDiscardDialog}>
            <Trash2 size={11} color="var(--n-del)" />
            <span className="text-[11px]" style={{ color: 'var(--n-del)', fontFamily: 'Inter, system-ui, sans-serif' }}>Discard all changes</span>
          </button>
        </div>

        {/* Recent commits */}
        {git.recent.length > 0 && (
          <div className="px-[4px] mt-[4px]">
            <SectionLabel>Recent</SectionLabel>
            {git.recent.map((commit) => (
              <div key={commit.hash}
                className="flex items-center gap-[7px] px-[8px] rounded-[5px] hover:bg-[--n-hover] cursor-pointer"
                style={{ height: 24 }}>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
                  {commit.hash}
                </span>
                <span className="text-[10.5px] flex-1 truncate" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {commit.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commit box */}
      <div className="px-[10px] py-[10px] shrink-0" style={{ borderTop: '1px solid var(--n-line)' }}>
        <div className="rounded-[10px] border p-[9px_10px] flex flex-col gap-[9px]"
          style={{ background: 'var(--n-raise)', borderColor: 'var(--n-line2)' }}>
          <textarea
            value={git.message}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Write a commit message"
            rows={2}
            className="w-full resize-none bg-transparent text-[11px] outline-none placeholder:text-[--n-faint]"
            style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5 }}
          />
          <div className="flex items-center gap-[6px]">
            <button
              className="flex items-center gap-[4px] text-[9.5px] cursor-pointer hover:opacity-80"
              style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}
              onClick={() => {}}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Generate
            </button>
            <div className="flex-1" />
            <Button
              variant="primary"
              size="sm"
              disabled={!canCommit}
              onClick={commit}
            >
              Commit
            </Button>
          </div>
          {/* Options */}
          <div className="flex items-center gap-[10px]">
            <Checkbox checked={git.amend} onChange={toggleAmend} label="Amend" />
            <Checkbox checked={git.signOff} onChange={toggleSignOff} label="Sign-off" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-[6px] px-[14px] py-[10px] shrink-0" style={{ borderTop: '1px solid var(--n-line)' }}>
        {git.commitsToPush > 0 ? (
          <>
            <span className="text-[10.5px] flex-1" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {git.commitsToPush} commit{git.commitsToPush > 1 ? 's' : ''} to push
            </span>
            <Button
              variant="primary"
              size="sm"
              loading={git.syncState === 'pushing'}
              onClick={() => push()}
            >
              Push to main
            </Button>
          </>
        ) : (
          <>
            <span className="text-[10.5px] flex-1" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {git.syncState === 'clean' ? 'Up to date with origin/main' : 'Ready to sync'}
            </span>
            {git.behind > 0 && (
              <Button variant="ghost" size="sm" loading={git.syncState === 'pulling'} onClick={pull}>
                Pull {git.behind}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

