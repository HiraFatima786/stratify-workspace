'use client';

import { supabase, isSupabaseConfigured } from './supabase/client';
import { Profile, AttendanceRecord, DailyReportMessage, DailyHoursSummary, DailyUpdate, DailyUpdateComment } from './types';

// Pre-seeded Demo Profiles
export const SEED_PROFILES: Profile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@company.com',
    full_name: 'Sarah Vance',
    role: 'admin',
    department: 'Executive Management',
    job_title: 'Engineering Director & Admin',
    description:
      'Oversees product velocity, team alignment, attendance tracking, and daily standup reviews. Ready to assist members with unblocking daily tasks.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    created_at: new Date('2026-01-01T08:00:00Z').toISOString(),
  },
  {
    id: 'user-member-1',
    email: 'alex@company.com',
    full_name: 'Alex Rivera',
    role: 'member',
    department: 'Frontend Engineering',
    job_title: 'Senior Frontend Engineer',
    description:
      'Specialized in Next.js, React component architecture, and fluid responsive user interfaces. Currently focusing on building real-time dashboard widgets and responsive charts.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at: new Date('2026-01-10T09:00:00Z').toISOString(),
  },
  {
    id: 'user-member-2',
    email: 'david@company.com',
    full_name: 'David Chen',
    role: 'member',
    department: 'Data & Infrastructure',
    job_title: 'Cloud Systems Architect',
    description:
      'Leads PostgreSQL query optimization, Supabase RLS security policies, CI/CD pipeline automation, and distributed cloud performance tuning.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    created_at: new Date('2026-01-15T09:00:00Z').toISOString(),
  },
  {
    id: 'user-member-3',
    email: 'elena@company.com',
    full_name: 'Elena Rostova',
    role: 'member',
    department: 'Product Design',
    job_title: 'Staff UI/UX Designer',
    description:
      'Creates design systems, interactive Figma prototypes, accessible micro-interactions, and sleek glassmorphism UI themes for internal employee portals.',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    created_at: new Date('2026-02-01T09:00:00Z').toISOString(),
  },
];

// Helper to get today's date string YYYY-MM-DD
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Format duration helper
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0 && minutes === 0) return '0h 0m';
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

// Storage keys for demo local mode
const STORAGE_KEYS = {
  CURRENT_USER: 'teamsflow_current_user',
  PROFILES: 'teamsflow_profiles',
  ATTENDANCE: 'teamsflow_attendance',
  MESSAGES: 'teamsflow_messages',
  DAILY_UPDATES: 'teamsflow_daily_updates',
  DAILY_UPDATE_COMMENTS: 'teamsflow_daily_update_comments',
};

// Initial default attendance records for realism in demo
const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-hist-1',
    user_id: 'user-member-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    check_in_time: new Date(Date.now() - 86400000 - 3600000 * 8.5).toISOString(),
    check_out_time: new Date(Date.now() - 86400000 - 3600000 * 0.5).toISOString(),
    total_minutes: 480, // 8 hours
    status: 'checked_out',
    notes: 'Completed sprint items and reviewed pull requests.',
  },
  {
    id: 'att-hist-2',
    user_id: 'user-member-2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    check_in_time: new Date(Date.now() - 86400000 - 3600000 * 9).toISOString(),
    check_out_time: new Date(Date.now() - 86400000 - 3600000 * 1.5).toISOString(),
    total_minutes: 450, // 7.5 hours
    status: 'checked_out',
    notes: 'Database migration and indexing benchmark.',
  },
];

const DEFAULT_MESSAGES: DailyReportMessage[] = [
  {
    id: 'msg-1',
    member_id: 'user-member-1',
    sender_id: 'user-member-1',
    sender_name: 'Alex Rivera',
    sender_role: 'member',
    content: 'Good morning Sarah! Today I am working on the check-in time tracking widget and ensuring isolated member view security.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'msg-2',
    member_id: 'user-member-1',
    sender_id: 'user-admin-1',
    sender_name: 'Sarah Vance',
    sender_role: 'admin',
    content: 'Great update Alex. Please ping me once the hours calculation is wired up so we can verify the timesheet records.',
    created_at: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  },
  {
    id: 'msg-3',
    member_id: 'user-member-2',
    sender_id: 'user-member-2',
    sender_name: 'David Chen',
    sender_role: 'member',
    content: 'Daily report: Completed the Supabase RLS security policies review. Testing multi-tenant role isolation today.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'msg-4',
    member_id: 'user-member-2',
    sender_id: 'user-admin-1',
    sender_name: 'Sarah Vance',
    sender_role: 'admin',
    content: 'Awesome work David. Everything looks solid on the database schema.',
    created_at: new Date(Date.now() - 3600000 * 4.2).toISOString(),
  },
];

// Local storage init
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  let isRealUser = false;
  let loggedInUser: Profile | null = null;
  if (rawUser) {
    try {
      loggedInUser = JSON.parse(rawUser);
      if (loggedInUser?.email && !loggedInUser.email.endsWith('@company.com')) {
        isRealUser = true;
      }
    } catch {
      // ignore
    }
  }

  // If a real user is logged in, ensure dummy SEED_PROFILES do not contaminate the accounts list
  if (isRealUser && loggedInUser) {
    const rawProf = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (rawProf) {
      try {
        const profs = JSON.parse(rawProf);
        if (Array.isArray(profs)) {
          const filtered = profs.filter((p: Profile) => !p.email?.endsWith('@company.com'));
          if (filtered.length > 0) {
            if (!filtered.some((p: Profile) => p.id === loggedInUser!.id || p.email === loggedInUser!.email)) {
              filtered.push(loggedInUser);
            }
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(filtered));
          } else {
            localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([loggedInUser]));
          }
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([loggedInUser]));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([loggedInUser]));
    }
  } else if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
  }
}

// -------------------------------------------------------------
// Authentication & Session
// -------------------------------------------------------------
export async function getCurrentUser(): Promise<Profile | null> {
  if (typeof window === 'undefined') return null;

  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  let localUser: Profile | null = null;
  if (raw) {
    try {
      localUser = JSON.parse(raw);
    } catch {
      localUser = null;
    }
  }

  // 1. If an account has been actively chosen or switched, use it and refresh latest profile info from Supabase if connected
  if (localUser?.id) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', localUser.id)
          .single();
        if (dbProfile) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(dbProfile));
          return dbProfile;
        }
      } catch {
        // use localUser if Supabase query failed or offline
      }
    }
    return localUser;
  }

  // 2. Otherwise fall back to the active Supabase auth session user
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          const meta = session.user.user_metadata || {};
          const email = session.user.email || '';
          const fallbackRole = (meta.role === 'admin' || email.includes('admin')) ? 'admin' : 'member';
          const newProf: Profile = {
            id: session.user.id,
            email: email,
            full_name: meta.full_name || email.split('@')[0],
            role: fallbackRole,
            department: meta.department || 'Engineering',
            job_title: meta.job_title || 'Software Specialist',
            description: meta.description || 'Dedicated team member.',
          };
          try {
            await supabase.from('profiles').insert(newProf);
            profile = newProf;
          } catch {
            profile = newProf;
          }
        }
        if (profile) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
          return profile;
        }
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

export async function loginUser(email: string, password?: string): Promise<{ success: boolean; user?: Profile; error?: string }> {
  initLocalStorage();
  const cleanEmail = email.trim().toLowerCase();

  // If live Supabase is configured and a password was passed
  if (isSupabaseConfigured() && supabase && password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          const meta = data.user.user_metadata || {};
          const fallbackRole = (meta.role === 'admin' || cleanEmail.includes('admin')) ? 'admin' : 'member';
          const newProf: Profile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: meta.full_name || cleanEmail.split('@')[0],
            role: fallbackRole,
            department: meta.department || (fallbackRole === 'admin' ? 'Administration' : 'Engineering'),
            job_title: meta.job_title || (fallbackRole === 'admin' ? 'Team Administrator' : 'Software Specialist'),
            description: meta.description || 'Dedicated team member.',
          };
          try {
            await supabase.from('profiles').insert(newProf);
            profile = newProf;
          } catch {
            profile = newProf;
          }
        }

        if (profile) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
          }
          return { success: true, user: profile };
        }
      }
    } catch (err: unknown) {
      console.warn('Supabase auth failed, falling back to local credentials', err);
    }
  }

  // Demo / local store mode match
  const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || JSON.stringify(SEED_PROFILES));
  const found = profiles.find((p) => p.email.toLowerCase() === cleanEmail);

  if (found) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    window.dispatchEvent(new Event('teamsflow_auth_changed'));
    return { success: true, user: found };
  }

  // Allow test login for any member or admin email
  const isSarahAdmin = cleanEmail.includes('admin');
  const newProfile: Profile = {
    id: 'user-' + Date.now(),
    email: cleanEmail,
    full_name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    role: isSarahAdmin ? 'admin' : 'member',
    department: isSarahAdmin ? 'Administration' : 'General Department',
    job_title: isSarahAdmin ? 'Team Administrator' : 'Software Member',
    description: isSarahAdmin
      ? 'System administrator supervising teams, attendance logs, and daily tasks.'
      : 'Dedicated member logging in to manage daily tasks, check-in time, and daily report threads.',
    created_at: new Date().toISOString(),
  };

  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newProfile));
  window.dispatchEvent(new Event('teamsflow_auth_changed'));

  return { success: true, user: newProfile };
}

export async function updateUserPassword(
  oldPassword: string,
  newPassword: string,
  userEmail?: string
): Promise<{ success: boolean; error?: string }> {
  if (!oldPassword || !oldPassword.trim()) {
    return { success: false, error: 'Current password is required.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }
  if (oldPassword === newPassword) {
    return { success: false, error: 'New password cannot be the same as your current password.' };
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      // Determine email of the user
      let email = userEmail;
      if (!email) {
        const { data: { session } } = await supabase.auth.getSession();
        email = session?.user?.email;
      }
      if (!email && typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            email = parsed?.email;
          } catch {
            // ignore
          }
        }
      }

      if (!email) {
        return { success: false, error: 'Unable to detect active user session. Please log in again.' };
      }

      // Step 1: Verify current password against Supabase auth.users
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: oldPassword,
      });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes('invalid') || msg.includes('credentials')) {
          return { success: false, error: 'The current password you entered is incorrect.' };
        }
        return { success: false, error: signInError.message };
      }

      // Step 2: Update password in Supabase auth.users
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Password update exception:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred while updating password.',
      };
    }
  }

  // Fallback for local demo mode if supabase is not active
  return { success: true };
}

export async function switchCurrentUser(profile: Profile): Promise<void> {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        const current = JSON.parse(raw);
        if (current.role === 'admin' && !localStorage.getItem('stratify_admin_session')) {
          localStorage.setItem('stratify_admin_session', JSON.stringify(current));
        }
      } catch {
        // ignore
      }
    }
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
    window.dispatchEvent(new Event('teamsflow_auth_changed'));
  }
}

export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('stratify_admin_session');
    window.dispatchEvent(new Event('teamsflow_auth_changed'));
  }
}

// -------------------------------------------------------------
// Profiles API
// -------------------------------------------------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || JSON.stringify(SEED_PROFILES));
  return profiles.find((p) => p.id === userId) || null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const profiles: Profile[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES) || JSON.stringify(SEED_PROFILES));
  const idx = profiles.findIndex((p) => p.id === userId);
  if (idx !== -1) {
    profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // If updating current user, refresh current user session
    const currentUser = await getCurrentUser();
    if (currentUser?.id === userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profiles[idx]));
    }
    window.dispatchEvent(new Event('teamsflow_data_changed'));
    return profiles[idx];
  }
  return null;
}

export async function getAllMembers(): Promise<Profile[]> {
  initLocalStorage();
  const rawCurrentUser = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.CURRENT_USER) : null;
  let currentUser: Profile | null = null;
  if (rawCurrentUser) {
    try {
      currentUser = JSON.parse(rawCurrentUser);
    } catch {
      // ignore
    }
  }
  const isRealUserSession = currentUser?.email && !currentUser.email.endsWith('@company.com');

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Try get_team_members RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_team_members');
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const finalRpc = isRealUserSession ? rpcData.filter((p: Profile) => !p.email?.endsWith('@company.com')) : rpcData;
        const validList = finalRpc.length > 0 ? finalRpc : rpcData;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(validList));
        }
        return validList;
      }

      // 2. Direct select from profiles
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (!error && data && Array.isArray(data) && data.length > 0) {
        const filtered = isRealUserSession ? data.filter((p: Profile) => !p.email?.endsWith('@company.com')) : data;
        const validList = filtered.length > 0 ? filtered : data;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(validList));
        }
        return validList;
      }
    } catch (err) {
      console.warn('Failed to fetch profiles from Supabase:', err);
    }
  }

  // Local storage check
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.PROFILES) : null;
  if (raw) {
    try {
      const parsed: Profile[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (isRealUserSession) {
          const nonDemo = parsed.filter((p) => !p.email?.endsWith('@company.com'));
          if (nonDemo.length > 0) return nonDemo;
          if (currentUser) return [currentUser];
        }
        return parsed;
      }
    } catch {
      // fallback
    }
  }

  if (currentUser && isRealUserSession) {
    return [currentUser];
  }

  return SEED_PROFILES;
}

// -------------------------------------------------------------
// Attendance API (Check-in, Check-out, Daily Hours Calculation)
// -------------------------------------------------------------
export async function getAttendanceHistory(userId?: string): Promise<AttendanceRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('attendance').select('*').order('check_in_time', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data } = await query;
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
  if (userId) {
    return records.filter((r) => r.user_id === userId).sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
  }
  return records.sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
}

export async function checkIn(userId: string, notes?: string): Promise<AttendanceRecord> {
  const now = new Date();
  const today = getTodayDateString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert({
          user_id: userId,
          date: today,
          check_in_time: now.toISOString(),
          status: 'checked_in',
          notes: notes || '',
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');

  const newRecord: AttendanceRecord = {
    id: 'att-' + Date.now(),
    user_id: userId,
    date: today,
    check_in_time: now.toISOString(),
    check_out_time: null,
    total_minutes: null,
    status: 'checked_in',
    notes: notes || '',
    created_at: now.toISOString(),
  };

  records.unshift(newRecord);
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  window.dispatchEvent(new Event('teamsflow_attendance_changed'));
  return newRecord;
}

export async function checkOut(userId: string, notes?: string): Promise<AttendanceRecord | null> {
  const now = new Date();
  const today = getTodayDateString();

  if (isSupabaseConfigured() && supabase) {
    try {
      // Find open record
      const { data: openRecords } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'checked_in')
        .order('check_in_time', { ascending: false })
        .limit(1);

      if (openRecords && openRecords.length > 0) {
        const record = openRecords[0];
        const checkInTime = new Date(record.check_in_time).getTime();
        const checkOutTime = now.getTime();
        const diffMinutes = Math.max(0, Math.floor((checkOutTime - checkInTime) / 60000));

        const { data: updated } = await supabase
          .from('attendance')
          .update({
            check_out_time: now.toISOString(),
            total_minutes: diffMinutes,
            status: 'checked_out',
            notes: notes || record.notes,
          })
          .eq('id', record.id)
          .select()
          .single();

        if (updated) return updated;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');

  // Find active checked-in session for user
  const recordIdx = records.findIndex((r) => r.user_id === userId && r.status === 'checked_in');

  if (recordIdx !== -1) {
    const record = records[recordIdx];
    const checkInMs = new Date(record.check_in_time).getTime();
    const checkOutMs = now.getTime();
    const diffMinutes = Math.max(0, Math.floor((checkOutMs - checkInMs) / 60000));

    records[recordIdx] = {
      ...record,
      check_out_time: now.toISOString(),
      total_minutes: diffMinutes,
      status: 'checked_out',
      notes: notes ? `${record.notes ? record.notes + ' | ' : ''}${notes}` : record.notes,
    };

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    window.dispatchEvent(new Event('teamsflow_attendance_changed'));
    return records[recordIdx];
  }

  return null;
}

// Compute daily hours summary for a member today
export function calculateTodaySummary(records: AttendanceRecord[], userId: string): DailyHoursSummary {
  const today = getTodayDateString();
  const todayRecords = records.filter((r) => r.user_id === userId && r.date === today);

  let totalMinutes = 0;
  let isCheckedInNow = false;
  let currentSessionMinutes = 0;
  let lastCheckInTime: string | null = null;

  for (const rec of todayRecords) {
    if (rec.status === 'checked_out' && rec.total_minutes) {
      totalMinutes += rec.total_minutes;
    } else if (rec.status === 'checked_in') {
      isCheckedInNow = true;
      lastCheckInTime = rec.check_in_time;
      const elapsedMs = Date.now() - new Date(rec.check_in_time).getTime();
      const elapsed = Math.floor(elapsedMs / 60000); // floor so 59s shows 0m, not 1m
      currentSessionMinutes = elapsed;
      totalMinutes += elapsed;
    }
  }

  return {
    totalMinutesWorked: totalMinutes,
    formattedHours: formatMinutes(totalMinutes),
    sessionsCount: todayRecords.length,
    isCheckedInNow,
    currentSessionMinutes,
    lastCheckInTime,
  };
}

// -------------------------------------------------------------
// Daily Reports Thread Chat API
// -------------------------------------------------------------
export async function getDailyReportMessages(memberId: string): Promise<DailyReportMessage[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('daily_report_messages')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: true });
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const messages: DailyReportMessage[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
  return messages.filter((m) => m.member_id === memberId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function sendDailyReportMessage(
  memberId: string,
  sender: Profile,
  content: string
): Promise<DailyReportMessage> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_report_messages')
        .insert({
          member_id: memberId,
          sender_id: sender.id,
          sender_name: sender.full_name,
          sender_role: sender.role,
          content: content.trim(),
        })
        .select()
        .single();
      if (!error && data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const messages: DailyReportMessage[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');

  const newMsg: DailyReportMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    member_id: memberId,
    sender_id: sender.id,
    sender_name: sender.full_name,
    sender_role: sender.role,
    content: content.trim(),
    created_at: now,
  };

  messages.push(newMsg);
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  window.dispatchEvent(new CustomEvent('teamsflow_message_sent', { detail: { memberId } }));
  return newMsg;
}

// -------------------------------------------------------------
// Daily Task Updates API
// -------------------------------------------------------------
export async function getDailyUpdates(userId: string, date?: string): Promise<DailyUpdate[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('daily_updates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (date) query = query.eq('date', date);
      const { data } = await query;
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const updates: DailyUpdate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES) || '[]');
  let filtered = updates.filter((u) => u.user_id === userId);
  if (date) filtered = filtered.filter((u) => u.date === date);
  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllDailyUpdates(date?: string): Promise<DailyUpdate[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from('daily_updates')
        .select('*')
        .order('created_at', { ascending: false });
      if (date) query = query.eq('date', date);
      const { data } = await query;
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const updates: DailyUpdate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES) || '[]');
  let result = [...updates];
  if (date) result = result.filter((u) => u.date === date);
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function submitDailyUpdate(
  userId: string,
  workDescription: string,
  hoursWorked: number,
  fileLink?: string
): Promise<DailyUpdate> {
  const now = new Date();
  const today = getTodayDateString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_updates')
        .insert({
          user_id: userId,
          date: today,
          work_description: workDescription.trim(),
          hours_worked: hoursWorked,
          file_link: fileLink?.trim() || '',
        })
        .select()
        .single();
      if (!error && data) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added', { detail: { userId } }));
        }
        return data;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const updates: DailyUpdate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES) || '[]');

  const newUpdate: DailyUpdate = {
    id: 'upd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    user_id: userId,
    date: today,
    work_description: workDescription.trim(),
    hours_worked: hoursWorked,
    file_link: fileLink?.trim() || '',
    admin_checked: false,
    created_at: now.toISOString(),
  };

  updates.unshift(newUpdate);
  localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(updates));
  window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added', { detail: { userId } }));
  return newUpdate;
}

export async function deleteDailyUpdate(updateId: string, userId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('daily_updates')
        .delete()
        .eq('id', updateId)
        .eq('user_id', userId);
      if (!error) {
        window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added', { detail: { userId } }));
        return true;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const updates: DailyUpdate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES) || '[]');
  const filtered = updates.filter((u) => !(u.id === updateId && u.user_id === userId));
  localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added', { detail: { userId } }));
  return true;
}

export async function toggleDailyUpdateAdminCheck(updateId: string, checked: boolean): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('daily_updates')
        .update({ admin_checked: checked })
        .eq('id', updateId);
      if (!error) {
        window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added'));
        return true;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const updates: DailyUpdate[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATES) || '[]');
  const index = updates.findIndex((u) => u.id === updateId);
  if (index !== -1) {
    updates[index].admin_checked = checked;
    localStorage.setItem(STORAGE_KEYS.DAILY_UPDATES, JSON.stringify(updates));
    window.dispatchEvent(new CustomEvent('teamsflow_daily_update_added'));
    return true;
  }
  return false;
}

// -------------------------------------------------------------
// Daily Update Comments API
// -------------------------------------------------------------

export async function getDailyUpdateComments(updateId: string): Promise<DailyUpdateComment[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('daily_update_comments')
        .select('*')
        .eq('daily_update_id', updateId)
        .order('created_at', { ascending: true });
      if (data) return data;
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const comments: DailyUpdateComment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATE_COMMENTS) || '[]');
  return comments.filter((c) => c.daily_update_id === updateId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function addDailyUpdateComment(
  updateId: string,
  author: Profile,
  content: string
): Promise<DailyUpdateComment> {
  const now = new Date();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_update_comments')
        .insert({
          daily_update_id: updateId,
          author_id: author.id,
          author_name: author.full_name,
          author_role: author.role,
          content: content.trim(),
        })
        .select()
        .single();
      if (!error && data) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('teamsflow_daily_update_comment_added', { detail: { updateId } }));
        }
        return data;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const comments: DailyUpdateComment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATE_COMMENTS) || '[]');

  const newComment: DailyUpdateComment = {
    id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    daily_update_id: updateId,
    author_id: author.id,
    author_name: author.full_name,
    author_role: author.role,
    content: content.trim(),
    created_at: now.toISOString(),
  };

  comments.push(newComment);
  localStorage.setItem(STORAGE_KEYS.DAILY_UPDATE_COMMENTS, JSON.stringify(comments));
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('teamsflow_daily_update_comment_added', { detail: { updateId } }));
  }
  
  return newComment;
}

export async function deleteDailyUpdateComment(commentId: string, authorId: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('daily_update_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', authorId);
      if (!error) {
        return true;
      }
    } catch {
      // fallback
    }
  }

  initLocalStorage();
  const comments: DailyUpdateComment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_UPDATE_COMMENTS) || '[]');
  const filtered = comments.filter((c) => !(c.id === commentId && c.author_id === authorId));
  localStorage.setItem(STORAGE_KEYS.DAILY_UPDATE_COMMENTS, JSON.stringify(filtered));
  return true;
}
