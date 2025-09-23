'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Schema Validation
const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordPageProps {
  params: Promise<{
    lang: string;
    token: string;
  }>;
}

const ResetPasswordPage = ({ params }: ResetPasswordPageProps) => {
  const { lang, token } = use(params);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { resetPassword } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired')) {
          setIsTokenValid(false);
        }
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (!isTokenValid) {
    return (
      <main className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-500 to-red-400 dark:from-red-900 dark:via-red-800 dark:to-red-700 p-8 flex-col justify-between">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
              <p className="text-red-50 dark:text-red-100 text-lg">Invalid Token</p>
            </div>
            
            {/* Abstract Logo */}
            <div className="flex items-center justify-center flex-1">
              <div className="relative w-32 h-32">
                <div className="absolute top-0 left-0 w-16 h-16 bg-orange-500 rounded-full opacity-80"></div>
                <div className="absolute top-8 right-0 w-16 h-16 bg-green-500 rounded-full opacity-80"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-blue-500 rounded-full opacity-80"></div>
                <div className="absolute bottom-0 right-8 w-16 h-16 bg-purple-500 rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Error Message */}
        <div className="flex-1 lg:w-1/2 flex flex-col">
          {/* Header with Language Selector */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <span className="text-gray-900 dark:text-white font-semibold">Razewire</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-white">
              <span>English</span>
              <Globe className="w-4 h-4" />
            </div>
          </div>

          {/* Error Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Invalid or Expired Token
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href={`/${lang}/forgot-password`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  Request New Reset Link
                </Link>
                
                <Link
                  href={`/${lang}/login`}
                  className="w-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            © Razewire All rights reserved.
          </div>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-green-400 dark:from-green-900 dark:via-green-800 dark:to-green-700 p-8 flex-col justify-between">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
              <p className="text-green-50 dark:text-green-100 text-lg">Password Reset</p>
            </div>
            
            {/* Abstract Logo */}
            <div className="flex items-center justify-center flex-1">
              <div className="relative w-32 h-32">
                <div className="absolute top-0 left-0 w-16 h-16 bg-orange-500 rounded-full opacity-80"></div>
                <div className="absolute top-8 right-0 w-16 h-16 bg-green-500 rounded-full opacity-80"></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 bg-blue-500 rounded-full opacity-80"></div>
                <div className="absolute bottom-0 right-8 w-16 h-16 bg-purple-500 rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Success Message */}
        <div className="flex-1 lg:w-1/2 flex flex-col">
          {/* Header with Language Selector */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <span className="text-gray-900 dark:text-white font-semibold">Razewire</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-white">
              <span>English</span>
              <Globe className="w-4 h-4" />
            </div>
          </div>

          {/* Success Content */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Password Reset Successful!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
              </div>

              {/* Login Button */}
              <div className="text-center">
                <Link
                  href={`/${lang}/login`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            © Razewire All rights reserved.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 p-8 flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
            <p className="text-blue-50 dark:text-blue-100 text-lg">Reset Password</p>
          </div>
          
          {/* Abstract Logo */}
          <div className="flex items-center justify-center flex-1">
            <div className="relative w-32 h-32">
              <div className="absolute top-0 left-0 w-16 h-16 bg-orange-500 rounded-full opacity-80"></div>
              <div className="absolute top-8 right-0 w-16 h-16 bg-green-500 rounded-full opacity-80"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-blue-500 rounded-full opacity-80"></div>
              <div className="absolute bottom-0 right-8 w-16 h-16 bg-purple-500 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className="flex-1 lg:w-1/2 flex flex-col">
        {/* Header with Language Selector */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            <span className="text-gray-900 dark:text-white font-semibold">Razewire</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-white">
            <span>English</span>
            <Globe className="w-4 h-4" />
          </div>
        </div>

        {/* Reset Password Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your new password below.
              </p>
            </div>

            {serverError && (
              <div className="w-full text-center text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md py-3 px-4 bg-red-50 dark:bg-red-900/20 mb-6">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 ${
                      errors.password ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.password.message}</span>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 ${
                      errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.confirmPassword.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                  href={`/${lang}/login`}
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          © Razewire All rights reserved.
        </div>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
