'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

// 1. Schema Validation with Zod
const loginSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Infer the type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  // General error state for submission failures (e.g., "Invalid credentials")
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();

  // 2. Advanced Form Handling with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      await login(data.email, data.password);
    } catch (error: unknown) {
      // Handle different types of errors
      if (error instanceof Error) {
        let errorMessage = 'Failed to login. Please check your credentials.';
        
        // Handle Axios errors
        if ('isAxiosError' in error && error.isAxiosError) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: { message?: string };
            };
          };
          
          if (axiosError.response) {
            // Handle specific error messages from the API
            if (axiosError.response.status === 401) {
              errorMessage = 'Invalid email or password.';
            } else if (axiosError.response.status && axiosError.response.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            } else if (axiosError.response.data?.message) {
              errorMessage = axiosError.response.data.message;
            }
          } else {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please check your connection.';
          }
        }
        
        setServerError(errorMessage);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to continue to your account.</p>
        </div>

        {/* 4. Field-specific & Server Errors */}
        {serverError && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600'
              }`}
            />
            {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              {/* 5. Password Visibility Toggle */}
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting} // 6. Loading State
            className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {isSubmitting ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;