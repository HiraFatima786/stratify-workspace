import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();
    const { email, password, full_name, role, department, job_title, description } = body;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    updateData.user_metadata = {
      full_name,
      role,
      department,
      job_title,
      description
    };

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also update the public.profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id,
      email: data.user.email || email,
      full_name,
      role,
      department,
      job_title,
      description
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
