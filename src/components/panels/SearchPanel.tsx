import React from 'react';
import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { SearchField, IconButton, Spinner } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function SearchPanel({ style }: { style?: React.CSSProperties }) {
  const { search } = useAppStore();
  const [localQuery, setLocalQuery] = useState(search.query);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { setSearchQuery, runSearch } = useAppStore.getState();
      setSearchQuery(localQuery);
      if (localQuery.trim()) runSearch();
    }, 150);
    return () => clearTimeout(timer);
  }, [localQuery]);

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
          Search
        </span>
        <div className="flex items-center gap-[4px]">
          {search.status === 'searching' && <Spinner />}
          <IconButton icon={RefreshCw} label="Refresh" size={12} />
        </div>
      </div>

      {/* Search input */}
      <div className="px-[12px] pb-[10px] pt-[8px]">
        <SearchField
          placeholder="Search workspace"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-[4px]">
        {search.status === 'done' && search.results.map((result) => (
          <div key={result.file.id} className="mb-[8px]">
            {/* File group header */}
            <div
              className="flex items-center gap-[6px] px-[6px] py-[3px] rounded-[5px] cursor-pointer hover:bg-[--n-hover]"
              style={{ height: 26 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-faint)" strokeWidth="2">
                <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
              </svg>
              <span className="text-[11.5px] flex-1 truncate" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {result.file.name}
              </span>
              <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
                {result.hits.length}
              </span>
            </div>
            {/* Hit rows */}
            {result.hits.map((hit, i) => (
              <div key={i}
                className="flex items-center gap-[7px] px-[8px] rounded-[5px] cursor-pointer hover:bg-[--n-hover]"
                style={{ height: 24 }}
              >
                <span className="text-right font-['JetBrains_Mono',monospace] text-[9px] shrink-0"
                  style={{ width: 14, color: 'var(--n-faint)' }}>{hit.line}</span>
                <span className="text-[9.5px] font-['JetBrains_Mono',monospace] truncate" style={{ color: 'var(--n-low)' }}>
                  {hit.preview}
                </span>
              </div>
            ))}
          </div>
        ))}

        {search.status === 'empty' && (
          <div className="flex flex-col items-center py-[20px] gap-[8px]">
            <div className="w-[40px] h-[40px] rounded-full border flex items-center justify-center"
              style={{ borderColor: 'var(--n-line2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-faint)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--n-hi)' }}>No results</span>
            <p className="text-[10.5px] text-center" style={{ color: 'var(--n-low)', width: 200, lineHeight: 1.6 }}>
              No results for <em>"{search.query}"</em> in the workspace
            </p>
            <button className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>Search all files</button>
          </div>
        )}

        {search.status === 'idle' && (
          <div className="flex flex-col items-center py-[20px] gap-[4px]">
            <p className="text-[10.5px] text-center" style={{ color: 'var(--n-faint)', lineHeight: 1.6 }}>
              Type to search across the workspace
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {search.status === 'done' && (
        <div className="px-[12px] py-[8px] shrink-0" style={{ borderTop: '1px solid var(--n-line)' }}>
          <span className="text-[9.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
            {search.results.reduce((s, r) => s + r.hits.length, 0)} results in {search.results.length} files · {search.durationMs}ms
          </span>
        </div>
      )}
    </div>
  );
}

