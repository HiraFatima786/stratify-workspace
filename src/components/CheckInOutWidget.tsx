'use client';

import React, { useState, useEffect } from 'react';
import { AttendanceRecord, DailyHoursSummary } from '@/lib/types';
import { checkIn, checkOut, calculateTodaySummary, formatMinutes } from '@/lib/data-service';
import confetti from 'canvas-confetti';
import { Clock, Play, Square, AlertTriangle, Shield, X } from 'lucide-react';

interface CheckInOutWidgetProps {
  userId: string;
  userName: string;
  attendanceHistory: AttendanceRecord[];
  onAttendanceUpdated: () => void;
}

export default function CheckInOutWidget({
  userId,
  userName,
  attendanceHistory,
  onAttendanceUpdated,
}: CheckInOutWidgetProps) {
  const [summary, setSummary] = useState<DailyHoursSummary>({
    totalMinutesWorked: 0,
    formattedHours: '0h 0m',
    sessionsCount: 0,
    isCheckedInNow: false,
    currentSessionMinutes: 0,
    lastCheckInTime: null,
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<'checkin' | 'checkout' | null>(null);

  // Recalculate summary whenever history changes
  useEffect(() => {
    const res = calculateTodaySummary(attendanceHistory, userId);
    setSummary(res);

    if (res.isCheckedInNow && res.lastCheckInTime) {
      const diffSecs = Math.max(0, Math.floor((Date.now() - new Date(res.lastCheckInTime).getTime()) / 1000));
      setElapsedSeconds(diffSecs);
    } else {
      setElapsedSeconds(0);
    }
  }, [attendanceHistory, userId]);

  // Live timer interval while checked in
  useEffect(() => {
    if (!summary.isCheckedInNow || !summary.lastCheckInTime) return;

    const interval = setInterval(() => {
      const diffSecs = Math.max(0, Math.floor((Date.now() - new Date(summary.lastCheckInTime!).getTime()) / 1000));
      setElapsedSeconds(diffSecs);
    }, 1000);

    return () => clearInterval(interval);
  }, [summary.isCheckedInNow, summary.lastCheckInTime]);

  const handleCheckIn = async () => {
    setConfirmAction(null);
    setLoading(true);
    try {
      await checkIn(userId, noteInput.trim() || 'Started daily work shift');
      setNoteInput('');
      onAttendanceUpdated();

      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.7 },
        colors: ['#00875a', '#0052cc', '#00a3bf'],
      });

      setFeedbackMsg({ text: `Checked in successfully! Have a productive shift, ${userName}.`, type: 'success' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setConfirmAction(null);
    setLoading(true);
    try {
      const updated = await checkOut(userId, noteInput.trim() || 'Shift completed');
      setNoteInput('');
      onAttendanceUpdated();

      if (updated?.total_minutes) {
        setFeedbackMsg({
          text: `Checked out! Session logged: ${formatMinutes(updated.total_minutes)}. Great work!`,
          type: 'info',
        });
      } else {
        setFeedbackMsg({ text: 'Checked out successfully.', type: 'info' });
      }
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Format elapsed seconds as HH:MM:SS
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const targetMinutes = 480;
  const progressPercent = Math.min(100, Math.round((summary.totalMinutesWorked / targetMinutes) * 100));

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: summary.isCheckedInNow ? 'var(--accent-emerald-soft)' : 'var(--accent-blue-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: summary.isCheckedInNow ? 'var(--accent-emerald)' : 'var(--accent-primary)',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Attendance &amp; Daily Hours</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Record work shifts &amp; track automated daily working hours
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-beacon ${summary.isCheckedInNow ? 'status-beacon-green' : ''}`} style={!summary.isCheckedInNow ? { background: '#8993a4' } : {}} />
          <span
            className={`badge ${summary.isCheckedInNow ? 'badge-active' : 'badge-offline'}`}
            style={{ fontSize: '0.74rem', padding: '3px 8px' }}
          >
            {summary.isCheckedInNow ? 'Checked In' : 'Checked Out'}
          </span>
        </div>
      </div>

      {/* Time Cards */}
      <div className="time-cards-grid">
        {/* Live Timer */}
        <div style={{ background: '#f4f5f7', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Current Shift Session
            </span>
            {summary.isCheckedInNow && <span className="status-beacon status-beacon-green" />}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.85rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              color: summary.isCheckedInNow ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}
          >
            {summary.isCheckedInNow ? formatTimer(elapsedSeconds) : '00:00:00'}
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.isCheckedInNow && summary.lastCheckInTime
              ? `Checked in at ${new Date(summary.lastCheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Click Check In to begin your shift timer'}
          </p>
        </div>

        {/* Daily Hours */}
        <div style={{ background: '#f4f5f7', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Today&apos;s Daily Hours
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              {progressPercent}% of 8h goal
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
            {summary.formattedHours}
          </div>
          <div style={{ marginTop: '8px', height: '6px', background: '#dfe1e6', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--accent-primary)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {summary.sessionsCount} work {summary.sessionsCount === 1 ? 'session' : 'sessions'} logged today
          </p>
        </div>
      </div>

      {/* Note Input */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          className="input-field"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder={
            summary.isCheckedInNow
              ? 'Add checkout summary or tasks completed (optional)...'
              : 'Add check-in note or planned focus area (optional)...'
          }
          style={{ fontSize: '0.86rem', padding: '10px 14px' }}
        />
      </div>

      {/* Action Buttons — open confirm modal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {!summary.isCheckedInNow ? (
          <button
            onClick={() => setConfirmAction('checkin')}
            disabled={loading}
            className="btn btn-emerald btn-lg"
            style={{ flex: 1, minWidth: 0, width: '100%' }}
          >
            <Play size={16} fill="currentColor" />
            Check In Now
          </button>
        ) : (
          <button
            onClick={() => setConfirmAction('checkout')}
            disabled={loading}
            className="btn btn-rose btn-lg"
            style={{ flex: 1, minWidth: 0, width: '100%' }}
          >
            <Square size={16} fill="currentColor" />
            Check Out (End Shift)
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          style={{
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-sm)',
            background: feedbackMsg.type === 'success' ? 'var(--accent-emerald-soft)' : 'var(--accent-blue-soft)',
            border: `1px solid ${feedbackMsg.type === 'success' ? '#abf5d1' : 'var(--accent-blue-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.86rem',
            color: feedbackMsg.type === 'success' ? '#006644' : '#0747a6',
            fontWeight: 500,
          }}
        >
          <Shield size={16} color={feedbackMsg.type === 'success' ? '#00875a' : '#0052cc'} />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmAction && (
        <div
          onClick={() => setConfirmAction(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 30, 66, 0.50)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 60px rgba(9, 30, 66, 0.28)',
              padding: '24px 20px',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setConfirmAction(null)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', borderRadius: '4px', display: 'flex',
              }}
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div
              style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: confirmAction === 'checkin' ? 'var(--accent-emerald-soft)' : '#ffebe6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <AlertTriangle size={26} color={confirmAction === 'checkin' ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
            </div>

            {/* Title + time */}
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {confirmAction === 'checkin' ? 'Confirm Check In?' : 'Confirm Check Out?'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Current time:&nbsp;
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </strong>
            </p>

            {/* Warning */}
            <div
              style={{
                background: confirmAction === 'checkin' ? 'var(--accent-blue-soft)' : '#fff0b3',
                border: `1px solid ${confirmAction === 'checkin' ? 'var(--accent-blue-border)' : '#ffe380'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '24px',
                fontSize: '0.87rem',
                color: 'var(--text-primary)',
                lineHeight: 1.65,
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <Shield size={15} style={{ flexShrink: 0, marginTop: '2px' }} color={confirmAction === 'checkin' ? '#0052cc' : '#ff991f'} />
              <span>
                {confirmAction === 'checkin'
                  ? 'Make sure you are checking in at the correct time. This will be permanently logged into the system and reviewed by your admin.'
                  : 'Make sure you are ready to end your shift. Your check-out time will be permanently recorded and reviewed by your admin.'}
              </span>
            </div>

            {/* Confirm / Cancel */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmAction === 'checkin' ? handleCheckIn : handleCheckOut}
                disabled={loading}
                className={`btn btn-lg ${confirmAction === 'checkin' ? 'btn-emerald' : 'btn-rose'}`}
                style={{ flex: 1 }}
              >
                {confirmAction === 'checkin'
                  ? <><Play size={15} fill="currentColor" /> Yes, Check In</>
                  : <><Square size={15} fill="currentColor" /> Yes, Check Out</>}
              </button>
              <button onClick={() => setConfirmAction(null)} className="btn btn-ghost btn-lg" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
