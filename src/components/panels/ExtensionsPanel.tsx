import React from 'react';
import { MoreHorizontal, RefreshCw } from 'lucide-react';
import { Segmented, SearchField, Badge, IconButton } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function ExtensionsPanel({ style }: { style?: React.CSSProperties }) {
  const { extensions, selectedExtension, extensionTab, extensionLoading, selectExtension, setExtensionTab } = useAppStore();

  const installed   = extensions.filter((e) => e.installed);
  const marketplace = extensions;

  const list = extensionTab === 'installed' ? installed : marketplace;

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
          Extensions
        </span>
        <div className="flex items-center gap-[4px]">
          <IconButton icon={RefreshCw} label="Refresh" size={12} />
          <IconButton icon={MoreHorizontal} label="More" size={13} />
        </div>
      </div>

      {/* Segmented control */}
      <div className="px-[12px] pt-[8px] pb-[6px] shrink-0">
        <Segmented
          options={[
            { label: 'Installed', value: 'installed', count: installed.length },
            { label: 'Marketplace', value: 'marketplace' },
          ]}
          value={extensionTab}
          onChange={(v) => setExtensionTab(v as 'installed' | 'marketplace')}
        />
      </div>

      {/* Search */}
      <div className="px-[12px] pb-[8px] shrink-0">
        <SearchField placeholder={extensionTab === 'marketplace' ? 'Search extensions…' : 'Filter installed'} className="w-full" />
      </div>

      {/* Extension list */}
      <div className="flex-1 overflow-y-auto px-[4px] flex flex-col gap-[1px]">
        {extensionLoading ? (
          // Skeleton rows
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[9px] px-[7px] rounded-[8px]" style={{ height: 44 }}>
              <div className="rounded-[7px] shrink-0 animate-pulse" style={{ width: 26, height: 26, background: '#1B1B1B' }} />
              <div className="flex flex-col gap-[5px] flex-1">
                <div className="rounded-[3px] animate-pulse" style={{ height: 9, width: 96 + i * 8, background: '#161616' }} />
                <div className="rounded-[3px] animate-pulse" style={{ height: 7, width: 58 + i * 5, background: '#141414' }} />
              </div>
              <div className="rounded-[6px] animate-pulse" style={{ width: 28, height: 12, background: '#1B1B1B' }} />
            </div>
          ))
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-[20px] gap-[8px]">
            <div className="w-[40px] h-[40px] rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--n-line2)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--n-faint)" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <span className="text-[12.5px] font-semibold" style={{ color: 'var(--n-hi)' }}>No extensions found</span>
            <button className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>Open marketplace</button>
          </div>
        ) : (
          list.map((ext) => (
            <button
              key={ext.id}
              onClick={() => selectExtension(ext.id)}
              className="flex items-center gap-[9px] px-[7px] rounded-[8px] cursor-pointer transition-colors"
              style={{
                height: 44,
                background: selectedExtension === ext.id ? 'var(--n-hover)' : 'transparent',
              }}
            >
              {/* Icon */}
              <div className="flex items-center justify-center rounded-[7px] shrink-0"
                style={{
                  width: 26, height: 26,
                  background: selectedExtension === ext.id ? 'var(--n-paper)' : 'var(--n-active)',
                  border: '1px solid var(--n-line2)',
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={selectedExtension === ext.id ? 'var(--n-on-paper)' : 'var(--n-mid)'}
                  strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11.5px] truncate" style={{
                  color: 'var(--n-hi)',
                  fontWeight: selectedExtension === ext.id ? 600 : 400,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {ext.name}
                </p>
                <p className="text-[9.5px] truncate" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {ext.publisher}
                </p>
              </div>

              {/* Status */}
              {ext.installed && !ext.updateAvailable && (
                <Badge variant="installed">Installed</Badge>
              )}
              {ext.updateAvailable && (
                <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--n-warn)' }} />
              )}
              {!ext.installed && (
                <span className="text-[9.5px] px-[6px] py-[2px] rounded-[5px] border cursor-pointer hover:bg-[--n-hover]"
                  style={{ color: 'var(--n-low)', borderColor: 'var(--n-line2)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Install
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer: installed count + update all */}
      {extensionTab === 'installed' && installed.length > 0 && (
        <div className="flex items-center justify-between px-[14px] py-[8px] shrink-0" style={{ borderTop: '1px solid var(--n-line)' }}>
          <span className="text-[9.5px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {installed.length} installed
          </span>
          {installed.some((e) => e.updateAvailable) && (
            <button className="text-[9.5px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Update all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
