'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Profile, DailyUpdate } from '@/lib/types';
import { getDailyUpdates, submitDailyUpdate, deleteDailyUpdate, getTodayDateString } from '@/lib/data-service';
import {
  ClipboardList,
  Clock,
  Link2,
  Send,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface DailyTaskUpdateFormProps {
  currentUser: Profile;
}

export default function DailyTaskUpdateForm({ currentUser }: DailyTaskUpdateFormProps) {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [workDescription, setWorkDescription] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [errors, setErrors] = useState<{ workDescription?: string; hoursWorked?: string }>({});

  const today = getTodayDateString();

  const loadUpdates = useCallback(async () => {
    const data = await getDailyUpdates(currentUser.id, today);
    setUpdates(data);
  }, [currentUser.id, today]);

  useEffect(() => {
    loadUpdates();

    const handleUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ userId: string }>;
      if (!ce.detail || ce.detail.userId === currentUser.id) loadUpdates();
    };

    window.addEventListener('teamsflow_daily_update_added', handleUpdated);
    return () => window.removeEventListener('teamsflow_daily_update_added', handleUpdated);
  }, [loadUpdates, currentUser.id]);

  const validate = (): boolean => {
    const newErrors: { workDescription?: string; hoursWorked?: string } = {};
    if (!workDescription.trim()) newErrors.workDescription = 'Please describe what you worked on today.';
    const hours = parseFloat(hoursWorked);
    if (!hoursWorked || isNaN(hours) || hours <= 0 || hours > 24) {
      newErrors.hoursWorked = 'Enter a valid number of hours (0.5 – 24).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      await submitDailyUpdate(currentUser.id, workDescription, parseFloat(hoursWorked), fileLink || undefined);
      setWorkDescription('');
      setHoursWorked('');
      setFileLink('');
      setErrors({});
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2500);
      await loadUpdates();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (updateId: string) => {
    await deleteDailyUpdate(updateId, currentUser.id);
    await loadUpdates();
  };

  const totalHoursToday = updates.reduce((sum, u) => sum + Number(u.hours_worked), 0);

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
              background: 'var(--accent-emerald-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-emerald)',
            }}
          >
            <ClipboardList size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Daily Task Update
              </h3>
              <span
                className="badge badge-active"
                style={{ fontSize: '0.68rem', padding: '2px 7px' }}
              >
                Today
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Log what you worked on, hours spent &amp; attach any file or doc link
            </p>
          </div>
        </div>

        {updates.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '2px',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {updates.length} {updates.length === 1 ? 'entry' : 'entries'} today
            </span>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: 'var(--accent-emerald)',
              }}
            >
              {totalHoursToday.toFixed(1)}h logged
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '20px', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Success Banner */}
        {successFlash && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-emerald-soft)',
              border: '1px solid #abf5d1',
              color: 'var(--accent-emerald)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={16} />
            Daily update submitted successfully!
          </div>
        )}

        {/* Work Description */}
        <div>
          <label
            htmlFor="work-description"
            className="input-label"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <FileText size={11} />
            What did you work on today?
            <span style={{ color: 'var(--accent-rose)', marginLeft: '2px' }}>*</span>
          </label>
          <textarea
            id="work-description"
            className="input-field"
            value={workDescription}
            onChange={(e) => {
              setWorkDescription(e.target.value);
              if (errors.workDescription) setErrors((prev) => ({ ...prev, workDescription: undefined }));
            }}
            placeholder="e.g. Completed the authentication flow, fixed 3 bug tickets, reviewed PR #142, updated the API documentation..."
            rows={3}
            style={{
              resize: 'vertical',
              minHeight: '80px',
              fontSize: '0.875rem',
              lineHeight: '1.55',
              borderColor: errors.workDescription ? 'var(--accent-rose)' : undefined,
            }}
          />
          {errors.workDescription && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px', color: 'var(--accent-rose)', fontSize: '0.76rem', fontWeight: 600 }}>
              <AlertCircle size={12} />
              {errors.workDescription}
            </div>
          )}
        </div>

        {/* Hours + File Link row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          {/* Hours Worked */}
          <div>
            <label
              htmlFor="hours-worked"
              className="input-label"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Clock size={11} />
              Hours worked
              <span style={{ color: 'var(--accent-rose)', marginLeft: '2px' }}>*</span>
            </label>
            <input
              id="hours-worked"
              type="number"
              className="input-field"
              value={hoursWorked}
              onChange={(e) => {
                setHoursWorked(e.target.value);
                if (errors.hoursWorked) setErrors((prev) => ({ ...prev, hoursWorked: undefined }));
              }}
              placeholder="e.g. 4.5"
              min="0.5"
              max="24"
              step="0.5"
              style={{
                fontSize: '0.875rem',
                borderColor: errors.hoursWorked ? 'var(--accent-rose)' : undefined,
              }}
            />
            {errors.hoursWorked && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', color: 'var(--accent-rose)', fontSize: '0.72rem', fontWeight: 600 }}>
                <AlertCircle size={11} />
                {errors.hoursWorked}
              </div>
            )}
          </div>

          {/* File / Doc Link */}
          <div>
            <label
              htmlFor="file-link"
              className="input-label"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Link2 size={11} />
              Daily Reports Link
            </label>
            <input
              id="file-link"
              type="url"
              className="input-field"
              value={fileLink}
              onChange={(e) => setFileLink(e.target.value)}
              placeholder="Google Docs link, Google Drive — paste here your daily report..."
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-emerald"
            style={{ padding: '9px 20px' }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }}
                />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Update
              </>
            )}
          </button>
        </div>
      </form>

      {/* Today's Update Log */}
      {updates.length > 0 && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              padding: '10px 20px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={11} />
            {`Today's Submitted Updates`}
          </div>

          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {updates.map((update, idx) => (
              <div
                key={update.id}
                style={{
                  padding: '12px 20px',
                  borderTop: idx > 0 ? '1px solid #f0f1f3' : undefined,
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                {/* Hours badge */}
                <div
                  style={{
                    minWidth: '54px',
                    height: '54px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-emerald-soft)',
                    border: '1px solid #abf5d1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-emerald)', lineHeight: 1 }}>
                    {Number(update.hours_worked).toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--accent-emerald)', opacity: 0.7 }}>hrs</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5,
                      marginBottom: update.file_link ? '6px' : 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {update.work_description}
                  </p>
                  {update.file_link && (
                    <a
                      href={update.file_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.76rem',
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                        textDecoration: 'none',
                        background: 'var(--accent-blue-soft)',
                        border: '1px solid var(--accent-blue-border)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Link2 size={11} />
                      {update.file_link.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(update.id)}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {updates.length === 0 && (
        <div
          style={{
            padding: '18px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <ClipboardList size={20} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
          <p>No updates submitted yet today. Fill in the form above to log your first entry.</p>
        </div>
      )}
    </div>
  );
}
