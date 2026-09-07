'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types';
import { logoutUser, updateUserPassword, getAllMembers, switchCurrentUser, SEED_PROFILES } from '@/lib/data-service';
import { Shield, User, LogOut, Check, ChevronDown, Key, X, AlertCircle, Eye, EyeOff, ArrowLeftRight } from 'lucide-react';
import StratifyLogo from './StratifyLogo';

interface NavigationProps {
  currentUser: Profile;
}

export default function Navigation({ currentUser }: NavigationProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<Profile[]>([]);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadSwitchAccounts = React.useCallback(async () => {
    try {
      const members = await getAllMembers();
      if (members && members.length > 0) {
        setAvailableProfiles(members);
      }
    } catch (err) {
      console.warn('Failed to load switch accounts:', err);
    }
    if (typeof window !== 'undefined') {
      setIsAdminSession(currentUser.role === 'admin' || !!localStorage.getItem('stratify_admin_session'));
    }
  }, [currentUser.role]);

  React.useEffect(() => {
    loadSwitchAccounts();
    window.addEventListener('teamsflow_data_changed', loadSwitchAccounts);
    window.addEventListener('teamsflow_auth_changed', loadSwitchAccounts);
    return () => {
      window.removeEventListener('teamsflow_data_changed', loadSwitchAccounts);
      window.removeEventListener('teamsflow_auth_changed', loadSwitchAccounts);
    };
  }, [loadSwitchAccounts]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const handleQuickSwitch = async (profile: Profile) => {
    await switchCurrentUser(profile);
    setDropdownOpen(false);
    if (profile.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/member');
    }
  };

  const handleOpenPasswordModal = () => {
    setOldPassword('');
    setNewPassword('');
    setPasswordStatus('idle');
    setPasswordError(null);
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    if (passwordStatus === 'saving') return;
    setShowPasswordModal(false);
    setPasswordStatus('idle');
    setPasswordError(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordError('Please enter both current and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }
    
    setPasswordStatus('saving');
    try {
      const res = await updateUserPassword(oldPassword, newPassword, currentUser?.email);
      if (!res.success) {
        setPasswordStatus('error');
        setPasswordError(res.error || 'Failed to update password. Please verify current password.');
        return;
      }

      setPasswordStatus('success');
      setTimeout(() => {
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setPasswordStatus('idle');
        setPasswordError(null);
      }, 1800);
    } catch (err: unknown) {
      setPasswordStatus('error');
      setPasswordError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(9, 30, 66, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 82, 204, 0.3)',
            }}
          >
            <StratifyLogo size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                stratify<span style={{ color: 'var(--accent-primary)' }}> workspace</span>
              </span>
              <span className={`badge ${currentUser.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                {currentUser.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                {currentUser.role}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Daily Hours & Task Coordination</p>
          </div>
        </div>

        {/* User profile & Quick Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Account switcher dropdown — admin or impersonation session */}
          {(currentUser.role === 'admin' || isAdminSession) && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  loadSwitchAccounts();
                }}
                className="btn btn-ghost btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: dropdownOpen ? 'var(--accent-blue-soft)' : 'transparent',
                }}
              >
                <ArrowLeftRight size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Switch Account
                </span>
                <ChevronDown size={14} color="var(--text-secondary)" />
              </button>

              {dropdownOpen && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '290px',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    padding: '8px',
                    zIndex: 100,
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 10px',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '6px',
                    }}
                  >
                    <span>Switch Team Account</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', textTransform: 'none' }}>
                      {(availableProfiles.length > 0 ? availableProfiles : [currentUser]).length} available
                    </span>
                  </div>

                  {(availableProfiles.length > 0 ? availableProfiles : [currentUser]).map((p) => {
                    const isCurrent = p.id === currentUser.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleQuickSwitch(p)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: isCurrent ? 'var(--accent-blue-soft)' : 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          transition: 'background 0.15s ease',
                          marginBottom: '2px',
                        }}
                      >
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: p.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-primary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            flexShrink: 0,
                          }}
                        >
                          {p.full_name?.[0] || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.full_name}
                            </span>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                textTransform: 'uppercase',
                                background: p.role === 'admin' ? 'var(--accent-purple-soft)' : 'var(--accent-blue-soft)',
                                color: p.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-primary)',
                                flexShrink: 0,
                              }}
                            >
                              {p.role}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '0.71rem',
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.email}
                          </div>
                        </div>
                        {isCurrent && <Check size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* User info pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 12px 5px 6px',
              background: '#f4f5f7',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: currentUser.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
              }}
            >
              {currentUser.full_name[0]}
            </div>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.2, color: 'var(--text-primary)' }}>{currentUser.full_name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleOpenPasswordModal}
              className="btn btn-ghost btn-sm"
              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Key size={14} />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sign out"
              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-rose-soft)' }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 30, 66, 0.54)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', padding: '20px'
        }}>
          <div
            className="glass-panel"
            style={{ width: '100%', maxWidth: '420px', background: '#ffffff', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
          >
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                <Key size={18} color="var(--accent-primary)" /> Change Password
              </h3>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={passwordStatus === 'saving'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ padding: '24px' }}>
              {passwordStatus === 'success' ? (
                <div style={{ padding: '18px', background: 'var(--accent-emerald-soft)', color: 'var(--accent-emerald)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={20} /> Password updated successfully in Supabase!
                </div>
              ) : (
                <>
                  {passwordError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        lineHeight: 1.4,
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        className="input-field"
                        placeholder="Enter your current password"
                        value={oldPassword}
                        onChange={(e) => {
                          setOldPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        style={{ paddingRight: '40px' }}
                        disabled={passwordStatus === 'saving'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="input-label" style={{ marginBottom: 0 }}>New Password</label>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min. 6 characters</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="input-field"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        style={{ paddingRight: '40px' }}
                        disabled={passwordStatus === 'saving'}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleClosePasswordModal}
                      className="btn btn-ghost"
                      disabled={passwordStatus === 'saving'}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordStatus === 'saving' || !oldPassword || !newPassword}
                    >
                      {passwordStatus === 'saving' ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
