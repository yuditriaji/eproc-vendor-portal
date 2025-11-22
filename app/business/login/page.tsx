'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant') || 'default';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === 'VENDOR') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/business/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login({ email, password }).unwrap();
      console.log('Login response:', result);
      
      // Handle both wrapped and unwrapped responses
      const responseData: any = result.data || result;
      
      if (responseData && (responseData.accessToken || responseData.token)) {
        // Extract token and user from response
        const token = responseData.accessToken || responseData.token;
        const user = responseData.user;
        
        dispatch(setCredentials({ token, user }));
        
        // Redirect based on role
        if (user.role === 'VENDOR') {
          router.push('/vendor/dashboard');
        } else {
          router.push('/business/dashboard');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Business Portal</CardTitle>
          <CardDescription>
            Sign in to your internal account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                    ? String(error.data.message)
                    : 'Invalid email or password'}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Tenant: <span className="font-medium">{tenant}</span></p>
            </div>

            <div className="text-center text-sm">
              <Link 
                href={`/vendor/login?tenant=${tenant}`}
                className="text-primary hover:underline"
              >
                Are you a vendor? Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BusinessLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
