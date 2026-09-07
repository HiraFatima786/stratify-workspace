export type UserRole = 'admin' | 'member';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  job_title: string;
  description: string;
  avatar_url?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
}

export type AttendanceStatus = 'checked_in' | 'checked_out';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  check_in_time: string; // ISO string
  check_out_time: string | null; // ISO string or null
  total_minutes: number | null; // integer duration
  status: AttendanceStatus;
  notes?: string;
  created_at?: string;
}

export interface DailyReportMessage {
  id: string;
  member_id: string; // The member whose daily thread this belongs to
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  content: string;
  created_at: string;
}

export interface DailyHoursSummary {
  totalMinutesWorked: number;
  formattedHours: string;
  sessionsCount: number;
  isCheckedInNow: boolean;
  currentSessionMinutes: number;
  lastCheckInTime: string | null;
}

export interface DailyUpdate {
  id: string;
  user_id: string;
  date: string;
  hours_worked: number;
  work_description: string;
  file_link?: string;
  created_at: string;
}
