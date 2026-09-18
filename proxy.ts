import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dejar pasar siempre:
  // - Login y su API
  // - API de marcado de asistencia (pública)
  // - Requests OPTIONS (CORS preflight)
  if (
    pathname.startsWith('/login') || 
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/marcar') ||
    req.method === 'OPTIONS'
  ) {
    return NextResponse.next();
  }

  // Para el resto de rutas, verificar sesión
  const sesion = req.cookies.get('dashboard_session')?.value;

  if (sesion !== process.env.DASHBOARD_SESSION_SECRET) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
