import { Search } from 'lucide-react';
import { Button, Keycap } from '../primitives';

export function SearchEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-[16px] px-[24px]">
      <div className="w-[64px] h-[64px] rounded-[18px] border flex items-center justify-center"
        style={{ background: 'var(--n-active)', borderColor: 'var(--n-line2)' }}>
        <Search size={28} color="var(--n-faint)" />
      </div>

      <div className="text-center">
        <p className="text-[15px] font-semibold mb-[8px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          No results found
        </p>
        <p className="text-[12px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.65, maxWidth: 340 }}>
          No files matched your search. Try removing the file type filter or searching all files.
        </p>
      </div>

      <div className="flex items-center gap-[8px]">
        <Button variant="primary" size="sm">Search all files</Button>
        <Button variant="ghost" size="sm">Clear filters</Button>
      </div>

      {/* Shortcut card */}
      <div className="w-[360px] rounded-[10px] border overflow-hidden" style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
        {[
          { label: 'Toggle case sensitive', keys: ['⌥', 'C'] },
          { label: 'Toggle whole word', keys: ['⌥', 'W'] },
          { label: 'Toggle regex', keys: ['⌥', 'R'] },
        ].map((row, i) => (
          <div key={i}
            className="flex items-center justify-between px-[14px]"
            style={{ height: 24, borderBottom: i < 2 ? '1px solid var(--n-line)' : undefined }}>
            <span className="text-[10.5px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {row.label}
            </span>
            <div className="flex items-center gap-[3px]">
              {row.keys.map((k) => <Keycap key={k} small>{k}</Keycap>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
