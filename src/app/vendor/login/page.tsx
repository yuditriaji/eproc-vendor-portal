'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useLoginMutation } from '@/store/api/vendorApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
}

export default function VendorLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({
        token: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || result.user.username,
          company: '',
          phone: '',
          verified: result.user.verified || false,
          createdAt: result.user.createdAt,
        }
      }));

      toast.success('Login successful! Welcome back! 🎉');
      router.push('/vendor/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-gradient mb-4">Sign In</h1>
          <p className="text-gray-600">Welcome back to Eproc Vendor Portal</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glassmorphism-card"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="relative">
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <XCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-error-500)'}} />
                )}
              </div>
              {errors.email && (
                <div className="input-error">
                  <XCircleIcon className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
                {errors.password && (
                  <XCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-error-500)'}} />
                )}
              </div>
              {errors.password && (
                <div className="input-error">
                  <XCircleIcon className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full btn btn-primary btn-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p style={{color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)'}}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/vendor/register')}
                  style={{color: 'var(--color-primary-600)', fontWeight: '600'}}
                  className="hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {/* Test Account Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Test Account:</p>
              <p className="text-xs text-blue-600">
                Email: vendor@eproc.local<br />
                Password: vendor123
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
