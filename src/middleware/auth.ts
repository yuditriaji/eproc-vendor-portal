import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key for JWT verification (should be in environment variables)
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
);

// Protected routes that require authentication
const protectedRoutes = [
  '/vendor/dashboard',
  '/vendor/submit',
  '/api/vendor',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/vendor/register',
  '/api/auth/register',
  '/api/auth/login',
];

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // If it's not a vendor route, continue without auth check
  if (!pathname.startsWith('/vendor') && !pathname.startsWith('/api/vendor')) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If no token and accessing protected route, redirect to register
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL('/vendor/register', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If token exists, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-email', payload.email as string);
      
      // If verified and accessing register page, redirect to dashboard
      if (pathname === '/vendor/register') {
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token is invalid, remove it and redirect if accessing protected route
      const response = isProtectedRoute
        ? NextResponse.redirect(new URL('/vendor/register', request.url))
        : NextResponse.next();

      // Clear invalid token
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Continue for public routes
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
export function withRateLimit(handler: any, limit = 10, windowMs = 60000) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
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