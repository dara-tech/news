'use client';

import { useState, use, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle, Globe, ArrowLeft, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Schema Validation
const resetPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  pin: z.string().min(6, { message: 'PIN must be 6 digits.' }).max(6, { message: 'PIN must be 6 digits.' }),
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
  }>;
}

const ResetPasswordPage = ({ params }: ResetPasswordPageProps) => {
  const { lang } = use(params);
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyPinAndResetPassword } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      pin: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Auto-populate email from URL parameters
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    
    try {
      await verifyPinAndResetPassword(data.email, data.pin, data.password);
      setIsSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-500 to-green-400 dark:from-green-900 dark:via-green-800 dark:to-green-700 p-8 flex-col justify-between">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
              <p className="text-green-50 dark:text-green-100 text-lg">Password Reset Complete</p>
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
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {searchParams.get('email') 
                  ? `Enter the PIN sent to ${searchParams.get('email')} and your new password.`
                  : 'Enter your email, PIN from the email, and new password.'
                }
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">Security Notice</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Your PIN expires in 5 minutes. If it has expired, please request a new one.
                  </p>
                </div>
              </div>
            </div>

            {serverError && (
              <div className="w-full text-center text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md py-3 px-4 bg-red-50 dark:bg-red-900/20 mb-6">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  placeholder="Enter your email address"
                  readOnly={!!searchParams.get('email')}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  } ${searchParams.get('email') ? 'bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : ''}`}
                />
                {searchParams.get('email') && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email pre-filled from your reset request
                  </p>
                )}
                {errors.email && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email.message}</span>
                )}
              </div>

              {/* PIN Input */}
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification PIN
                  {searchParams.get('email') && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">(Check your email)</span>
                  )}
                </label>
                <input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  {...register('pin')}
                  placeholder="Enter 6-digit PIN"
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl tracking-widest font-mono ${
                    errors.pin ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.pin && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.pin.message}</span>
                )}
              </div>

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
