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
    .from('profiles')
    .select('onboarding_completed, onboarding')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    onboardingCompleted: data?.onboarding_completed ?? false,
    onboarding: data?.onboarding ?? null,
  });
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
  const { onboarding } = body;

  if (!onboarding || typeof onboarding !== 'object') {
    return NextResponse.json({ error: msg(locale, 'Requisição inválida. Envie onboarding.', 'Invalid request. Send onboarding.') }, { status: 400 });
  }

  const payload = {
    id: user.id,
    onboarding_completed: true,
    onboarding,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('onboarding_completed, onboarding')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    onboardingCompleted: data.onboarding_completed,
    onboarding: data.onboarding,
  });
}
