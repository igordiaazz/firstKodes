import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function msg(locale: string | undefined, pt: string, en: string): string {
  return locale === 'en' ? en : pt;
}

const localeFromRequest = (req: NextRequest) => req.headers.get('accept-language')?.startsWith('en') ? 'en' : 'pt';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const locale = localeFromRequest(request);

  if (!supabase) {
    return NextResponse.json({ error: msg(locale, 'Supabase não configurado', 'Supabase not configured') }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: msg(locale, 'Não autenticado', 'Not authenticated') }, { status: 401 });
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
  const locale = localeFromRequest(request);

  if (!supabase) {
    return NextResponse.json({ error: msg(locale, 'Supabase não configurado', 'Supabase not configured') }, { status: 501 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: msg(locale, 'Não autenticado', 'Not authenticated') }, { status: 401 });
  }

  const body = await request.json();

  const payload: Record<string, unknown> = {
    user_id: user.id,
    lives: body.lives,
    unlocked_modules: body.unlockedModules ?? body.unlocked_modules,
    phases_completed: body.phasesCompleted ?? body.phases_completed,
    streak: body.streak,
    last_activity_date: body.lastActivityDate ?? body.last_activity_date ?? null,
    module_start_time: body.moduleStartTime ?? body.module_start_time,
    kode_score: body.kodeScore ?? body.kode_score ?? 0,
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
