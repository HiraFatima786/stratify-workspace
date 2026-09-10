'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/data-service';
import { Profile } from '@/lib/types';
import Navigation from '@/components/Navigation';
import { Plus, Edit2, Trash2, Shield, User, Loader2, RefreshCw } from 'lucide-react';

export default function UserManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'member',
    department: 'Engineering',
    job_title: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard/member');
        return;
      }
      setCurrentUser(user);
      await fetchUsers();
    }
    loadData();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        // Sort users by created_at desc
        const sortedUsers = data.users.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'member',
      department: 'Engineering',
      job_title: '',
      description: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setIsEditing(true);
    setSelectedUserId(user.id);
    const meta = user.user_metadata || {};
    setFormData({
      email: user.email || '',
      password: '', // Leave blank unless they want to change it
      full_name: meta.full_name || '',
      role: meta.role || 'member',
      department: meta.department || 'Engineering',
      job_title: meta.job_title || '',
      description: meta.description || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will permanently remove their account, profile, and all associated data.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      await fetchUsers();
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!isEditing && !formData.password) {
        throw new Error('Password is required for new users.');
      }

      const url = isEditing ? `/api/users/${selectedUserId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 className="spin" size={32} color="var(--accent-primary)" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentUser={currentUser} />

      <main style={{ flex: 1, padding: 'clamp(20px, 5vw, 40px)', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              User Management
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Create, update, and remove Stratify workspace members.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchUsers}
              className="btn btn-ghost"
              disabled={loading}
              title="Refresh Users"
              style={{ padding: '8px' }}
            >
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>
            <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={16} />
              Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className="spin" size={28} color="var(--accent-primary)" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading users...</p>
          </div>
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8f9fb', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created At</th>
                    <th style={{ padding: '16px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => {
                    const meta = user.user_metadata || {};
                    const fullName = meta.full_name || 'Unknown User';
                    const role = meta.role || 'member';
                    
                    return (
                      <tr key={user.id} style={{ borderBottom: idx < users.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-blue-soft)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{fullName}</div>
                              {meta.job_title && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{meta.job_title}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                            {role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                            {role}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => openEditModal(user)}
                              className="btn btn-ghost"
                              style={{ padding: '6px', color: 'var(--text-secondary)' }}
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>
                            {currentUser.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id, fullName)}
                                className="btn btn-ghost"
                                style={{ padding: '6px', color: 'var(--accent-rose)' }}
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* User Form Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)} />
          
          <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '30px', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isEditing ? 'Edit User' : 'Create New User'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              {isEditing ? 'Update user details and roles.' : 'Add a new member to the workspace.'}
            </p>

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isEditing}
                  minLength={6}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Role *</label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Department</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Job Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Bio / Description</label>
                <textarea
                  className="input-field"
                  rows={2}
                  style={{ resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSubmitting && <Loader2 size={16} className="spin" />}
                  {isEditing ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
