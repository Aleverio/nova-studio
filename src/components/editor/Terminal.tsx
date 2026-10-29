import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

// xterm CSS — diimport di sini agar terbundle dengan benar
import '@xterm/xterm/css/xterm.css';

const NOVA_THEME = {
  background:   '#0B0B0B',
  foreground:   '#A1A1A1',
  cursor:       '#F4F4F4',
  cursorAccent: '#0B0B0B',
  black:        '#080808',
  brightBlack:  '#3E3E3E',
  red:          '#BE8B8B',
  brightRed:    '#BE8B8B',
  green:        '#8FB79E',
  brightGreen:  '#8FB79E',
  yellow:       '#C2A874',
  brightYellow: '#C2A874',
  blue:         '#7A9ABE',
  brightBlue:   '#7A9ABE',
  cyan:         '#7AAEBE',
  brightCyan:   '#7AAEBE',
  magenta:      '#9E7ABE',
  brightMagenta:'#9E7ABE',
  white:        '#DADADA',
  brightWhite:  '#F4F4F4',
};

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef      = useRef<XTerm | null>(null);
  const fitAddonRef  = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme:        NOVA_THEME,
      fontSize:     12,
      fontFamily:   "'JetBrains Mono', monospace",
      lineHeight:   1.4,
      cursorBlink:  true,
      cursorStyle:  'block',
      scrollback:   1000,
      allowTransparency: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    // Welcome message
    term.write('\r\n  \x1b[37mnova studio terminal\x1b[0m  \r\n');
    term.write('  \x1b[2m~/acme/api\x1b[0m \x1b[37m$\x1b[0m ');

    termRef.current     = term;
    fitAddonRef.current = fitAddon;

    // Resize observer to re-fit on container size change
    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {
        // Ignore fit errors during resize
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#0B0B0B',
        overflow: 'hidden',
      }}
    />
  );
}
