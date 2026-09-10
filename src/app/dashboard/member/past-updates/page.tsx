'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, DailyUpdate } from '@/lib/types';
import { getCurrentUser, getDailyUpdates, getTodayDateString } from '@/lib/data-service';
import Navigation from '@/components/Navigation';
import DailyUpdateCard from '@/components/DailyUpdateCard';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Link2,
  ChevronDown,
  ChevronUp,
  History,
  RefreshCw,
  ClipboardList,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function PastUpdatesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allUpdates, setAllUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const today = getTodayDateString();

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }
      setCurrentUser(user);

      // Load ALL updates including today
      const data = await getDailyUpdates(user.id);
      setAllUpdates(data);
    } catch (err) {
      console.error('Failed to load daily tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !currentUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', fontWeight: 600 }}>
          <RefreshCw size={20} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          Loading Daily Tasks...
        </div>
      </div>
    );
  }

  // Group by date
  const updatesByDate: Record<string, DailyUpdate[]> = {};
  allUpdates.forEach((u) => {
    if (!updatesByDate[u.date]) updatesByDate[u.date] = [];
    updatesByDate[u.date].push(u);
  });
  const sortedDates = Object.keys(updatesByDate).sort((a, b) => b.localeCompare(a));

  const totalHoursAll = allUpdates.reduce((sum, u) => sum + Number(u.hours_worked), 0);
  const totalEntries = allUpdates.length;

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentUser={currentUser} />

      <main className="page-container" style={{ maxWidth: '900px' }}>
        {/* Back Button + Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/dashboard/member')}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--accent-purple-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <History size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                My All Daily Tasks
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Complete history of all your submitted daily task updates
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Total Days
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)', letterSpacing: '-0.02em' }}>
              {sortedDates.length}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Days with updates logged
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Total Entries
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              {totalEntries}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Task updates submitted
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Total Hours
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
              {totalHoursAll.toFixed(1)}h
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Hours logged across all days
            </p>
          </div>
        </div>

        {/* Updates by Date */}
        {sortedDates.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <ClipboardList size={36} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--accent-primary)' }} />
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No daily tasks found
            </p>
            <p style={{ fontSize: '0.82rem' }}>
              Your daily task updates will appear here after they are submitted from the dashboard.
            </p>
          </div>
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {/* Section Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <FileText size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                All Updates by Date
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                Click a date to expand
              </span>
            </div>

            {/* Date Groups */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {sortedDates.map((dateStr) => {
                const dayUpdates = updatesByDate[dateStr];
                const dayTotal = dayUpdates.reduce((sum, u) => sum + Number(u.hours_worked), 0);
                const isExpanded = expandedDate === dateStr;
                const allChecked = dayUpdates.length > 0 && dayUpdates.every(u => u.admin_checked);

                return (
                  <div key={dateStr}>
                    {/* Date Header — clickable */}
                    <button
                      type="button"
                      onClick={() => setExpandedDate(isExpanded ? null : dateStr)}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: isExpanded ? 'var(--accent-blue-soft)' : '#f8f9fa',
                        border: 'none',
                        borderTop: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={15} color="var(--accent-primary)" />
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {formatDateLabel(dateStr)}
                        </span>
                        {allChecked && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.72rem', fontWeight: 600, marginLeft: '6px' }}>
                            <CheckCircle2 size={14} />
                            Checked by Admin
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          {dayUpdates.length} {dayUpdates.length === 1 ? 'entry' : 'entries'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: 'var(--accent-primary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {dayTotal.toFixed(1)}h
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} color="var(--text-muted)" />
                        ) : (
                          <ChevronDown size={16} color="var(--text-muted)" />
                        )}
                      </div>
                    </button>

                    {/* Entries — only when expanded */}
                    {isExpanded && (
                      <div style={{ background: '#ffffff' }}>
                        {dayUpdates.map((update, idx) => (
                          <DailyUpdateCard 
                            key={update.id} 
                            update={update} 
                            currentUser={currentUser} 
                            idx={idx} 
                            isPastUpdate={true} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
