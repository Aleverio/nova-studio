import React from 'react';
import { useState } from 'react';
import { Search, X, Pin, Plus, AtSign, Smile } from 'lucide-react';
import { Avatar } from '../primitives';
import { useAppStore } from '../../store/useAppStore';

export function RoomPanel({ style }: { style?: React.CSSProperties }) {
  const { room, sendMessage, clearTyping } = useAppStore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    clearTyping();
    setInput('');
  };

  return (
    <div
      className="flex flex-col rounded-[12px] border overflow-hidden h-full" style={{ background: 'var(--n-card)', borderColor: 'var(--n-line)', ...style }}
    >
      {/* Header */}
      <div className="flex items-center px-[14px] gap-[8px] shrink-0" style={{ height: 52, borderBottom: '1px solid var(--n-line)' }}>
        {/* # mark */}
        <div className="flex items-center justify-center rounded-[6px] shrink-0 font-['JetBrains_Mono',monospace] font-semibold text-[13px]"
          style={{ width: 26, height: 26, background: 'var(--n-active)', color: 'var(--n-mid)' }}>
          #
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>{room.name}</p>
          <p className="text-[10px]" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {room.online} online · {room.members} members
          </p>
        </div>

        <button aria-label="Search in room" className="text-[--n-faint] hover:text-[--n-low]"><Search size={13} /></button>
        <button aria-label="Close room" className="text-[--n-faint] hover:text-[--n-low]"><X size={13} /></button>
      </div>

      {/* Pinned bar */}
      <div className="flex items-center px-[14px] gap-[6px] shrink-0"
        style={{ height: 28, background: '#0F0F0F', borderBottom: '1px solid var(--n-line)' }}>
        <Pin size={11} color="var(--n-faint)" />
        <span className="text-[10.5px] flex-1 truncate" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
          3 pinned messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[14px] py-[10px] flex flex-col gap-[12px]">
        {room.messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-[9px]">
            <Avatar initials={msg.initials} variant={msg.own ? 'paper' : 'neutral'} size={24} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-[6px] mb-[2px]">
                <span className="text-[11.5px] font-semibold" style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {msg.author}
                </span>
                <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)' }}>
                  {msg.time}
                </span>
              </div>
              <p className="text-[11.5px]" style={{ color: 'var(--n-mid)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.55 }}>
                {msg.text}
              </p>
              {/* Attachment */}
              {msg.attachment && (
                <div className="flex items-center gap-[6px] mt-[6px] px-[8px] py-[5px] rounded-[7px] border cursor-pointer"
                  style={{ background: '#0F0F0F', borderColor: 'var(--n-line)' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--n-low)" strokeWidth="2">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  </svg>
                  <span className="text-[9.5px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>
                    {msg.attachment.name}
                  </span>
                  <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-add)' }}>
                    {msg.attachment.stat}
                  </span>
                </div>
              )}
              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex items-center gap-[4px] mt-[4px]">
                  {msg.reactions.map((r) => (
                    <span key={r.emoji}
                      className="flex items-center gap-[4px] px-[6px] py-[2px] rounded-[10px] border cursor-pointer hover:bg-[--n-hover]"
                      style={{ background: 'var(--n-raise)', borderColor: 'var(--n-line2)' }}>
                      <span style={{ fontSize: 9.5 }}>{r.emoji}</span>
                      <span className="text-[9px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-mid)' }}>{r.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {room.typing.length > 0 && (
          <div className="flex items-center gap-[6px] pl-[33px]">
            <span className="text-[11px] font-['JetBrains_Mono',monospace]" style={{ color: 'var(--n-faint)', letterSpacing: 2 }}>···</span>
            <span className="text-[10.5px] italic" style={{ color: 'var(--n-faint)', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {room.typing.join(', ')} {room.typing.length > 1 ? 'are' : 'is'} typing
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
            placeholder={`Message #${room.name}`}
            rows={2}
            disabled={room.offline}
            className="w-full resize-none bg-transparent text-[11px] outline-none placeholder:text-[--n-faint] disabled:opacity-50"
            style={{ color: 'var(--n-hi)', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.5 }}
          />
          <div className="flex items-center gap-[6px]">
            <button aria-label="Attach file" className="text-[--n-faint] hover:text-[--n-low]"><Plus size={13} /></button>
            <button aria-label="Mention" className="text-[--n-faint] hover:text-[--n-low]"><AtSign size={13} /></button>
            <button aria-label="Emoji" className="text-[--n-faint] hover:text-[--n-low]"><Smile size={13} /></button>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={!input.trim() || room.offline}
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
        {room.offline && (
          <p className="text-[9.5px] text-center mt-[4px]" style={{ color: 'var(--n-del)', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Reconnecting…
          </p>
        )}
      </div>
    </div>
  );
}

