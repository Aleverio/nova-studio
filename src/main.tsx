import React from 'react';
import ReactDOM from 'react-dom/client';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { NOVA_DARK_THEME, NOVA_LIGHT_THEME } from './lib/monacoThemes';
import App from './App';
import './styles/tokens.css';

// Tell @monaco-editor/react to use the bundled monaco instance
loader.config({ monaco });

// Register themes after Monaco services are initialized — prevents white flash
loader.init().then((m) => {
  m.editor.defineTheme('nova-dark', NOVA_DARK_THEME);
  m.editor.defineTheme('nova-light', NOVA_LIGHT_THEME);
});

// Apply initial theme before React renders — eliminates FOUC
const savedTheme = localStorage.getItem('nova-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme ?? (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
