'use client';

import React from 'react';
import { AttendanceRecord } from '@/lib/types';
import { formatMinutes } from '@/lib/data-service';
import { Calendar, Clock, CheckCircle2, Hourglass, FileText } from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
  showMemberName?: boolean;
}

export default function AttendanceTable({
  records,
  title = 'Work Shift History',
}: AttendanceTableProps) {
  return (
    <div className="glass-panel" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--accent-blue-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Logged check-ins, checkouts, and total daily duration
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{records.length} shifts recorded</span>
      </div>

      {records.length === 0 ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.88rem',
            background: '#f4f5f7',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <Clock size={28} style={{ margin: '0 auto 10px', opacity: 0.5, color: 'var(--accent-primary)' }} />
          No attendance records found yet. Check in above to create your first shift entry.
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Total Daily Hours</th>
                <th>Status</th>
                <th>Shift Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const inTime = new Date(rec.check_in_time);
                const outTime = rec.check_out_time ? new Date(rec.check_out_time) : null;

                return (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                      {rec.date}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ color: outTime ? 'var(--text-secondary)' : 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {outTime
                        ? outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : '— in progress —'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                      {rec.total_minutes !== null ? (
                        formatMinutes(rec.total_minutes)
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>
                          <Hourglass size={12} className="status-beacon" /> active
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${rec.status === 'checked_in' ? 'badge-active' : 'badge-offline'}`}>
                        {rec.status === 'checked_in' ? (
                          <>
                            <span className="status-beacon status-beacon-green" /> Checked In
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={11} /> Completed
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      {rec.notes ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={13} color="var(--text-muted)" />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rec.notes}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
