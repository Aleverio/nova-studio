/**
 * ResizeHandle
 *
 * A slim drag zone between panels.
 * Total visual footprint: 2px margin-left + 4px hit area + 2px margin-right = 8px gap.
 * This matches `--gap` so the spacing looks identical to the gap between other elements.
 */
import React, { type MouseEvent as ReactMouseEvent } from 'react';

interface ResizeHandleProps {
  onMouseDown:   (e: ReactMouseEvent) => void;
  onDoubleClick?: () => void;
  side: 'left' | 'right';
}

export function ResizeHandle({ onMouseDown, onDoubleClick, side }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown as React.MouseEventHandler<HTMLDivElement>}
      onDoubleClick={onDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label={side === 'left' ? 'Resize left panel' : 'Resize right panel'}
      style={{
        /* 4px hit area + 2px margin each side = 8px total ≈ var(--gap) */
        width: 4,
        marginLeft: 2,
        marginRight: 2,
        flexShrink: 0,
        cursor: 'col-resize',
        position: 'relative',
        zIndex: 10,
        alignSelf: 'stretch',
      }}
    >
      {/* Indicator line — centre of the hit area, shown on hover */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          bottom: 8,
          left: 1,
          right: 1,
          borderRadius: 2,
          background: 'var(--n-line2)',
          opacity: 0,
          transition: 'opacity 150ms ease, background 150ms ease',
          pointerEvents: 'none',
        }}
        className="resize-indicator"
      />

      {/* Wider invisible hover zone so cursor doesn't need to be pixel-perfect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: -4,
          right: -4,
        }}
      />

      <style>{`
        [role="separator"]:hover .resize-indicator {
          opacity: 1 !important;
          background: var(--n-low) !important;
        }
        [role="separator"]:active .resize-indicator {
          opacity: 1 !important;
          background: var(--n-paper) !important;
        }
      `}</style>
    </div>
  );
}
