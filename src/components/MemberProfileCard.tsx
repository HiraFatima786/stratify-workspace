'use client';

import React, { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { updateProfile } from '@/lib/data-service';
import { Mail, Briefcase, Building, Edit3, Check, X, Lock, Calendar } from 'lucide-react';

interface MemberProfileCardProps {
  profile: Profile;
  onProfileUpdated?: (updated: Profile) => void;
  canEdit?: boolean;
}

export default function MemberProfileCard({
  profile,
  onProfileUpdated,
  canEdit = true,
}: MemberProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [description, setDescription] = useState(profile.description || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [jobTitle, setJobTitle] = useState(profile.job_title || '');
  const [startDate, setStartDate] = useState(profile.start_date || '');
  const [endDate, setEndDate] = useState(profile.end_date || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync local state if parent profile prop changes (e.g. member switch)
  useEffect(() => {
    setFullName(profile.full_name);
    setDescription(profile.description || '');
    setDepartment(profile.department || '');
    setJobTitle(profile.job_title || '');
    setStartDate(profile.start_date || '');
    setEndDate(profile.end_date || '');
    setIsEditing(false);
  }, [profile.id]);

  const handleCancel = () => {
    setFullName(profile.full_name);
    setDescription(profile.description || '');
    setDepartment(profile.department || '');
    setJobTitle(profile.job_title || '');
    setStartDate(profile.start_date || '');
    setEndDate(profile.end_date || '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateProfile(profile.id, {
        full_name: fullName.trim(),
        description: description.trim(),
        department: department.trim(),
        job_title: jobTitle.trim(),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      if (updated && onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (isEditing ? fullName : profile.full_name)?.[0]?.toUpperCase() || '?';

  return (
    <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>

      {/* Save success toast */}
      {saveSuccess && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'var(--accent-emerald-soft)',
            border: '1px solid #abf5d1',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-emerald)',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Check size={14} />
          Profile saved!
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          {/* Avatar */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '12px',
              background: profile.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.6rem',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(0, 82, 204, 0.25)',
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <input
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                style={{ fontSize: '1.1rem', fontWeight: 700, padding: '6px 10px', marginBottom: '6px' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {profile.full_name}
                </h2>
                <span className={`badge ${profile.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                  {profile.role}
                </span>
              </div>
            )}
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  className="input-field"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Job title"
                  style={{ fontSize: '0.84rem', padding: '6px 10px', flex: 1 }}
                />
                <input
                  className="input-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Department"
                  style={{ fontSize: '0.84rem', padding: '6px 10px', flex: 1 }}
                />
              </div>
            ) : (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {profile.job_title} • {profile.department}
              </p>
            )}
          </div>
        </div>

        {/* Right side: isolation pill + edit button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              background: 'var(--accent-emerald-soft)',
              border: '1px solid #abf5d1',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              color: 'var(--accent-emerald)',
              fontWeight: 700,
            }}
          >
            <Lock size={12} />
            Isolated Profile Space
          </div>

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              <Edit3 size={13} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div
        style={{
          background: '#f4f5f7',
          border: `1px solid ${isEditing ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '16px 18px',
          marginBottom: '20px',
          transition: 'border-color 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Member Profile &amp; Role Description
          </span>
        </div>

        {isEditing ? (
          <textarea
            className="input-field"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your role, focus areas, and what you're working on..."
            style={{ resize: 'vertical', background: '#ffffff' }}
          />
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {profile.description || 'No description provided.'}
          </p>
        )}
      </div>

      {/* Meta Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: isEditing ? '16px' : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Mail size={15} color="var(--accent-primary)" />
          <span>{profile.email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Building size={15} color="var(--accent-primary)" />
          <span>{isEditing ? department || '—' : profile.department}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Briefcase size={15} color="var(--accent-emerald)" />
          <span>{isEditing ? jobTitle || '—' : profile.job_title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Calendar size={15} color="var(--accent-cyan)" />
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Start:</strong>{' '}
            {isEditing ? (startDate || '—') : (profile.start_date ? new Date(profile.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Calendar size={15} color="var(--accent-rose)" />
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>End:</strong>{' '}
            {isEditing ? (endDate || '—') : (profile.end_date ? new Date(profile.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')}
          </span>
        </div>
      </div>

      {/* Date pickers — only shown in edit mode */}
      {isEditing && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={11} />
              Start Date
            </label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
          <div>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={11} />
              End Date
            </label>
            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>
        </div>
      )}

      {/* Save / Cancel buttons */}
      {isEditing && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleSave}
            disabled={saving || !fullName.trim()}
            className="btn btn-primary btn-sm"
            style={{ minWidth: '120px' }}
          >
            <Check size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="btn btn-ghost btn-sm"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
