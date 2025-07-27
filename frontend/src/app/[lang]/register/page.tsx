'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, UserPlus, Loader2, Mail, User, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';

// Schema Validation
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register: registerUser, loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  // Check for error parameters in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error) {
        case 'google_oauth_not_configured':
          errorMessage = 'Google OAuth is not configured. Please use email/password registration instead.';
          break;
        case 'google_oauth_strategy_unavailable':
          errorMessage = 'Google OAuth is not available. Please use email/password registration instead.';
          break;
        case 'google_auth_failed':
          errorMessage = 'Google authentication failed. Please try again.';
          break;
        case 'no_profile':
          errorMessage = 'Could not retrieve Google profile. Please try again.';
          break;
        case 'no_user':
          errorMessage = 'Could not create or retrieve user account. Please try again.';
          break;
        case 'registration_failed':
          errorMessage = 'Registration failed. Please try again.';
          break;
        case 'no_email':
          errorMessage = 'Google account email not found. Please use a different Google account or email/password registration.';
          break;
        default:
          errorMessage = 'An error occurred. Please try again.';
      }
      
      setServerError(errorMessage);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerUser(data.username, data.email, data.password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        let errorMessage = 'Failed to register. Please try again.';
        if ('isAxiosError' in error && error.isAxiosError) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: { message?: string };
            };
          };
          if (axiosError.response) {
            if (axiosError.response.status === 409) {
              errorMessage = 'User already exists with this email or username.';
            } else if (axiosError.response.status && axiosError.response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (axiosError.response.data?.message) {
              errorMessage = axiosError.response.data.message;
            }
          } else {
            errorMessage = 'No response from server. Please check your connection.';
          }
        }
        setServerError(errorMessage);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await loginWithGoogle();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Google authentication failed. Please use email/password registration instead.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 p-8 flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Newsly</h1>
            <p className="text-blue-50 dark:text-blue-100 text-lg">Create account</p>
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

      {/* Right Panel - Register Form */}
      <div className="flex-1 lg:w-1/2 bg-white dark:bg-gray-900 flex flex-col">
        {/* Header with Language Selector */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            <span className="text-gray-900 dark:text-white font-semibold">Newsly</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-white">
            <span>English</span>
            <Globe className="w-4 h-4" />
          </div>
        </div>

        {/* Register Form */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join our community and stay updated with the latest news.
              </p>
            </div>

            {serverError && (
              <div className="w-full text-center text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md py-3 px-4 bg-red-50 dark:bg-red-900/20 mb-6">
                {serverError}
              </div>
            )}

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 mb-6"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  or sign up with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    {...register('username')}
                    placeholder="johndoe"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.username ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.username && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.username.message}</span>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="mail@example.com"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.email ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                {errors.email && (
                  <span className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email.message}</span>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
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
                  Confirm Password
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

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          © Newsly All rights reserved.
        </div>
      </div>
    </main>
  );
};

export default RegisterPage; 