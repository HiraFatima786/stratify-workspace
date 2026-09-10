'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, AttendanceRecord } from '@/lib/types';
import {
  getCurrentUser,
  getAllMembers,
  getAttendanceHistory,
  calculateTodaySummary,
  formatMinutes,
  getAllDailyUpdates,
} from '@/lib/data-service';
import { DailyUpdate } from '@/lib/types';
import Navigation from '@/components/Navigation';
import MemberProfileCard from '@/components/MemberProfileCard';
import DailyUpdateCard from '@/components/DailyUpdateCard';
import DailyReportsChat from '@/components/DailyReportsChat';
import AttendanceTable from '@/components/AttendanceTable';
import CheckInOutWidget from '@/components/CheckInOutWidget';
import {
  Users,
  Clock,
  Search,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allUpdates, setAllUpdates] = useState<DailyUpdate[]>([]);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'admin_shift'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Use a ref so loadData can access the latest selectedMember without being
  // re-created every time selectedMember changes (which caused an infinite loop).
  const selectedMemberRef = useRef<Profile | null>(null);
  selectedMemberRef.current = selectedMember;

  const loadData = useCallback(async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    setCurrentUser(user);

    const members = await getAllMembers();
    const attendance = await getAttendanceHistory();
    const updates = await getAllDailyUpdates();

    setAllProfiles(members);
    setAllAttendance(attendance);
    setAllUpdates(updates);

    // Pick first member by default if none selected
    const currentSelected = selectedMemberRef.current;
    const regularMembers = members.filter((m) => m.role === 'member');
    if (!currentSelected && regularMembers.length > 0) {
      setSelectedMember(regularMembers[0]);
    } else if (currentSelected) {
      const refreshed = members.find((m) => m.id === currentSelected.id);
      if (refreshed) setSelectedMember(refreshed);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();

    const handleAuthChange = () => loadData();
    const handleAttendanceChange = () => {
      getAttendanceHistory().then(setAllAttendance);
    };
    const handleDailyUpdateAdded = () => {
      getAllDailyUpdates().then(setAllUpdates);
    };

    window.addEventListener('teamsflow_auth_changed', handleAuthChange);
    window.addEventListener('teamsflow_attendance_changed', handleAttendanceChange);
    window.addEventListener('teamsflow_daily_update_added', handleDailyUpdateAdded);

    return () => {
      window.removeEventListener('teamsflow_auth_changed', handleAuthChange);
      window.removeEventListener('teamsflow_attendance_changed', handleAttendanceChange);
      window.removeEventListener('teamsflow_daily_update_added', handleDailyUpdateAdded);
    };
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
          Loading Admin Operations Console...
        </div>
      </div>
    );
  }

  // Filter regular members
  const teamMembers = allProfiles.filter((p) => p.role === 'member');

  // Compute organization metrics
  const activeCheckedInMembers = teamMembers.filter((m) => {
    const summary = calculateTodaySummary(allAttendance, m.id);
    return summary.isCheckedInNow;
  });

  const totalMinutesAcrossOrg = teamMembers.reduce((acc, m) => {
    const summary = calculateTodaySummary(allAttendance, m.id);
    return acc + summary.totalMinutesWorked;
  }, 0);

  // Selected member records
  const selectedMemberAttendance = selectedMember
    ? allAttendance.filter((r) => r.user_id === selectedMember.id)
    : [];

  const selectedMemberSummary = selectedMember
    ? calculateTodaySummary(allAttendance, selectedMember.id)
    : null;

  // Filtered members by search query
  const filteredMembers = teamMembers.filter((m) => {
    const query = searchQuery.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.department.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentUser={currentUser} />

      <main className="page-container">
        {/* Admin Header with Admin's Profile Description */}
        <div style={{ marginBottom: '24px' }}>
          <MemberProfileCard
            profile={currentUser}
            onProfileUpdated={(updated) => setCurrentUser(updated)}
            canEdit={true}
          />
        </div>

        {/* Executive Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {/* Card 1: Team Members */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Members
              </span>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent-purple-soft)', color: 'var(--accent-purple)' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {teamMembers.length}
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across {new Set(teamMembers.map((m) => m.department)).size} operational departments
            </p>
          </div>

          {/* Card 2: Currently Active Check-Ins */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Currently Checked In
              </span>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent-emerald-soft)', color: 'var(--accent-emerald)' }}>
                <span className="status-beacon status-beacon-green" />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-emerald)', letterSpacing: '-0.02em' }}>
              {activeCheckedInMembers.length} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {teamMembers.length} online</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Live shifts underway on platform
            </p>
          </div>

          {/* Card 3: Total Team Hours Today */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Org Hours Logged Today
              </span>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--accent-blue-soft)', color: 'var(--accent-primary)' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-primary)', letterSpacing: '-0.02em' }}>
              {formatMinutes(totalMinutesAcrossOrg)}
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Aggregated across all member sessions
            </p>
          </div>
        </div>

        {/* Tab Controls: Team Roster & Tasks vs Admin Self Check-In */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('roster')}
            className={`btn ${activeTab === 'roster' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Users size={16} />
            Team Roster &amp; Daily Reports
          </button>
          <button
            onClick={() => setActiveTab('admin_shift')}
            className={`btn ${activeTab === 'admin_shift' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Clock size={16} />
            My Admin Shift &amp; Check-In
          </button>
        </div>

        {activeTab === 'admin_shift' ? (
          /* Admin Shift Widget */
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <CheckInOutWidget
              userId={currentUser.id}
              userName={currentUser.full_name}
              attendanceHistory={allAttendance.filter((r) => r.user_id === currentUser.id)}
              onAttendanceUpdated={loadData}
            />
            <div style={{ marginTop: '24px' }}>
              <AttendanceTable
                records={allAttendance.filter((r) => r.user_id === currentUser.id)}
                title="Admin Personal Shift Logs"
              />
            </div>
          </div>
        ) : (
          /* Team Roster & Member Details Layout */
          <div className="admin-main-grid">
            {/* Left Column: Member List Switcher */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Team Members
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Select a member to view their isolated profile, daily hours, and join their Daily Reports thread
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or department..."
                  style={{ paddingLeft: '38px', fontSize: '0.84rem' }}
                />
              </div>

              {/* Member Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflowY: 'auto' }}>
                {filteredMembers.map((member) => {
                  const isSelected = selectedMember?.id === member.id;
                  const memberSummary = calculateTodaySummary(allAttendance, member.id);

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--accent-blue-soft)' : '#f4f5f7',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--accent-primary)' : '#dfe1e6',
                            color: isSelected ? '#ffffff' : '#172b4d',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.88rem',
                          }}
                        >
                          {member.full_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {member.full_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {member.department}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <span className={`status-beacon ${memberSummary.isCheckedInNow ? 'status-beacon-green' : ''}`} style={!memberSummary.isCheckedInNow ? { background: '#8993a4' } : {}} />
                          <span
                            className={`badge ${memberSummary.isCheckedInNow ? 'badge-active' : 'badge-offline'}`}
                            style={{ fontSize: '0.66rem', padding: '2px 6px' }}
                          >
                            {memberSummary.isCheckedInNow ? 'In' : 'Out'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginTop: '4px', fontWeight: 700 }}>
                          {memberSummary.formattedHours}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Member Drill-down */}
            {selectedMember ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Member Profile Overview */}
                <MemberProfileCard
                  profile={selectedMember}
                  canEdit={false}
                />

                {/* Today's Hours Highlight Card */}
                {selectedMemberSummary && (
                  <div
                    className="glass-panel"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      background: 'var(--accent-blue-soft)',
                      border: '1px solid var(--accent-blue-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
                        }}
                      >
                        <Clock size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.74rem', color: '#0747a6', textTransform: 'uppercase', fontWeight: 700 }}>
                          {selectedMember.full_name}'s Shift Summary
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0747a6' }}>
                            {selectedMemberSummary.formattedHours} worked today
                          </span>
                          <span className={`badge ${selectedMemberSummary.isCheckedInNow ? 'badge-active' : 'badge-offline'}`}>
                            {selectedMemberSummary.isCheckedInNow ? 'Shift Active' : 'Shift Ended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#44546f', fontWeight: 600 }}>
                      {selectedMemberSummary.sessionsCount} sessions recorded today
                    </div>
                  </div>
                )}

                {/* Daily Reports Chat Thread with this specific member */}
                <div>
                  <DailyReportsChat
                    memberId={selectedMember.id}
                    memberName={selectedMember.full_name}
                    currentUser={currentUser}
                  />
                </div>

                {/* Member's Daily Tasks */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {selectedMember.full_name}'s Recent Daily Updates
                  </h3>
                  <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    {(() => {
                      const memberUpdates = allUpdates.filter(u => u.user_id === selectedMember.id).slice(0, 5); // Show last 5
                      if (memberUpdates.length === 0) {
                        return (
                          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No recent updates submitted by this member.
                          </div>
                        );
                      }
                      return memberUpdates.map((update, idx) => (
                        <DailyUpdateCard 
                          key={update.id} 
                          update={update} 
                          currentUser={currentUser} 
                          idx={idx} 
                          isPastUpdate={true} 
                        />
                      ));
                    })()}
                  </div>
                </div>

                {/* Member's Attendance Records */}
                <div>
                  <AttendanceTable
                    records={selectedMemberAttendance}
                    title={`${selectedMember.full_name}'s Work Shifts & Daily Hours`}
                  />
                </div>
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--accent-primary)' }} />
                Select a member from the left roster to view their isolated profile and join their Daily Reports thread.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
