import { AlertTriangle } from 'lucide-react';
import { Button, Checkbox } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';

export function DiscardDialog() {
  const { git, discardAll, closeDiscardDialog } = useAppStore();
  const [deleteUntracked, setDeleteUntracked] = useState(false);

  const affectedFiles = git.changes.map((c) => c.path);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: '#080808B8' }}
      onClick={closeDiscardDialog}
    >
      <div
        className="rounded-[16px] border p-[20px] flex flex-col gap-[16px]"
        style={{
          width: 440,
          background: 'var(--n-card)',
          borderColor: 'var(--n-line2)',
        }}
        role="alertdialog"
        aria-modal
        aria-label="Discard changes confirmation"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-[12px]">
          <div className="flex items-center justify-center rounded-[9px] shrink-0"
            style={{ width: 34, height: 34, background: 'rgba(190,139,139,0.15)' }}>
            <AlertTriangle size={16} color="var(--n-del)" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold mb-[4px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Discard all changes?
            </h2>
            <p className="text-[11px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
              {affectedFiles.length} file{affectedFiles.length > 1 ? 's' : ''} affected
            </p>
          </div>
        </div>

        {/* Body */}
        <p className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.65 }}>
          This will permanently discard all uncommitted changes in your working tree. This action cannot be undone (for 10 seconds).
        </p>

        {/* Files card */}
        <div className="rounded-[10px] border p-[10px_12px] flex flex-col gap-[4px]"
          style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
          {affectedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-[6px]" style={{ height: 22 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-faint)" strokeWidth="2">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
              </svg>
              <span className="text-[10.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Option */}
        <Checkbox
          checked={deleteUntracked}
          onChange={setDeleteUntracked}
          label="Also delete untracked files"
          size={14}
        />

        {/* Footer */}
        <div className="flex items-center gap-[8px] justify-end">
          <span className="text-[9px] flex-1" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            esc to cancel
          </span>
          <Button variant="ghost" onClick={closeDiscardDialog}>Cancel</Button>
          <Button variant="destructive" onClick={discardAll}>Discard changes</Button>
        </div>
      </div>
    </div>
  );
}

