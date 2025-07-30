'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User as UserIcon, Mail, CheckCircle, Loader2, Edit3 } from 'lucide-react';
import { User } from '@/types';
import { FormInput } from './FormInput';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z
    .string()
    .email('Please enter a valid email address.')
    .regex(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email address.'
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  onProfileSubmit: (data: ProfileFormValues) => void;
  isSubmitting: boolean;
  user: User;
}

export const ProfileSettings = ({
  onProfileSubmit,
  isSubmitting,
  user,
}: ProfileSettingsProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user.username, email: user.email },
  });

  // Reset form to initial user values
  const handleCancel = () => {
    reset({ username: user.username, email: user.email });
  };

  return (
    <div className="space-y-6">
      <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 mb-2">
          <Edit3 size={16} />
          <span className="text-sm font-medium">Profile Information</span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Update your basic profile information. Changes will be reflected immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInput id="username" label="Username" register={register} error={errors.username} Icon={UserIcon} />
          <FormInput id="email" label="Email Address" register={register} error={errors.email} type="email" Icon={Mail} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};