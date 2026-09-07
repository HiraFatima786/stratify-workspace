'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, AttendanceRecord } from '@/lib/types';
import { getCurrentUser, getAttendanceHistory } from '@/lib/data-service';
import Navigation from '@/components/Navigation';
import MemberProfileCard from '@/components/MemberProfileCard';
import CheckInOutWidget from '@/components/CheckInOutWidget';
import DailyReportsChat from '@/components/DailyReportsChat';
import AttendanceTable from '@/components/AttendanceTable';
import DailyTaskUpdateForm from '@/components/DailyTaskUpdateForm';
import LockedInfoPanels from '@/components/LockedInfoPanels';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function MemberDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/');
        return;
      }
      setCurrentUser(user);

      // Fetch member's isolated attendance records
      const records = await getAttendanceHistory(user.id);
      setAttendance(records);
    } catch (err) {
      console.error('Failed to load member data:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load user + attendance once on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-fetch attendance when other components signal a change
  useEffect(() => {
    const handleAuthChange = () => loadData();
    const handleAttendanceChange = () => {
      if (currentUser) {
        getAttendanceHistory(currentUser.id).then(setAttendance);
      }
    };

    window.addEventListener('teamsflow_auth_changed', handleAuthChange);
    window.addEventListener('teamsflow_attendance_changed', handleAttendanceChange);

    return () => {
      window.removeEventListener('teamsflow_auth_changed', handleAuthChange);
      window.removeEventListener('teamsflow_attendance_changed', handleAttendanceChange);
    };
  }, [currentUser, loadData]);

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
          Loading Member Portal...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentUser={currentUser} />

      <main className="page-container">
        {/* Important Notice Banner */}
        <div
          style={{
            marginBottom: '24px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-rose-soft)',
            border: '1px solid #ffbdad',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} color="var(--accent-rose)" />
            <span style={{ fontSize: '0.86rem', color: '#bf2600' }}>
              <strong>Important Notice:</strong> Your work from <strong>Monday to Friday</strong> is monitored here. Check in daily, complete your working hours, check out, and update your daily tasks. Admins will review your work here.
            </span>
          </div>
          <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--accent-rose)', color: '#fff', border: '1px solid var(--accent-rose)' }}>
            Required
          </span>
        </div>

        {/* Locked Info Panels */}
        <LockedInfoPanels />

        {/* Member Profile Card */}
        <div style={{ marginBottom: '24px' }}>
          <MemberProfileCard
            profile={currentUser}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
            canEdit={true}
          />
        </div>

        {/* Main Grid: Check-in/Daily Hours on left & Daily Reports Thread on right */}
        <div className="member-main-grid">
          {/* Check In / Check Out & Daily Hours */}
          <div>
            <CheckInOutWidget
              userId={currentUser.id}
              userName={currentUser.full_name}
              attendanceHistory={attendance}
              onAttendanceUpdated={loadData}
            />
          </div>

          {/* Daily Reports Chat Thread */}
          <div>
            <DailyReportsChat
              memberId={currentUser.id}
              memberName={currentUser.full_name}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Daily Task Update Form */}
        <div style={{ marginBottom: '24px' }}>
          <DailyTaskUpdateForm currentUser={currentUser} />
        </div>

        {/* Chronological Attendance History Table */}
        <div>
          <AttendanceTable
            records={attendance}
            title="My Work Shifts & Daily Hours Record"
          />
        </div>
      </main>
    </div>
  );
}
