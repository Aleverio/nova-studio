import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { IconButton } from '../primitives';
import { Terminal } from './Terminal';

const OPEN_HEIGHT = 140;
const HEADER_HEIGHT = 34;

export function OutputCard() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className="shrink-0 border-t overflow-hidden flex flex-col"
      style={{
        background: '#0B0B0B',
        borderColor: 'var(--n-line2)',
        height: isOpen ? OPEN_HEIGHT : HEADER_HEIGHT,
        transition: 'height 0.18s ease',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-[12px] gap-[8px] shrink-0 cursor-pointer"
        style={{ height: HEADER_HEIGHT, borderBottom: isOpen ? '1px solid var(--n-line)' : 'none' }}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--n-low)' }} />
        <span
          className="text-[9.5px] font-semibold tracking-[1.1px] uppercase select-none"
          style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Terminal
        </span>
        <div className="flex-1" />
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-[4px]">
          <IconButton icon={Plus} label="New terminal" size={12} />
          <IconButton icon={Trash2} label="Clear terminal" size={12} />
        </div>
        <button
          aria-label={isOpen ? 'Collapse terminal' : 'Expand terminal'}
          className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] hover:bg-[--n-hover] transition-colors"
          style={{ color: 'var(--n-faint)' }}
          onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {/* Terminal body */}
      {isOpen && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <Terminal />
        </div>
      )}
    </div>
  );
}
