import { Lock, X } from 'lucide-react';
import { Button, Checkbox } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';

export function PermissionDialog() {
  const { extensions, permissionDialogFor, installExtension, closePermissionDialog } = useAppStore();
  const [remember, setRemember] = useState(false);

  const ext = extensions.find((e) => e.id === permissionDialogFor);
  if (!ext) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: '#080808B8' }}
      onClick={closePermissionDialog}
    >
      <div
        className="rounded-[16px] border p-[20px] flex flex-col gap-[16px]"
        style={{
          width: 470,
          background: 'var(--n-card)',
          borderColor: 'var(--n-line2)',
        }}
        role="dialog"
        aria-modal
        aria-label="Extension permissions"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-[12px]">
          <div className="flex items-center justify-center rounded-[9px] shrink-0"
            style={{ width: 34, height: 34, background: 'var(--n-active)' }}>
            <Lock size={15} color="var(--n-mid)" />
          </div>
          <div className="flex-1">
            <h2 className="text-[14px] font-semibold mb-[2px]" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Allow {ext.name}?
            </h2>
            <p className="text-[9.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
              {ext.version} · {ext.publisher}
            </p>
          </div>
          <button onClick={closePermissionDialog} aria-label="Close" className="text-[--n-faint] hover:text-[--n-low]">
            <X size={13} />
          </button>
        </div>

        {/* Permissions card */}
        <div className="rounded-[10px] border p-[10px_12px] flex flex-col gap-[10px]"
          style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
          <span className="text-[9.5px] font-semibold tracking-[1.1px] uppercase"
            style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            This extension requires
          </span>
          {ext.permissions.map((perm) => (
            <div key={perm} className="flex items-start gap-[10px]">
              <div className="flex items-center justify-center rounded-[6px] shrink-0"
                style={{ width: 24, height: 24, background: 'var(--n-active)', border: '1px solid var(--n-line)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-mid)" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {perm}
                </p>
                <p className="text-[9.5px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.45 }}>
                  {perm === 'Read workspace files'
                    ? 'Access files in your current workspace for analysis'
                    : perm === 'Write workspace files'
                    ? 'Create and modify files in your workspace'
                    : 'Make requests to external services'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Remember */}
        <Checkbox
          checked={remember}
          onChange={setRemember}
          label="Remember for this workspace"
          size={14}
        />

        {/* Footer */}
        <div className="flex items-center gap-[8px]">
          <span className="text-[9px] flex-1" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            You can revoke permissions in extension settings
          </span>
          <Button variant="ghost" onClick={closePermissionDialog}>Cancel</Button>
          <Button variant="primary" onClick={() => installExtension(ext.id)}>Allow &amp; install</Button>
        </div>
      </div>
    </div>
  );
}
