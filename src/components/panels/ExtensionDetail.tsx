import { ExternalLink, MoreHorizontal, Check } from 'lucide-react';
import { Button, Tag, Switch } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function ExtensionDetail() {
  const { extensions, selectedExtension, openPermissionDialog, uninstallExtension } = useAppStore();
  const ext = extensions.find((e) => e.id === selectedExtension);

  if (!ext) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-[16px]">
        <div className="w-[64px] h-[64px] rounded-[18px] border flex items-center justify-center"
          style={{ background: 'var(--n-active)', borderColor: 'var(--n-line2)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--n-faint)" strokeWidth="1.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold mb-[8px]" style={{ color: 'var(--n-hi)' }}>Browse extensions</p>
          <p className="text-[12px]" style={{ color: 'var(--n-low)', lineHeight: 1.65, maxWidth: 340 }}>
            Select an extension from the panel to view its details, settings, and changelog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero section */}
      <div className="px-[24px] py-[20px] border-b" style={{ borderColor: 'var(--n-line)' }}>
        <div className="flex items-start gap-[20px]">
          {/* Icon tile */}
          <div className="flex items-center justify-center rounded-[18px] border shrink-0"
            style={{ width: 72, height: 72, background: 'var(--n-active)', borderColor: 'var(--n-line2)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--n-mid)" strokeWidth="1.5">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[8px] flex-wrap mb-[4px]">
              <h1 className="text-[23px] font-semibold tracking-[-0.5px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {ext.name}
              </h1>
              {ext.publisher === 'nova-tools' && (
                <span className="flex items-center gap-[3px] text-[9px] font-semibold px-[5px] py-[2px] rounded-[4px] border"
                  style={{ color: 'var(--n-add)', borderColor: 'var(--n-add)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <Check size={9} /> Verified
                </span>
              )}
            </div>

            {/* Meta row */}
            <p className="text-[11px] mb-[8px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {ext.publisher}
              <span style={{ color: '#333', margin: '0 5px' }}>·</span>
              {ext.installs} installs
              <span style={{ color: '#333', margin: '0 5px' }}>·</span>
              ★ {ext.rating} ({ext.reviews})
            </p>

            {/* Tags */}
            <div className="flex items-center gap-[4px] flex-wrap mb-[12px]">
              {ext.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-[6px]">
              {ext.installed ? (
                <>
                  <Button variant="primary" size="sm">
                    Installed ▾
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => uninstallExtension(ext.id)}
                  >
                    Uninstall
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openPermissionDialog(ext.id)}
                  >
                    Install
                  </Button>
                  <Button variant="ghost" size="sm">Try in sandbox</Button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-[4px] shrink-0">
            <button aria-label="Open repository" className="text-[--n-faint] hover:text-[--n-low]"><ExternalLink size={13} /></button>
            <button aria-label="More options" className="text-[--n-faint] hover:text-[--n-low]"><MoreHorizontal size={13} /></button>
          </div>
        </div>
      </div>

      {/* Body: two columns */}
      <div className="flex gap-[32px] px-[24px] py-[20px]">
        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
          {/* Overview */}
          <div>
            <h2 className="text-[12.5px] font-semibold mb-[8px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>Overview</h2>
            <p className="text-[12px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.7 }}>
              {ext.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-[12.5px] font-semibold mb-[8px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>Features</h2>
            <div className="flex flex-col gap-[6px]">
              {ext.features.map((f, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <Check size={11} color="var(--n-add)" style={{ marginTop: 2 }} />
                  <span className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Changelog */}
          <div>
            <h2 className="text-[12.5px] font-semibold mb-[8px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>Changelog</h2>
            <div className="flex flex-col gap-[8px]">
              {ext.changelog.map((entry) => (
                <div key={entry.version} className="flex items-start gap-[10px]">
                  <span className="text-[10.5px] font-['JetBrains_Mono',monospace] shrink-0" style={{ color: 'var(--n-mid)', width: 48 }}>{entry.version}</span>
                  <span className="text-[10.5px] shrink-0" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif', width: 80 }}>{entry.date}</span>
                  <span className="text-[11px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>{entry.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-[12px]" style={{ width: 220 }}>
          {/* Details card */}
          <div className="rounded-[10px] border p-[13px_14px] flex flex-col gap-[8px]"
            style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
            <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Details</span>
            {Object.entries(ext.details).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-[8px]">
                <span className="text-[10.5px] capitalize" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>{k}</span>
                <span className="text-[10.5px] font-['JetBrains_Mono',monospace] text-right" style={{ color: 'var(--n-mid)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Settings card */}
          {ext.settings.length > 0 && (
            <div className="rounded-[10px] border p-[13px_14px] flex flex-col gap-[10px]"
              style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
              <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Settings</span>
              {ext.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between gap-[8px]">
                  <span className="text-[10.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}>{setting.label}</span>
                  <Switch checked={setting.value} />
                </div>
              ))}
            </div>
          )}

          {/* Permissions card */}
          {ext.permissions.length > 0 && (
            <div className="rounded-[10px] border p-[13px_14px] flex flex-col gap-[10px]"
              style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
              <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Permissions</span>
              {ext.permissions.map((perm) => (
                <div key={perm} className="flex items-start gap-[8px]">
                  <div className="flex items-center justify-center rounded-[6px] shrink-0"
                    style={{ width: 24, height: 24, background: 'var(--n-active)', border: '1px solid var(--n-line)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-mid)" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <span className="text-[10.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5 }}>{perm}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
