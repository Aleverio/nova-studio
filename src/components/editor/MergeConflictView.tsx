import { mockConflictCurrent, mockConflictIncoming } from '../../data/mockData';
import { Button } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

function ConflictSide({ label, ref: refName, content, side }: { label: string; ref: string; content: string; side: 'current' | 'incoming' }) {
  return (
    <div className="flex-1 rounded-[10px] border overflow-hidden flex flex-col"
      style={{ background: '#0F0F0F', borderColor: 'var(--n-line2)' }}>
      {/* Header */}
      <div className="flex items-center px-[12px] gap-[8px] shrink-0"
        style={{ height: 32, borderBottom: '1px solid var(--n-line)' }}>
        <span className="text-[10.5px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {label}
        </span>
        <span className="px-[5px] py-[1px] rounded-[4px] text-[9px] font-['JetBrains_Mono',monospace]"
          style={{ background: 'var(--n-active)', color: 'var(--n-low)' }}>
          {refName}
        </span>
      </div>
      {/* Code */}
      <div className="flex-1 overflow-auto p-[10px]">
        {content.split('\n').map((line, i) => (
          <div key={i} className="flex items-center" style={{ height: 21 }}>
            <span className="w-[18px] text-right mr-[16px] text-[9px] select-none shrink-0 font-['JetBrains_Mono',monospace]"
              style={{ color: '#3E3E3E' }}>{i + 1}</span>
            <span className="text-[11.5px] font-['JetBrains_Mono',monospace]"
              style={{ color: 'var(--n-mid)' }}>{line}</span>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-end px-[12px] gap-[6px] shrink-0"
        style={{ height: 30, borderTop: '1px solid var(--n-line)' }}>
        <Button variant="ghost" size="sm">Keep {side === 'current' ? 'current' : 'incoming'}</Button>
        <Button variant="ghost" size="sm">Accept both</Button>
      </div>
    </div>
  );
}

export function MergeConflictView() {
  const { addToast } = useAppStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Conflict toolbar */}
      <div className="flex items-center px-[14px] gap-[8px] shrink-0"
        style={{ height: 32, borderBottom: '1px solid var(--n-line)', background: 'var(--n-raise)' }}>
        <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--n-warn)' }} />
        <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase" style={{ color: 'var(--n-warn)' }}>Conflict</span>
        <span className="text-[10.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>createSession.ts</span>
        <div className="flex-1" />
        <span className="text-[10px]" style={{ color: 'var(--n-faint)' }}>1 of 1</span>
      </div>

      {/* Two-column conflict */}
      <div className="flex flex-1 gap-[8px] p-[12px] overflow-hidden">
        <ConflictSide label="Current" ref="HEAD" content={mockConflictCurrent} side="current" />
        <ConflictSide label="Incoming" ref="feature/reconnect" content={mockConflictIncoming} side="incoming" />
      </div>

      {/* Resolve bar */}
      <div className="flex items-center px-[14px] gap-[8px] shrink-0"
        style={{ height: 44, borderTop: '1px solid var(--n-line)' }}>
        <Button variant="destructive" size="sm">Abort merge</Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm">Open in editor</Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => addToast({ variant: 'success', title: 'Conflict resolved', timeout: 6000 })}
        >
          Mark resolved
        </Button>
      </div>
    </div>
  );
}
