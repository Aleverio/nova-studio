import { ChevronRight } from 'lucide-react';
import { mockDiffLines } from '../../data/mockData';

export function DiffView() {
  return (
    <div className="flex-1 overflow-auto" style={{ paddingTop: 8 }}>
      {/* File header */}
      <div
        className="flex items-center px-[14px] gap-[8px] mb-[4px]"
        style={{
          height: 30,
          background: 'var(--n-raise)',
          borderTop: '1px solid var(--n-line)',
          borderBottom: '1px solid var(--n-line)',
        }}
      >
        <ChevronRight size={11} color="var(--n-faint)" />
        <span className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          createSession.ts
        </span>
        <div className="flex-1" />
        <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-add)' }}>+18</span>
        <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-del)' }}>−4</span>
        <button
          className="flex items-center gap-[3px] px-[5px] py-[2px] rounded-[4px] text-[9px] cursor-pointer hover:bg-[--n-hover]"
          style={{ background: 'var(--n-active)', color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Stage file
        </button>
      </div>

      {/* Diff lines */}
      {mockDiffLines.map((dl, i) => {
        if (dl.type === 'hunk') {
          return (
            <div key={i}
              className="flex items-center px-[18px] gap-[8px]"
              style={{ height: 24, background: 'var(--n-card)' }}
            >
              <span className="text-[9.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
                {dl.old}
              </span>
              <div className="flex-1" />
              <button
                className="flex items-center gap-[3px] text-[9px] cursor-pointer hover:opacity-80"
                style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <span>+</span> Stage hunk
              </button>
            </div>
          );
        }

        const isAdd = dl.type === 'add';
        const isRemove = dl.type === 'remove';

        return (
          <div key={i}
            className="flex items-center"
            style={{
              height: 20,
              background: isAdd ? '#101513' : isRemove ? '#151112' : 'transparent',
              paddingLeft: 18,
              paddingRight: 18,
            }}
          >
            {/* Old line number */}
            <span className="w-[18px] text-right mr-[8px] text-[9px] font-['JetBrains_Mono',monospace] select-none shrink-0"
              style={{ color: '#3E3E3E' }}>
              {'oldNo' in dl && dl.oldNo != null ? dl.oldNo : ''}
            </span>
            {/* New line number */}
            <span className="w-[18px] text-right mr-[8px] text-[9px] font-['JetBrains_Mono',monospace] select-none shrink-0"
              style={{ color: '#3E3E3E' }}>
              {'newNo' in dl && dl.newNo != null ? dl.newNo : ''}
            </span>
            {/* Sign */}
            <span className="w-[8px] mr-[4px] text-[8px] select-none shrink-0"
              style={{ color: isAdd ? 'var(--n-add)' : isRemove ? 'var(--n-del)' : 'transparent' }}>
              {isAdd ? '+' : isRemove ? '−' : ' '}
            </span>
            {/* Code */}
            <span className="text-[11px] font-['JetBrains_Mono',monospace]"
              style={{ color: isAdd ? '#CFCFCF' : isRemove ? '#A9A9A9' : 'var(--n-mid)' }}>
              {'content' in dl ? dl.content : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
