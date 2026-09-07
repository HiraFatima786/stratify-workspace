'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Profile, DailyReportMessage } from '@/lib/types';
import { getDailyReportMessages, sendDailyReportMessage } from '@/lib/data-service';
import { Send, MessageSquare, Shield, User, Sparkles, Tag, CheckCheck } from 'lucide-react';

interface DailyReportsChatProps {
  memberId: string;
  memberName: string;
  currentUser: Profile;
}

export default function DailyReportsChat({
  memberId,
  memberName,
  currentUser,
}: DailyReportsChatProps) {
  const [messages, setMessages] = useState<DailyReportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(-1);

  const loadMessages = async () => {
    const data = await getDailyReportMessages(memberId);
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();

    // Listen to local or cross-window message dispatch
    const handleNewMessage = (e: Event) => {
      const customEvent = e as CustomEvent<{ memberId: string }>;
      if (!customEvent.detail || customEvent.detail.memberId === memberId) {
        loadMessages();
      }
    };

    window.addEventListener('teamsflow_message_sent', handleNewMessage);
    return () => {
      window.removeEventListener('teamsflow_message_sent', handleNewMessage);
    };
  }, [memberId]);

  // Scroll chat container (not the page) to bottom when new messages arrive
  const scrollChatToBottom = (smooth: boolean) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (smooth) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Only auto-scroll when message count actually increases
  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const currentCount = messages.length;
    if (prevCount === -1 && currentCount > 0) {
      // Initial load — jump to bottom instantly
      scrollChatToBottom(false);
    } else if (currentCount > prevCount && prevCount !== -1) {
      // New message arrived — smooth scroll
      scrollChatToBottom(true);
    }
    prevMessageCountRef.current = currentCount;
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendDailyReportMessage(memberId, currentUser, content);
      await loadMessages();
    } finally {
      setSending(false);
    }
  };

  const handleQuickTag = (tag: string) => {
    setInputText((prev) => (prev ? `${prev} ${tag} ` : `${tag} `));
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--accent-blue-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Daily Reports
              </h3>
              <span className="badge badge-active" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                Active Thread
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Daily task updates & coordination for <strong style={{ color: 'var(--text-primary)' }}>{memberName}</strong>
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {messages.length} updates logged
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        style={{
          height: '380px',
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#fafbfc',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              maxWidth: '340px',
            }}
          >
            <Sparkles size={26} color="var(--accent-primary)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No messages in this Daily Report thread yet
            </p>
            <p style={{ fontSize: '0.78rem' }}>
              Post daily objectives, tasks in progress, or any blockers for management.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender_id === currentUser.id;
            const isAdminSender = msg.sender_role === 'admin';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSelf ? 'flex-end' : 'flex-start',
                  gap: '4px',
                }}
              >
                {/* Sender badge and time */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    padding: '0 4px',
                  }}
                >
                  <span style={{ fontWeight: 700, color: isSelf ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                    {isSelf ? 'You' : msg.sender_name}
                  </span>
                  <span className={`badge ${isAdminSender ? 'badge-admin' : 'badge-member'}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                    {isAdminSender ? <Shield size={9} /> : <User size={9} />}
                    {msg.sender_role}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Bubble */}
                <div
                  className="chat-bubble"
                  style={{
                    background: isSelf
                      ? 'var(--accent-blue-soft)'
                      : isAdminSender
                      ? 'var(--accent-purple-soft)'
                      : '#ffffff',
                    border: isSelf
                      ? '1px solid var(--accent-blue-border)'
                      : isAdminSender
                      ? '1px solid #c0b6f2'
                      : '1px solid var(--border-subtle)',
                    color: isSelf
                      ? '#0747a6'
                      : isAdminSender
                      ? '#403294'
                      : 'var(--text-primary)',
                    alignSelf: isSelf ? 'flex-end' : 'flex-start',
                    boxShadow: !isSelf ? 'var(--shadow-sm)' : 'none',
                    fontWeight: 450,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Task Tags */}
      <div
        style={{
          padding: '8px 16px',
          background: '#f4f5f7',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
        }}
      >
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag size={12} /> Tags:
        </span>
        {[
          { label: '#completed', bg: '#e3fcef', text: '#006644', border: '#abf5d1' },
          { label: '#in-progress', bg: '#deebff', text: '#0052cc', border: '#b3d4ff' },
          { label: '#blocker', bg: '#ffebe6', text: '#bf2600', border: '#ffbdad' },
          { label: '#standup', bg: '#fff0b3', text: '#172b4d', border: '#ffe380' },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => handleQuickTag(t.label)}
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              background: t.bg,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '12px 16px',
          background: '#ffffff',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          className="input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => {
            // Prevent the browser from scrolling the page to bring this input into view
            const savedScrollY = window.scrollY;
            requestAnimationFrame(() => {
              window.scrollTo({ top: savedScrollY, behavior: 'instant' });
            });
          }}
          placeholder={`Write message in Daily Reports thread as ${currentUser.full_name}...`}
          style={{ padding: '9px 14px', fontSize: '0.88rem' }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="btn btn-primary"
          style={{ padding: '9px 16px' }}
        >
          <Send size={15} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
