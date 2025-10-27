'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useLoginMutation } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  
  const tenant = searchParams.get('tenant');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      console.log('Admin login response:', result);
      
      // Handle both wrapped and unwrapped responses
      const responseData: any = result.data || result;
      
      if (responseData && (responseData.accessToken || responseData.token)) {
        const token = responseData.accessToken || responseData.token;
        const user = responseData.user;
        
        // Verify admin role
        if (user?.role !== 'ADMIN') {
          toast.error('Access denied. Admin credentials required.');
          return;
        }
        
        dispatch(setCredentials({ token, user }));
        toast.success('Admin login successful!');
        
        // Redirect to admin dashboard
        const redirectUrl = tenant 
          ? `/admin/dashboard?tenant=${tenant}`
          : '/admin/dashboard';
        router.push(redirectUrl);
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(error.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
        <p className="text-slate-400 mt-1">
          Sign in to access system administration
        </p>
        {tenant && (
          <p className="text-sm text-purple-400 mt-2 flex items-center justify-center gap-2">
            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
              Tenant: {tenant}
            </span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Admin Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@eproc.local"
            {...register('email')}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          {errors.email && (
            <p className="text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            {...register('password')}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          {errors.password && (
            <p className="text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-slate-400">Show password</span>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Admin Sign In
        </Button>
      </form>

      <div className="pt-4 border-t border-white/10">
        <p className="text-center text-xs text-slate-500">
          Protected area for system administrators only
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
