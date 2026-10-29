import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { useBackendEvents } from './hooks/useBackendEvents';
import { usePanelResize } from './hooks/usePanelResize';

// Layout
import { TopBar }        from './components/layout/TopBar';
import { Dock }          from './components/layout/Dock';
import { StatusStrip }   from './components/layout/StatusStrip';
import { ResizeHandle }  from './components/layout/ResizeHandle';

// Editor
import { EditorCard } from './components/editor/EditorCard';

// Panels
import { FilesPanel }         from './components/panels/FilesPanel';
import { SearchPanel }        from './components/panels/SearchPanel';
import { SourceControlPanel } from './components/panels/SourceControlPanel';
import { ExtensionsPanel }    from './components/panels/ExtensionsPanel';
import { AIPanel }            from './components/panels/AIPanel';
import { RoomPanel }          from './components/panels/RoomPanel';

// Overlays
import { CommandPalette }   from './components/overlays/CommandPalette';
import { ToastStack }       from './components/overlays/ToastStack';
import { DiscardDialog }    from './components/overlays/DiscardDialog';
import { PermissionDialog } from './components/overlays/PermissionDialog';

// ─── Left panel switcher ────────────────────────────────────────────────────
function LeftPanel({ width }: { width: number }) {
  const { screen } = useAppStore();

  // Only `width` + `flex-shrink: 0` — no min/max override so the flex
  // container can still account for the handle and editor correctly.
  const panelStyle: React.CSSProperties = {
    width,
    flexShrink: 0,
    height: '100%',
    overflow: 'hidden',
  };

  switch (screen) {
    case 'search':         return <SearchPanel        style={panelStyle} />;
    case 'source-control': return <SourceControlPanel style={panelStyle} />;
    case 'extensions':     return <ExtensionsPanel    style={panelStyle} />;
    default:               return <FilesPanel         style={panelStyle} />;
  }
}

// ─── Right panel switcher ───────────────────────────────────────────────────
function RightPanelSlot({ width }: { width: number }) {
  const { rightPanel } = useAppStore();

  const panelStyle: React.CSSProperties = {
    width,
    flexShrink: 0,
    height: '100%',
    overflow: 'hidden',
  };

  if (rightPanel === 'ai')   return <AIPanel   style={panelStyle} />;
  if (rightPanel === 'room') return <RoomPanel style={panelStyle} />;
  return null;
}

// ─── App root ───────────────────────────────────────────────────────────────
export default function App() {
  const {
    theme, paletteOpen, openPalette, closePalette,
    discardDialogOpen, permissionDialogFor, rightPanel,
  } = useAppStore();

  const { leftWidth, rightWidth, onLeftMouseDown, onRightMouseDown, resetLeft, resetRight } = usePanelResize();

  // Attach backend event listeners
  useBackendEvents();

  // Apply theme to <html> and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nova-theme', theme);
  }, [theme]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const { setScreen, setRightPanel } = useAppStore.getState();

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        paletteOpen ? closePalette() : openPalette();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === 'F' || e.key === 'f') { e.preventDefault(); setScreen('search');         setRightPanel('none'); return; }
        if (e.key === 'X' || e.key === 'x') { e.preventDefault(); setScreen('extensions');    setRightPanel('none'); return; }
        if (e.key === 'R' || e.key === 'r') { e.preventDefault(); setScreen('room');           setRightPanel('room'); return; }
        if (e.key === 'G' || e.key === 'g') { e.preventDefault(); setScreen('source-control'); setRightPanel('none'); return; }
      }
      if (e.key === 'Escape' && paletteOpen) { closePalette(); return; }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paletteOpen]);

  const hasRightPanel = rightPanel !== 'none';

  return (
    <div className="app-shell">
      <TopBar />

      {/* Workspace — panels separated by drag handles */}
      <div className="workspace">
        <Dock />

        <LeftPanel width={leftWidth} />

        <ResizeHandle side="left"  onMouseDown={onLeftMouseDown}  onDoubleClick={resetLeft} />

        <EditorCard />

        {hasRightPanel && (
          <>
            <ResizeHandle side="right" onMouseDown={onRightMouseDown} onDoubleClick={resetRight} />
            <RightPanelSlot width={rightWidth} />
          </>
        )}
      </div>

      <StatusStrip />

      {/* Overlays */}
      {paletteOpen         && <CommandPalette />}
      {discardDialogOpen   && <DiscardDialog />}
      {permissionDialogFor && <PermissionDialog />}
      <ToastStack />
    </div>
  );
}
