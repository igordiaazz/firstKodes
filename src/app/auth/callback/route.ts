import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();

  if (!supabase) {
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/login?error=not_configured`);
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const locale = request.cookies.get('NEXT_LOCALE')?.value ?? 'pt';
  const loginUrl = `${origin}/${locale}/login`;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next === '/' ? `/${locale}/` : next;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${loginUrl}?error=auth_failed`);
}
