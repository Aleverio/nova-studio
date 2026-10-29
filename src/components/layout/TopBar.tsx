import { FolderGit2, ChevronDown, Search, Play, Moon, Sun } from 'lucide-react';
import { Avatar, Divider, Keycap } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function TopBar() {
  const { workspace, openPalette, theme, toggleTheme } = useAppStore();

  return (
    <header
      className="w-full shrink-0 flex items-center gap-[12px] px-[14px]"
      style={{ height: 'var(--topbar-h)', borderBottom: '1px solid var(--n-line)' }}
    >
      {/* Brand — icon + wordmark */}
      <div className="flex items-center gap-[8px] flex-1 min-w-0">
        {/* App icon (SVG inline, scaled to 20px) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 320"
          width="20"
          height="20"
          style={{ borderRadius: 4, flexShrink: 0 }}
          aria-hidden="true"
        >
          <rect width="320" height="320" fill="#0C0C0C"/>
          <path fill="#EDEDED" d="M52 52L106 52L106 268L52 268ZM214 52L268 52L268 268L214 268Z"/>
          <path fill="#9A9A9A" d="M52 52L120 52L268 268L200 268Z"/>
          <path fill="#FFFFFF" d="M106 130.811L52 52L106 52ZM214 189.189L268 268L214 268Z"/>
        </svg>

        {/* Wordmark */}
        <span
          className="text-[15px] font-semibold tracking-[-0.4px] select-none shrink-0"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <span style={{ color: 'var(--n-hi)' }}>nova</span>
          <span style={{ color: 'var(--n-low)' }}>.</span>
        </span>

        <Divider vertical />

        {/* Workspace pill */}
        <div className="flex items-center gap-[6px] px-[9px] py-[5px] rounded-[8px] border cursor-pointer hover:bg-[--n-hover] transition-colors shrink-0"
          style={{ background: 'var(--n-raise)', borderColor: 'var(--n-line)' }}>
          <FolderGit2 size={12} color="var(--n-low)" />
          <span className="text-[11px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>
            {workspace.repo}
          </span>
          <ChevronDown size={11} color="var(--n-faint)" />
        </div>
      </div>

      {/* Center: Command bar — scales between 300px and 520px */}
      <button
        onClick={openPalette}
        className="flex items-center justify-between h-[32px] px-[10px] rounded-[8px] border cursor-pointer shrink-0 hover:border-[--n-line2] transition-colors"
        style={{ width: 'clamp(300px, 32vw, 520px)', background: 'var(--n-card)', borderColor: 'var(--n-line2)' }}
        aria-label="Open command palette"
      >
        <div className="flex items-center gap-[7px]">
          <Search size={13} color="var(--n-low)" />
          <span className="text-[11.5px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Search commands, files, symbols…
          </span>
        </div>
        <div className="flex items-center gap-[3px]">
          <Keycap>⌘</Keycap>
          <Keycap>K</Keycap>
        </div>
      </button>

      {/* Right: presence + actions */}
      <div className="flex items-center gap-[10px] flex-1 justify-end min-w-0">
        {/* Presence stack */}
        <div className="relative h-[24px]" style={{ width: 64 }}>
          {[
            { initials: 'AR', offset: 0,  variant: 'paper' as const },
            { initials: 'JK', offset: 20, variant: 'neutral' as const },
            { initials: 'MC', offset: 40, variant: 'neutral' as const },
          ].map(({ initials, offset, variant }) => (
            <span
              key={initials}
              className="absolute"
              style={{
                left: offset,
                top: 0,
                outline: '2px solid var(--n-bg)',
                borderRadius: '50%',
              }}
            >
              <Avatar initials={initials} variant={variant} size={24} />
            </span>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-[28px] h-[28px] flex items-center justify-center rounded-[8px] border cursor-pointer hover:bg-[--n-hover] transition-colors"
          style={{ borderColor: 'var(--n-line2)', color: 'var(--n-mid)' }}
        >
          {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>

        {/* Share */}
        <button
          className="flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] border text-[11.5px] cursor-pointer hover:bg-[--n-hover] transition-colors"
          style={{ borderColor: 'var(--n-line2)', color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif' }}
          aria-label="Share workspace"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
          Share
        </button>

        {/* Run */}
        <button
          className="flex items-center gap-[5px] px-[11px] py-[7px] rounded-[8px] text-[11.5px] font-semibold cursor-pointer hover:opacity-90 transition-opacity shrink-0"
          style={{ background: 'var(--n-paper)', color: 'var(--n-on-paper)', fontFamily: 'Inter, system-ui, sans-serif' }}
          aria-label="Run project"
        >
          <Play size={11} />
          Run
        </button>
      </div>
    </header>
  );
}
