import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/vendor/dashboard',
  '/vendor/bids',
  '/vendor/submit',
  '/api/vendor',
];

// Public routes that don't need authentication
const publicRoutes = [
  '/vendor/login',
  '/vendor/register',
];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If it's not a vendor route, continue without auth check
  if (!pathname.startsWith('/vendor') && !pathname.startsWith('/api/vendor')) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If no token and accessing protected route, redirect to login
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL('/vendor/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If token exists and accessing login/register, redirect to dashboard
  // (This helps prevent users from accessing login page when already logged in)
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
  }

  // Continue for all other routes
  return NextResponse.next();
}

// Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// IP-based rate limiting middleware
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  limit = 10,
  windowMs = 60000
) {
  return async (request: NextRequest) => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (!rateLimit(ip, limit, windowMs)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    return handler(request);
  };
}

// CORS headers for API routes
export function withCORS(response: NextResponse, origin?: string) {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://vendor-portal.eproc.com',
  ];

  const requestOrigin = origin || '*';
  
  if (allowedOrigins.includes(requestOrigin)) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// Security headers
export function withSecurityHeaders(response: NextResponse) {
  // Prevent XSS attacks
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}