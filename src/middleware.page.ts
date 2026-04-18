export const runtime = 'experimental-edge'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const UNKNOWN_VAL = 'unknown'

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || UNKNOWN_VAL
  const userAgent = request.headers.get('user-agent') || UNKNOWN_VAL

  console.log(`[ACCESS] ${new Date().toISOString()} | ${request.method} ${request.nextUrl.pathname} | IP: ${ip} | User: ${userAgent}`)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}