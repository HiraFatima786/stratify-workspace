'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DailyUpdate, DailyUpdateComment, Profile } from '@/lib/types';
import { getDailyUpdateComments, addDailyUpdateComment, deleteDailyUpdateComment, toggleDailyUpdateAdminCheck } from '@/lib/data-service';
import { Link2, Trash2, MessageCircle, Send, Shield, User, CheckCircle2 } from 'lucide-react';

interface DailyUpdateCardProps {
  update: DailyUpdate;
  currentUser: Profile;
  idx: number;
  onDelete?: (updateId: string) => void;
  isPastUpdate?: boolean; // If true, changes styling slightly
}

export default function DailyUpdateCard({ update, currentUser, idx, onDelete, isPastUpdate = false }: DailyUpdateCardProps) {
  const [comments, setComments] = useState<DailyUpdateComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [isAdminChecked, setIsAdminChecked] = useState(update.admin_checked || false);

  useEffect(() => {
    setIsAdminChecked(update.admin_checked || false);
  }, [update.admin_checked]);

  const loadComments = useCallback(async () => {
    const data = await getDailyUpdateComments(update.id);
    setComments(data);
  }, [update.id]);

  useEffect(() => {
    loadComments();

    const handleCommentAdded = (e: Event) => {
      const ce = e as CustomEvent<{ updateId: string }>;
      if (!ce.detail || ce.detail.updateId === update.id) {
        loadComments();
      }
    };

    window.addEventListener('teamsflow_daily_update_comment_added', handleCommentAdded);
    return () => window.removeEventListener('teamsflow_daily_update_comment_added', handleCommentAdded);
  }, [loadComments, update.id]);

  const getActualSender = (): Profile => {
    if (typeof window === 'undefined') return currentUser;
    const adminSessionStr = localStorage.getItem('stratify_admin_session');
    if (adminSessionStr) {
      try {
        return JSON.parse(adminSessionStr);
      } catch {
        return currentUser;
      }
    }
    return currentUser;
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      await addDailyUpdateComment(update.id, getActualSender(), newComment);
      setNewComment('');
      // Auto-show comments if not already open
      setShowComments(true);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteDailyUpdateComment(commentId, getActualSender().id);
    await loadComments();
  };

  const handleToggleCheck = async () => {
    if (getActualSender().role !== 'admin') return;
    const newVal = !isAdminChecked;
    setIsAdminChecked(newVal);
    await toggleDailyUpdateAdminCheck(update.id, newVal);
  };

  return (
    <div
      style={{
        borderTop: idx > 0 ? '1px solid #f0f1f3' : isPastUpdate ? '1px solid var(--border-subtle)' : undefined,
        background: '#ffffff',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = isPastUpdate ? '#fafbfc' : '#f8f9fa')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
    >
      <div
        style={{
          padding: isPastUpdate ? '16px 20px' : '12px 20px',
          display: 'flex',
          gap: isPastUpdate ? '16px' : '14px',
          alignItems: 'flex-start',
        }}
      >
        {/* Hours badge */}
        <div
          style={{
            minWidth: isPastUpdate ? '56px' : '54px',
            height: isPastUpdate ? '56px' : '54px',
            borderRadius: 'var(--radius-sm)',
            background: isPastUpdate ? 'var(--accent-emerald-soft)' : 'var(--accent-emerald-soft)',
            border: isPastUpdate ? '1px solid #abf5d1' : '1px solid #abf5d1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: isPastUpdate ? '1.1rem' : '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>
            {Number(update.hours_worked).toFixed(1)}
          </span>
          <span style={{ fontSize: isPastUpdate ? '0.6rem' : '0.62rem', fontWeight: 700, color: 'var(--accent-emerald)', opacity: 0.7 }}>hrs</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: isPastUpdate ? '0.9rem' : '0.875rem',
              color: 'var(--text-primary)',
              lineHeight: isPastUpdate ? 1.6 : 1.5,
              marginBottom: update.file_link ? (isPastUpdate ? '8px' : '6px') : '6px',
              wordBreak: 'break-word',
            }}
          >
            {update.work_description}
          </p>
          
          {update.file_link && (
            <div style={{ marginBottom: '8px' }}>
              <a
                href={update.file_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: isPastUpdate ? '0.76rem' : '0.76rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: 'var(--accent-blue-soft)',
                  border: '1px solid var(--accent-blue-border)',
                  padding: isPastUpdate ? '3px 10px' : '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <Link2 size={isPastUpdate ? 12 : 11} />
                {update.file_link.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ fontSize: isPastUpdate ? '0.72rem' : '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                {isPastUpdate ? 'Submitted at ' : ''}{new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Admin Checkmark */}
              {(getActualSender().role === 'admin' || isAdminChecked) && (
                <button
                  onClick={getActualSender().role === 'admin' ? handleToggleCheck : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'transparent',
                    border: 'none',
                    color: isAdminChecked ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: getActualSender().role === 'admin' ? 'pointer' : 'default',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (getActualSender().role === 'admin') {
                      (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-emerald)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getActualSender().role === 'admin') {
                      (e.currentTarget as HTMLButtonElement).style.color = isAdminChecked ? 'var(--accent-emerald)' : 'var(--text-muted)';
                    }
                  }}
                >
                  <CheckCircle2 size={15} />
                  {isAdminChecked ? 'Checked by Admin' : 'Mark as Checked'}
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: showComments ? 'var(--accent-purple)' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-purple)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = showComments ? 'var(--accent-purple)' : 'var(--text-muted)')}
            >
              <MessageCircle size={14} />
              {comments.length > 0 ? `${comments.length} Comments` : 'Add Comment'}
            </button>
          </div>
        </div>

        {/* Delete */}
        {onDelete && currentUser.id === update.user_id && (
          <button
            type="button"
            onClick={() => onDelete(update.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-xs)',
              color: '#c1c7d0',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-rose)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#c1c7d0')}
            title="Delete this entry"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ background: '#f8f9fa', borderTop: '1px solid #f0f1f3', padding: '12px 20px 16px 20px' }}>
          {comments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {comments.map((comment) => {
                const isAdmin = comment.author_role === 'admin';
                const isSelf = comment.author_id === getActualSender().id;
                
                return (
                  <div key={comment.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {isAdmin ? 'Admin' : comment.author_name}
                          </span>
                          <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`} style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                            {isAdmin ? <Shield size={9} /> : <User size={9} />}
                            {comment.author_role}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ background: 'transparent', border: 'none', color: '#c1c7d0', cursor: 'pointer', padding: '0 4px' }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-rose)')}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#c1c7d0')}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="input-field"
              style={{ fontSize: '0.8rem', padding: '8px 12px', flex: 1 }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || sending}
              className="btn btn-primary"
              style={{ padding: '8px 14px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
