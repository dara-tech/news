'use client';

import { useState, use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Loader2, ArrowLeft, CheckCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface ForgotPasswordPageProps {
  params: Promise<{
    lang: string;
  }>;
}

// Schema Validation
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = ({ params }: ForgotPasswordPageProps) => {
  const { lang } = use(params);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      const response = await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setResetUrl(response.resetUrl);
      setPreviewUrl(response.previewUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (isSubmitted) {
    return (
      <main className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 p-8 flex-col justify-between">
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
              <p className="text-blue-50 dark:text-blue-100 text-lg">Password Reset</p>
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
                  Check Your Email
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We've sent a 6-digit PIN to your email address. Use this PIN to reset your password.
                </p>
                
                {/* PIN Instructions */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">!</span>
                    </div>
                    <div className="text-sm">
                      <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">Important:</p>
                      <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• Your PIN expires in 5 minutes</li>
                        <li>• Check your spam folder if you don't see the email</li>
                        <li>• Enter the PIN exactly as shown in the email</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development Reset URL */}
              {resetUrl && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    <strong>Development Mode:</strong> Go to the password reset page to enter your PIN:
                  </p>
                  <a
                    href={resetUrl}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm break-all"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}

              {/* Email Preview URL */}
              {previewUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    <strong>Email Preview:</strong> Click to view the email that was sent:
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm break-all"
                  >
                    {previewUrl}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href={`/${lang}/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Enter PIN to Reset Password
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

  return (
    <main className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 p-8 flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Razewire</h1>
            <p className="text-blue-50 dark:text-blue-100 text-lg">Password Reset</p>
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

      {/* Right Panel - Forgot Password Form */}
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

        {/* Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                No worries! Enter your email address and we'll send you a reset link.
              </p>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
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

export default ForgotPasswordPage;
