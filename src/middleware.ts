// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add this to verify the middleware file is actually loaded in the build
console.log(">>> Middleware initialized on server boot");

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown device'

  // LOG EVERY REQUEST
  console.log(`[ACCESS] ${new Date().toISOString()} | ${request.method} ${request.nextUrl.pathname} | IP: ${ip}`);

  return NextResponse.next()
}

export const config = {
  // Broaden the matcher to catch EVERYTHING for testing
  matcher: '/:path*',
}
