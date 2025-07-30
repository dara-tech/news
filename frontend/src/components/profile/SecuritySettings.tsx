'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { FormInput } from './FormInput';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SecuritySettingsProps {
  onPasswordSubmit: (data: PasswordFormValues) => void;
  isSubmitting: boolean;
}

export const SecuritySettings = ({
  onPasswordSubmit,
  isSubmitting,
}: SecuritySettingsProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormValues) => {
    await onPasswordSubmit(data);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="border border-orange-200 dark:border-orange-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 mb-2">
          <Shield size={16} />
          <span className="text-sm font-medium">Security Settings</span>
        </div>
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Change your password to keep your account secure. Use a strong password with at least 8 characters.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormInput id="currentPassword" label="Current Password" register={register} error={errors.currentPassword} type="password" Icon={Lock} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormInput id="newPassword" label="New Password" register={register} error={errors.newPassword} type="password" Icon={Lock} />
            <FormInput id="confirmPassword" label="Confirm Password" register={register} error={errors.confirmPassword} type="password" Icon={Lock} />
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Password Requirements</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-500" />
              At least 8 characters long
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-500" />
              Include uppercase and lowercase letters
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-500" />
              Include numbers and special characters
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-orange-600 hover:bg-orange-700 transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};