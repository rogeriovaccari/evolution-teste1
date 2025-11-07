import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Páginas públicas
  const publicPaths = ['/auth/login', '/auth/signup', '/auth/verify', '/api/auth']
  
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Verifica autenticação
  const sessionToken = request.cookies.get('session')?.value

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const session = verifySessionToken(sessionToken)

  if (!session) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('session')
    return response
  }

  // Verifica RBAC para rotas admin
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|manifest).*)',
  ],
}
