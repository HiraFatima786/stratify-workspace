-- ==============================================================================
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- and AFTER creating the 4 auth users via Authentication > Users in the dashboard.
-- This updates the profiles table with the correct names, roles, and departments.
-- ==============================================================================

-- Update admin profile
UPDATE public.profiles SET
  full_name    = 'Sarah Vance',
  role         = 'admin',
  department   = 'Executive Management',
  job_title    = 'Engineering Director & Admin',
  description  = 'Oversees product velocity, team alignment, attendance tracking, and daily standup reviews. Ready to assist members with unblocking daily tasks.'
WHERE email = 'admin@company.com';

-- Update member 1
UPDATE public.profiles SET
  full_name    = 'Alex Rivera',
  role         = 'member',
  department   = 'Frontend Engineering',
  job_title    = 'Senior Frontend Engineer',
  description  = 'Specialized in Next.js, React component architecture, and fluid responsive user interfaces.'
WHERE email = 'alex@company.com';

-- Update member 2
UPDATE public.profiles SET
  full_name    = 'David Chen',
  role         = 'member',
  department   = 'Data & Infrastructure',
  job_title    = 'Cloud Systems Architect',
  description  = 'Leads PostgreSQL query optimization, Supabase RLS security policies, CI/CD pipeline automation.'
WHERE email = 'david@company.com';

-- Update member 3
UPDATE public.profiles SET
  full_name    = 'Elena Rostova',
  role         = 'member',
  department   = 'Product Design',
  job_title    = 'Staff UI/UX Designer',
  description  = 'Creates design systems, interactive Figma prototypes, accessible micro-interactions, and sleek glassmorphism UI themes.'
WHERE email = 'elena@company.com';

-- Verify results
SELECT id, email, full_name, role, department FROM public.profiles ORDER BY role DESC;
