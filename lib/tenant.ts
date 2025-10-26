/**
 * Extract tenant slug from subdomain
 * 
 * Examples:
 * - acme.synnova.com → "acme"
 * - company.synnova.com → "company"
 * - localhost:3001 → "default" (fallback for development)
 * - synnova.com → "default" (main domain without subdomain)
 */
export function getTenantFromHostname(hostname?: string): string {
  // Use provided hostname or get from window if in browser
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  
  // Development: localhost or 127.0.0.1
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // Check for subdomain in localhost (e.g., acme.localhost)
    const parts = host.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0];
    }
    return process.env.NEXT_PUBLIC_TENANT || 'default';
  }
  
  // Production: Extract subdomain
  const parts = host.split('.');
  
  // If no subdomain (e.g., synnova.com or example.com)
  if (parts.length <= 2) {
    return process.env.NEXT_PUBLIC_TENANT || 'default';
  }
  
  // Extract subdomain (first part)
  // acme.synnova.com → "acme"
  // company.example.com → "company"
  return parts[0];
}

/**
 * Get full API URL with tenant
 */
export function getApiUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const tenant = getTenantFromHostname();
  
  return `${baseUrl}/${tenant}`;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';
}

/**
 * Get tenant information for display
 */
export function getTenantInfo(): { slug: string; isDevelopment: boolean } {
  return {
    slug: getTenantFromHostname(),
    isDevelopment: !isProduction(),
  };
}
