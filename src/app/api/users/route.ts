import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('*');

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 400 });
    }

    const mergedUsers = users.map((user: any) => {
      const profile = profiles.find((p: any) => p.id === user.id) || {};
      return {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: profile.full_name || user.user_metadata?.full_name || 'Unknown User',
          role: profile.role || user.user_metadata?.role || 'member',
          department: profile.department || user.user_metadata?.department || '',
          job_title: profile.job_title || user.user_metadata?.job_title || '',
          description: profile.description || user.user_metadata?.description || ''
        }
      };
    });

    return NextResponse.json({ users: mergedUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();
    const { email, password, full_name, role, department, job_title, description } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 });
    }

    // Pass custom data to user_metadata, which the trigger will use
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: role || 'member',
        department: department || '',
        job_title: job_title || '',
        description: description || ''
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Let's also update the profiles table just in case the trigger didn't catch the extra fields
    if (data?.user) {
      await supabaseAdmin.from('profiles').update({
        department: department || '',
        job_title: job_title || '',
        description: description || ''
      }).eq('id', data.user.id);
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
