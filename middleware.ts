import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extract tenant from subdomain
  let tenant = 'default';
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Development: Check for subdomain in localhost
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      tenant = parts[0];
    } else {
      // Use environment variable for development
      tenant = process.env.NEXT_PUBLIC_TENANT || 'default';
    }
  } else {
    // Production: Extract subdomain
    const parts = hostname.split('.');
    
    // If subdomain exists (e.g., acme.synnova.com)
    if (parts.length > 2) {
      tenant = parts[0];
    }
  }
  
  // Add tenant to request headers for server-side use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant', tenant);
  
  // Continue with the request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add tenant to response headers
  response.headers.set('x-tenant', tenant);
  
  return response;
}

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
