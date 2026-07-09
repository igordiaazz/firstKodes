import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const publicPaths = ['/login', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiPath = pathname.startsWith('/api');
  const isAuthCallback = pathname.startsWith('/auth');

  if (isApiPath || isAuthCallback) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith('your_');

    if (!isConfigured) {
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && !isApiPath && pathname !== '/auth/callback') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  const response = intlMiddleware(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith('your_');

  if (!isConfigured) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const segments = pathname.split('/');
  const hasLocalePrefix = (routing.locales as readonly string[]).includes(segments[1]);
  const pathWithoutLocale = hasLocalePrefix ? '/' + segments.slice(2).join('/') : pathname;
  const isPublicPath = publicPaths.some((p) => pathWithoutLocale.startsWith(p));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    const detectedLocale = request.cookies.get('NEXT_LOCALE')?.value ?? routing.defaultLocale;
    url.pathname = detectedLocale === routing.defaultLocale ? '/login' : `/${detectedLocale}/login`;
    return NextResponse.redirect(url);
  }

  if (user && pathWithoutLocale === '/login') {
    const url = request.nextUrl.clone();
    const detectedLocale = request.cookies.get('NEXT_LOCALE')?.value ?? routing.defaultLocale;
    url.pathname = detectedLocale === routing.defaultLocale ? '/' : `/${detectedLocale}/`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
