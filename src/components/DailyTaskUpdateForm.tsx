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
  History,
  ChevronDown,
} from 'lucide-react';
import DailyUpdateCard from './DailyUpdateCard';

interface DailyTaskUpdateFormProps {
  currentUser: Profile;
}

export default function DailyTaskUpdateForm({ currentUser }: DailyTaskUpdateFormProps) {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [allUpdates, setAllUpdates] = useState<DailyUpdate[]>([]);
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

  const loadAllUpdates = useCallback(async () => {
    const data = await getDailyUpdates(currentUser.id);
    // Exclude today's updates since they're shown separately
    setAllUpdates(data.filter((u) => u.date !== today));
  }, [currentUser.id, today]);

  useEffect(() => {
    loadUpdates();
    loadAllUpdates();

    const handleUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ userId: string }>;
      if (!ce.detail || ce.detail.userId === currentUser.id) {
        loadUpdates();
        loadAllUpdates();
      }
    };

    window.addEventListener('teamsflow_daily_update_added', handleUpdated);
    return () => window.removeEventListener('teamsflow_daily_update_added', handleUpdated);
  }, [loadUpdates, loadAllUpdates, currentUser.id]);

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

  // Group past updates by date
  const pastUpdatesByDate: Record<string, DailyUpdate[]> = {};
  allUpdates.forEach((u) => {
    if (!pastUpdatesByDate[u.date]) pastUpdatesByDate[u.date] = [];
    pastUpdatesByDate[u.date].push(u);
  });
  // Sort dates descending (most recent first)
  const sortedDates = Object.keys(pastUpdatesByDate).sort((a, b) => b.localeCompare(a));

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
            placeholder="Describe the work you completed today, including details of any leads you contacted or followed up with, and mention which leads are converting. This helps us track daily progress and understand why leads may or may not be converting"
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
        <div className="form-row-responsive">
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
              placeholder="paste your daily reports links here either on google docs or google drive"
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
              <DailyUpdateCard 
                key={update.id} 
                update={update} 
                currentUser={currentUser} 
                idx={idx} 
                onDelete={handleDelete} 
              />
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

      {/* Link to All Daily Tasks Page */}
      {(updates.length > 0 || allUpdates.length > 0) && (
        <div
          style={{
            borderTop: '2px solid var(--border-subtle)',
          }}
        >
          <a
            href="/dashboard/member/past-updates"
            style={{
              width: '100%',
              padding: '14px 20px',
              background: '#f4f5f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--accent-purple-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-purple)',
                }}
              >
                <History size={16} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  My All Daily Tasks
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    display: 'block',
                    fontWeight: 500,
                  }}
                >
                  View all submitted tasks across all days
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--accent-purple)',
                }}
              >
                {(updates.length + allUpdates.length)} {(updates.length + allUpdates.length) === 1 ? 'task' : 'tasks'}
              </span>
              <ChevronDown size={16} color="var(--text-muted)" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
