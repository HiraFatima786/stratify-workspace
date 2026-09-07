'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, getCurrentUser, SEED_PROFILES } from '@/lib/data-service';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  Shield,
  User,
  Clock,
  MessageSquare,
  Lock,
  ArrowRight,
  Database,
  CheckCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import StratifyLogo from '@/components/StratifyLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);

  useEffect(() => {
    setIsLiveSupabase(isSupabaseConfigured());
    // Auto-redirect if already logged in
    getCurrentUser().then((user) => {
      if (user) {
        if (user.role === 'admin') router.push('/dashboard/admin');
        else router.push('/dashboard/member');
      }
    });
  }, [router]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginUser(email, password);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/member');
        }
      } else {
        setErrorMsg(res.error || 'Failed to authenticate. Please check credentials.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg('');
    setEmail(demoEmail);
    setPassword('demo123');

    const res = await loginUser(demoEmail, 'demo123');
    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/member');
      }
    } else {
      setErrorMsg(res.error || 'Quick login failed');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #ffffff 0%, #f4f5f7 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(9, 30, 66, 0.06)',
        }}
      >
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
              boxShadow: '0 2px 6px rgba(0, 82, 204, 0.25)',
            }}
          >
            <StratifyLogo size={22} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            stratify<span style={{ color: 'var(--accent-primary)' }}> workspace</span>
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Value Prop & Features */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'var(--accent-blue-soft)',
              border: '1px solid var(--accent-blue-border)',
              color: 'var(--accent-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            <Zap size={14} />
            Enterprise Member & Admin Platform
          </div>

          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
              color: 'var(--text-primary)',
            }}
          >
            Work, Check-In & <br />
            <span style={{ color: 'var(--accent-primary)' }}>
              Daily Reports Portal
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Empower members with real-time shift check-in and checkout, automated daily hours tracking, pre-configured isolated profiles, and dedicated Daily Reports task chat threads with management.
          </p>

          {/* Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--accent-emerald-soft)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Daily Check-In & Live Hours Calculation</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Active shift timer, automated daily hours calculation, and comprehensive timesheet history.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--accent-blue-soft)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>"Daily Reports" Task Thread Chat</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Direct communication thread between member and admin for daily updates, blockers, and status tagging.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--accent-purple-soft)',
                  color: 'var(--accent-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>Isolated Member Profile Architecture</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Every member's profile description and daily hours remain strictly isolated to themselves and administration.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Card & Quick Switch Demo */}
        <div>
          <div className="glass-panel glass-panel-glow" style={{ padding: '34px', maxWidth: '460px', margin: '0 auto', background: '#ffffff' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Sign In to Portal
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Enter your assigned email & password to access your role-based dashboard.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-rose-soft)',
                  border: '1px solid #ffbdad',
                  color: 'var(--accent-rose)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@company.com or admin@company.com"
                />
              </div>

              <div>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight size={18} />
              </button>
            </form>


          </div>
        </div>
      </main>

      {/* Supabase Schema Modal */}
      {showSqlGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(9, 30, 66, 0.54)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 200,
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '650px',
              width: '100%',
              padding: '28px',
              background: '#ffffff',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={20} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Supabase Integration Guide</h3>
              </div>
              <button
                onClick={() => setShowSqlGuide(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 10px' }}
              >
                Close
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              This app is ready to connect directly to your Supabase project with Row Level Security (RLS) policies and real-time daily reports.
            </p>

            <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
              <strong style={{ display: 'block', marginBottom: '6px' }}>Quick 2-Step Setup:</strong>
              <ol style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                <li>Copy <code style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>supabase/schema.sql</code> into your Supabase SQL Editor and click <strong>Run</strong>.</li>
                <li>Add your <code style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>NEXT_PUBLIC_SUPABASE_URL</code> and <code style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>.env.local</code>.</li>
              </ol>
            </div>

            <button
              onClick={() => setShowSqlGuide(false)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
