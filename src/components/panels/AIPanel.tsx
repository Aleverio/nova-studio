import React from 'react';
import { useState } from 'react';
import { History, X, Plus } from 'lucide-react';
import { Button, Spinner, Keycap } from '../primitives';
import { useAppStore } from '../../store/useAppStore';
import type { AIMessage } from '../../types';

function PatchCard({ message }: { message: AIMessage }) {
  const { applyPatch, dismissPatch } = useAppStore();
  const patch = message.patch!;

  if (patch.status === 'dismissed') {
    return (
      <div className="text-[10.5px] italic" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Patch dismissed
      </div>
    );
  }

  if (patch.status === 'applied') {
    return (
      <div className="flex items-center gap-[6px] text-[10.5px]" style={{ color: 'var(--n-add)', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        Patch applied
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border overflow-hidden" style={{ background: '#0F0F0F', borderColor: 'var(--n-line2)' }}>
      {/* Header */}
      <div className="flex items-center px-[12px] gap-[8px]" style={{ height: 28, borderBottom: '1px solid var(--n-line)' }}>
        <span className="text-[9px] font-semibold tracking-[1.1px] uppercase" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Patch</span>
        <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-add)' }}>+{patch.adds}</span>
        <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-del)' }}>−{patch.removes}</span>
      </div>

      {/* Diff lines */}
      <div className="px-[12px] py-[6px]">
        {patch.lines.map((line, i) => (
          <div key={i} className="flex items-center text-[10px] font-['JetBrains_Mono',monospace]" style={{ height: 19 }}>
            <span className="w-[8px] shrink-0 mr-[6px]"
              style={{ color: line.type === 'add' ? 'var(--n-add)' : line.type === 'remove' ? 'var(--n-del)' : 'transparent' }}>
              {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
            </span>
            <span style={{
              color: line.type === 'add' ? '#CFCFCF' : line.type === 'remove' ? '#A9A9A9' : 'var(--n-mid)',
            }}>
              {line.content}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center px-[12px] gap-[8px]" style={{ height: 34, borderTop: '1px solid var(--n-line)' }}>
        <Button variant="primary" size="sm" onClick={() => applyPatch(patch.id)}>Apply</Button>
        <button
          onClick={() => dismissPatch(patch.id)}
          className="text-[10px] cursor-pointer hover:opacity-80"
          style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Dismiss
        </button>
        <div className="flex-1" />
        <Keycap>⌘↵</Keycap>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: AIMessage }) {
  if (msg.role === 'user') {
    return (
      <div>
        <p className="text-[9px] font-semibold tracking-[1.2px] uppercase mb-[6px]"
          style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>You</p>
        <div className="rounded-[10px_10px_2px_10px] px-[12px] py-[10px] text-[11.5px]"
          style={{ background: 'var(--n-raise)', color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.55 }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-[6px] mb-[6px]">
        {/* Nova icon mark (inline in message) */}
        <div className="flex items-center justify-center rounded-[3px] shrink-0 overflow-hidden"
          style={{ width: 14, height: 14 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="14" height="14">
            <rect width="320" height="320" fill="#0C0C0C"/>
            <path fill="#EDEDED" d="M52 52L106 52L106 268L52 268ZM214 52L268 52L268 268L214 268Z"/>
            <path fill="#9A9A9A" d="M52 52L120 52L268 268L200 268Z"/>
            <path fill="#FFFFFF" d="M106 130.811L52 52L106 52ZM214 189.189L268 268L214 268Z"/>
          </svg>
        </div>
        <span className="text-[9px] font-semibold tracking-[1.2px] uppercase" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>Nova</span>
        {msg.latency && <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>{msg.latency}</span>}
      </div>

      <div className="flex flex-col gap-[10px]">
        <p className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}>
          {msg.content}
        </p>

        {msg.patch && <PatchCard message={msg} />}

        {msg.plan && (
          <div>
            <span className="text-[9px] font-semibold tracking-[1.2px] uppercase mb-[6px] block"
              style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>Plan</span>
            <div className="flex flex-col gap-[4px]">
              {msg.plan.map((step, i) => (
                <div key={i} className="flex items-center gap-[8px]">
                  <div className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 14, height: 14,
                      background: step.done ? 'var(--n-paper)' : 'transparent',
                      border: step.done ? 'none' : '1px solid var(--n-line2)',
                    }}>
                    {step.done && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--n-on-paper)" strokeWidth="3">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[11px]" style={{
                    color: step.done ? 'var(--n-mid)' : 'var(--n-low)',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    textDecoration: step.done ? 'line-through' : 'none',
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIPanel({ style }: { style?: React.CSSProperties }) {
  const { ai, sendAIMessage } = useAppStore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendAIMessage(input);
    setInput('');
  };

  return (
    <div
      className="flex flex-col rounded-[12px] border overflow-hidden h-full" style={{ background: 'var(--n-card)', borderColor: 'var(--n-line)', ...style }}
    >
      {/* Header */}
      <div className="flex items-center px-[14px] gap-[8px] shrink-0" style={{ height: 52, borderBottom: '1px solid var(--n-line)' }}>
        {/* Nova icon mark */}
        <div className="flex items-center justify-center rounded-[6px] shrink-0 overflow-hidden"
          style={{ width: 26, height: 26 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="26" height="26">
            <rect width="320" height="320" fill="#0C0C0C"/>
            <path fill="#EDEDED" d="M52 52L106 52L106 268L52 268ZM214 52L268 52L268 268L214 268Z"/>
            <path fill="#9A9A9A" d="M52 52L120 52L268 268L200 268Z"/>
            <path fill="#FFFFFF" d="M106 130.811L52 52L106 52ZM214 189.189L268 268L214 268Z"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>Nova</p>
          <p className="text-[10px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>agent · session</p>
        </div>

        <button aria-label="History" className="text-[--n-faint] hover:text-[--n-low]"><History size={13} /></button>
        <button aria-label="Close panel" className="text-[--n-faint] hover:text-[--n-low]"><X size={13} /></button>
      </div>

      {/* Context row */}
      <div className="flex items-center px-[14px] py-[8px] shrink-0" style={{ borderBottom: '1px solid var(--n-line)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-low)" strokeWidth="2" className="shrink-0">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        </svg>
        <span className="text-[10.5px] ml-[6px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {ai.contextFiles} files in context
        </span>
        <div className="flex-1" />
        <span className="text-[9.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
          {ai.contextTokens}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[14px] py-[12px] flex flex-col gap-[13px]">
        {ai.messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {ai.thinking && (
          <div className="flex items-center gap-[8px]">
            <Spinner size={12} />
            <span className="text-[10.5px] italic" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              Nova is thinking…
            </span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="px-[12px] py-[10px] shrink-0" style={{ borderTop: '1px solid var(--n-line)' }}>
        <div className="rounded-[12px] border p-[10px] flex flex-col gap-[8px]"
          style={{ background: 'var(--n-raise)', borderColor: 'var(--n-line2)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Ask Nova, or type @ for context"
            rows={2}
            className="w-full resize-none bg-transparent text-[11px] outline-none placeholder:text-[--n-faint]"
            style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5 }}
          />
          <div className="flex items-center gap-[6px]">
            {/* Plus chip */}
            <div className="flex items-center justify-center rounded-[4px] cursor-pointer hover:bg-[--n-hover]"
              style={{ width: 20, height: 20, border: '1px solid var(--n-line2)' }}>
              <Plus size={10} color="var(--n-faint)" />
            </div>
            <span className="text-[10px]" style={{ color: 'var(--n-low)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {ai.mode === 'plan' ? 'Plan mode' : 'Agent mode'}
            </span>
            <div className="flex-1" />
            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || ai.thinking}
              aria-label="Send message"
              className="flex items-center justify-center rounded-[7px] cursor-pointer hover:opacity-90 disabled:opacity-40"
              style={{ width: 24, height: 24, background: 'var(--n-paper)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--n-on-paper)" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

