import { NextRequest } from 'next/server';
import { authMiddleware, withSecurityHeaders, withRateLimit } from './middleware/auth';

export async function middleware(request: NextRequest) {
  // Apply security headers to all responses
  let response = await authMiddleware(request);
  
  // Add security headers
  response = withSecurityHeaders(response);
  
  return response;
}

// Configure which paths should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json).*)',
  ],
};