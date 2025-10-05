'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useRegisterMutation } from '@/store/api/vendorApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import FileUpload from '@/components/FileUpload';
import { validationSchemas, sanitizeText } from '@/utils/sanitizers';
import type { RegisterFormData } from '@/types';

// Animated wave SVG component
const WaveAnimation = () => (
  <motion.div
    className="absolute inset-0 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <svg
      className="absolute -bottom-1 left-0 w-full h-64 text-primary-500 opacity-20"
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,197.3C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        fill="currentColor"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    </svg>
  </motion.div>
);

export default function VendorRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [step, setStep] = useState<'form' | 'success'>('form');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(validationSchemas.register),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      company: '',
      phone: '',
      documents: null,
    },
  });

  const watchedPassword = watch('password');

  // Password strength checker
  const getPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&]/.test(password)) score += 1;
    return score;
  };

  const passwordStrength = watchedPassword ? getPasswordStrength(watchedPassword) : 0;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Sanitize form data
      const sanitizedData = {
        ...data,
        name: sanitizeText(data.name),
        company: sanitizeText(data.company),
        phone: sanitizeText(data.phone),
      };

      const result = await register(sanitizedData).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({
        token: result.accessToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || result.user.username,
          company: '', // Will be filled from backend later
          phone: '', // Will be filled from backend later
          verified: result.user.verified || false,
          createdAt: result.user.createdAt,
        }
      }));

      // Show success animation
      setStep('success');

      // Confetti effect
      setTimeout(() => {
        const redirectPath = searchParams?.get('redirect') || '/vendor/dashboard';
        router.push(redirectPath);
      }, 2000);

      toast.success('Registration successful! Welcome to Eproc Vendor Portal! 🎉');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleFileUpload = (files: any[]) => {
    setUploadedFiles(files);
    setValue('documents', files as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <WaveAnimation />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-primary-400 to-indigo-600 rounded-full opacity-10 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-success-400 to-emerald-600 rounded-full opacity-10 blur-3xl"
        animate={{
          x: [0, -120, 0],
          y: [0, -80, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              {/* Hero Section */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.h1
                  className="text-4xl font-bold text-gradient mb-4"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  Join Eproc
                </motion.h1>
                <motion.p
                  className="text-gray-600 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Start your journey as a vendor
                </motion.p>
              </motion.div>

              {/* Registration Form */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glassmorphism-card bg-white/80 backdrop-blur-xl"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="input-group"
                  >
                    <label className="input-label">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('email')}
                        type="email"
                        className="input-field"
                        placeholder="Enter your email"
                      />
                      {touchedFields.email && !errors.email && (
                        <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-success-500)'}} />
                      )}
                      {errors.email && (
                        <XCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{color: 'var(--color-error-500)'}} />
                      )}
                    </div>
                    {errors.email && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="input-error"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>{errors.email.message}</span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`input-field pr-10 ${errors.password ? 'border-red-300' : ''}`}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {watchedPassword && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2"
                      >
                        <div className="flex space-x-1 mb-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                level <= passwordStrength
                                  ? level <= 2
                                    ? 'bg-red-500'
                                    : level <= 3
                                    ? 'bg-yellow-500'
                                    : level <= 4
                                    ? 'bg-blue-500'
                                    : 'bg-success-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Password strength: {
                            passwordStrength <= 2 ? 'Weak' :
                            passwordStrength <= 3 ? 'Fair' :
                            passwordStrength <= 4 ? 'Good' : 'Strong'
                          }
                        </p>
                      </motion.div>
                    )}
                    
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-300' : touchedFields.confirmPassword && !errors.confirmPassword ? 'border-success-300' : ''}`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                      {touchedFields.confirmPassword && !errors.confirmPassword && (
                        <CheckCircleIcon className="absolute right-10 top-3 w-5 h-5 text-success-500" />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Name Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('name')}
                        type="text"
                        className={`input-field ${errors.name ? 'border-red-300' : touchedFields.name && !errors.name ? 'border-success-300' : ''}`}
                        placeholder="Enter your full name"
                      />
                      {touchedFields.name && !errors.name && (
                        <CheckCircleIcon className="absolute right-3 top-3 w-5 h-5 text-success-500" />
                      )}
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Company Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('company')}
                        type="text"
                        className={`input-field ${errors.company ? 'border-red-300' : touchedFields.company && !errors.company ? 'border-success-300' : ''}`}
                        placeholder="Enter your company name"
                      />
                      {touchedFields.company && !errors.company && (
                        <CheckCircleIcon className="absolute right-3 top-3 w-5 h-5 text-success-500" />
                      )}
                    </div>
                    {errors.company && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.company.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Phone Field */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        {...registerField('phone')}
                        type="tel"
                        className={`input-field ${errors.phone ? 'border-red-300' : touchedFields.phone && !errors.phone ? 'border-success-300' : ''}`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {touchedFields.phone && !errors.phone && (
                        <CheckCircleIcon className="absolute right-3 top-3 w-5 h-5 text-success-500" />
                      )}
                    </div>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Document Upload */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <FileUpload
                      label="Company Documents"
                      hint="Upload your company registration, tax certificates, or other relevant documents (Optional)"
                      maxFiles={5}
                      onUpdateFiles={handleFileUpload}
                      acceptedFileTypes={[
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg',
                        'image/png',
                      ]}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    <button
                      type="submit"
                      disabled={isLoading || !isValid}
                      className="w-full btn btn-primary btn-lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </motion.div>

                  {/* Login Link */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => router.push('/vendor/login')}
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Sign In
                      </button>
                    </p>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            /* Success Animation */
            <motion.div
              key="success"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                className="w-24 h-24 mx-auto mb-6 bg-success-500 rounded-full flex items-center justify-center animate-confetti"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                <CheckCircleIcon className="w-12 h-12 text-white animate-success-check" />
              </motion.div>
              
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome to Eproc! 🎉
              </motion.h2>
              
              <motion.p
                className="text-gray-600 text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Your account has been created successfully.
                <br />
                Redirecting to dashboard...
              </motion.p>
              
              <motion.div
                className="mt-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="w-8 h-8 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}