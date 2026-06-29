import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? null);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();

  const payload: Record<string, unknown> = {
    user_id: user.id,
    lives: body.lives,
    unlocked_modules: body.unlockedModules ?? body.unlocked_modules,
    phases_completed: body.phasesCompleted ?? body.phases_completed,
    streak: body.streak,
    module_start_time: body.moduleStartTime ?? body.module_start_time,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('progress')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
