import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Extract client IP (checking common headers for proxied requests)
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown device'

  // Log the access to the console so journalctl can capture it
  console.log(`[ACCESS] ${new Date().toISOString()} | ${request.method} ${request.nextUrl.pathname} | IP: ${ip} | User: ${userAgent}`)

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images/ (Any public static media)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
