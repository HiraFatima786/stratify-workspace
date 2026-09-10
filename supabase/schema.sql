-- ==============================================================================
-- Supabase Schema for Team Portal (Member & Admin Roles, Attendance, Daily Reports)
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  department TEXT DEFAULT 'Engineering',
  job_title TEXT DEFAULT 'Software Specialist',
  description TEXT DEFAULT 'Dedicated team member passionate about building quality products and collaborating daily.',
  avatar_url TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  total_minutes INTEGER,
  status TEXT NOT NULL CHECK (status IN ('checked_in', 'checked_out')) DEFAULT 'checked_in',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create daily_report_messages table (Daily Reports Thread)
CREATE TABLE IF NOT EXISTS public.daily_report_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'member')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_report_messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies for Profiles
-- Allow all team members to view team profiles directory
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all users to view profiles" ON public.profiles;
CREATE POLICY "Allow all users to view profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Sync all existing auth.users into public.profiles
INSERT INTO public.profiles (id, email, full_name, role, department, job_title)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', CASE WHEN email ILIKE '%admin%' OR email ILIKE '%hira%' THEN 'admin' ELSE 'member' END),
  COALESCE(raw_user_meta_data->>'department', 'General Department'),
  COALESCE(raw_user_meta_data->>'job_title', 'Software Specialist')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  role = CASE 
    WHEN public.profiles.email ILIKE '%admin%' OR public.profiles.email ILIKE '%hira%' THEN 'admin'
    ELSE public.profiles.role 
  END;

-- RPC Function to safely fetch all team members directly synced with auth.users
CREATE OR REPLACE FUNCTION public.get_team_members()
RETURNS SETOF public.profiles AS $$
BEGIN
  -- Sync any new users from auth.users that are not yet in public.profiles
  INSERT INTO public.profiles (id, email, full_name, role, department, job_title)
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'role', CASE WHEN u.email ILIKE '%admin%' OR u.email ILIKE '%hira%' THEN 'admin' ELSE 'member' END),
    COALESCE(u.raw_user_meta_data->>'department', 'General Department'),
    COALESCE(u.raw_user_meta_data->>'job_title', 'Software Specialist')
  FROM auth.users u
  ON CONFLICT (id) DO NOTHING;

  RETURN QUERY SELECT * FROM public.profiles ORDER BY full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_team_members() TO anon, authenticated, service_role;

-- 6. RLS Policies for Attendance
-- Admins can view all attendance; Members can only view their own attendance
CREATE POLICY "Admins view all attendance, members view own"
  ON public.attendance FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Members and admins can insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Members and admins can update attendance"
  ON public.attendance FOR UPDATE
  USING (public.is_admin() OR auth.uid() = user_id);

-- 7. RLS Policies for Daily Report Messages
-- Admins can view all threads; Members can only view their own thread
CREATE POLICY "Admins view all messages, members view own thread"
  ON public.daily_report_messages FOR SELECT
  USING (public.is_admin() OR auth.uid() = member_id);

CREATE POLICY "Members and admins can send messages"
  ON public.daily_report_messages FOR INSERT
  WITH CHECK (
    public.is_admin() OR (
      auth.uid() = member_id AND auth.uid() = sender_id
    )
  );

-- 8. Auto-create Profile Trigger on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, description)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'description', 'Team member contributing to daily initiatives.')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create daily_updates table (Structured Daily Task Updates)
CREATE TABLE IF NOT EXISTS public.daily_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_description TEXT NOT NULL,
  hours_worked NUMERIC(4, 1) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  file_link TEXT DEFAULT '',
  admin_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Daily Updates
CREATE POLICY "Admins view all updates, members view own"
  ON public.daily_updates FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Members and admins can insert daily updates"
  ON public.daily_updates FOR INSERT
  WITH CHECK (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Members and admins can update daily updates"
  ON public.daily_updates FOR UPDATE
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Members and admins can delete own daily updates"
  ON public.daily_updates FOR DELETE
  USING (public.is_admin() OR auth.uid() = user_id);

-- 10. Create daily_update_comments table (Comments on Daily Task Updates)
CREATE TABLE IF NOT EXISTS public.daily_update_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_update_id UUID REFERENCES public.daily_updates(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.daily_update_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Daily Update Comments
DROP POLICY IF EXISTS "Admins and task owners can view comments" ON public.daily_update_comments;
DROP POLICY IF EXISTS "Admins and task owners can insert comments" ON public.daily_update_comments;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.daily_update_comments;
DROP POLICY IF EXISTS "Everyone can view comments" ON public.daily_update_comments;
DROP POLICY IF EXISTS "Members and admins can insert comments" ON public.daily_update_comments;

CREATE POLICY "Admins and task owners can view comments"
  ON public.daily_update_comments FOR SELECT
  USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.daily_updates
      WHERE id = daily_update_comments.daily_update_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and task owners can insert comments"
  ON public.daily_update_comments FOR INSERT
  WITH CHECK (
    public.is_admin() OR 
    (auth.uid() = author_id AND EXISTS (
      SELECT 1 FROM public.daily_updates
      WHERE id = daily_update_id
      AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Authors and admins can delete comments"
  ON public.daily_update_comments FOR DELETE
  USING (public.is_admin() OR auth.uid() = author_id);

-- 11. Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_report_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_update_comments;
