import Editor from '@monaco-editor/react';
import { useAppStore } from '../../store/useAppStore';
import { sampleCode } from '../../data/mockData';

function getLanguage(id: string | undefined): string {
  if (!id) return 'typescript';
  const lower = id.toLowerCase();
  if (lower.endsWith('.tsx') || lower.endsWith('.ts') || id === 'createSession' || id === 'types' || id === 'store') return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
  if (lower.endsWith('.json') || id === 'package-json' || id === 'tsconfig' || id === 'turbo-json') return 'json';
  if (lower.endsWith('.md')   || id === 'readme')    return 'markdown';
  if (lower.endsWith('.yaml') || lower.endsWith('.yml') || id === 'pnpm-lock') return 'yaml';
  if (lower.endsWith('.css'))  return 'css';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.rs'))   return 'rust';
  if (lower.endsWith('.toml')) return 'ini'; // closest Monaco grammar
  return 'plaintext';
}

export function CodeView() {
  const { workspace, fileContents, setFileContent, theme, saveFileContent } = useAppStore();
  const activeId = workspace.activeTab;
  const value    = activeId ? (fileContents[activeId] ?? sampleCode) : sampleCode;

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <Editor
        height="100%"
        language={getLanguage(activeId)}
        value={value}
        // Themes are pre-registered in main.tsx — no flash
        theme={theme === 'light' ? 'nova-light' : 'nova-dark'}
        onChange={(val) => {
          if (activeId && val !== undefined) setFileContent(activeId, val);
        }}
        onMount={(editor, _monaco) => {
          // Ctrl/Cmd+S → save
          editor.addCommand(
            // KeyMod.CtrlCmd | KeyCode.KeyS
            2048 | 49,
            () => {
              if (activeId) saveFileContent(activeId);
            }
          );
        }}
        options={{
          fontSize:                 13,
          fontFamily:               "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures:            true,
          lineHeight:               21,
          lineNumbers:              'on',
          lineNumbersMinChars:      3,
          glyphMargin:              false,
          folding:                  true,
          minimap:                  { enabled: false },
          scrollbar: {
            verticalScrollbarSize:   4,
            horizontalScrollbarSize: 4,
            vertical:                'auto',
            horizontal:              'auto',
            useShadows:              false,
          },
          overviewRulerLanes:       0,
          hideCursorInOverviewRuler:true,
          overviewRulerBorder:      false,
          renderLineHighlight:      'line',
          cursorBlinking:           'phase',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling:          true,
          padding:                  { top: 12, bottom: 150 },
          wordWrap:                 'off',
          renderWhitespace:         'none',
          guides:                   { indentation: false, bracketPairs: false },
          bracketPairColorization:  { enabled: false },
          occurrencesHighlight:     'off',
          selectionHighlight:       false,
          codeLens:                 false,
          contextmenu:              true,
          tabSize:                  2,
          insertSpaces:             true,
          detectIndentation:        true,
          automaticLayout:          true,
          'semanticHighlighting.enabled': false,
        }}
      />
    </div>
  );
}
