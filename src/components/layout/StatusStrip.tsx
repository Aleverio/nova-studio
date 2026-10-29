import { useAppStore } from '../../store/useAppStore';

export function StatusStrip() {
  const { workspace } = useAppStore();

  return (
    <footer
      className="w-full shrink-0 flex items-center justify-between px-[16px]"
      style={{ height: 'var(--status-h)', borderTop: '1px solid var(--n-line)', fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Left group */}
      <div className="flex items-center gap-[14px]">
        <div className="flex items-center gap-[5px]" id="status-branch">
          <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--n-low)' }} />
          <span className="text-[9.5px]" style={{ color: 'var(--n-low)' }}>{workspace.branch}</span>
        </div>
        <span className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>·</span>
        <span className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>0 errors</span>
        <span className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>·</span>
        <span className="text-[9.5px]" style={{ color: 'var(--n-warn)' }}>1 warning</span>
        <span className="text-[9.5px]" style={{ color: 'var(--n-faint)' }}>focus mode</span>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-[14px]">
        {[
          'Ln 14, Col 12',
          'Spaces: 2',
          'UTF-8',
          'nova 2.0',
        ].map((item) => (
          <span key={item} className="text-[9.5px]" style={{ color: 'var(--n-low)' }}>
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}
