'use client';

import React, { useState, ElementType, ComponentPropsWithoutRef } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import Image from 'next/image';
import { useForm, FieldError, UseFormRegister, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import {
  User as UserIcon,
  Mail,
  Lock,
  Camera,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// --- ZOD SCHEMAS ---
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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

type NotificationType = 'success' | 'error' | '';

type FormInputProps<T extends FieldValues> = {
    id: Path<T>;
    label: string;
    register: UseFormRegister<T>;
    error?: FieldError;
    type?: string;
    Icon?: ElementType;
} & Omit<ComponentPropsWithoutRef<'input'>, 'id'>;

interface ProfilePageClientProps {
  initialUser: User | null;
}

// --- SUB-COMPONENTS ---
const Notification = (
    { message, type, onDismiss }: 
    { message: string; type: NotificationType; onDismiss: () => void; }
) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertTriangle;
  const colors = isSuccess
    ? 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-200'
    : 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-200';

  return (
    <div className={`p-4 rounded-lg border ${colors} flex items-start space-x-3 shadow-md mb-6 transition-all duration-300`}>
      <Icon className="h-5 w-5 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{isSuccess ? 'Success' : 'Error'}</p>
        <p className="text-sm">{message}</p>
      </div>
      <button type="button" onClick={onDismiss} className="text-current opacity-70 hover:opacity-100">&times;</button>
    </div>
  );
};

const FormInput = <T extends FieldValues>({ id, label, register, error, type = 'text', Icon, ...props }: FormInputProps<T>) => (
  <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-y-2 md:gap-x-6">
    <label htmlFor={id} className="text-sm font-medium text-gray-600 dark:text-gray-400 pt-2">{label}</label>
    <div className="md:col-span-3">
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />}
        <input
          id={id}
          type={type}
          {...register(id)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5">{error.message}</p>}
    </div>
  </div>
);

const ProfileHeader = ({ user }: { user: User }) => (
  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-10">
    <div className="relative">
      <Image
        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
        alt="User Avatar"
        width={96}
        height={96}
        className="rounded-full ring-4 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900 ring-blue-500"
      />
      <button className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500">
        <Camera size={16} />
        <span className="sr-only">Change photo</span>
      </button>
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
      <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
      <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-300">{user.role}</span>
    </div>
  </div>
);

const ProfileSettings = ({ onProfileSubmit, isSubmitting, user }: { onProfileSubmit: (data: ProfileFormValues) => void; isSubmitting: boolean; user: User; }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user.username, email: user.email },
  });

  return (
    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
      <FormInput id="username" label="Username" register={register} error={errors.username} Icon={UserIcon} />
      <FormInput id="email" label="Email Address" register={register} error={errors.email} type="email" Icon={Mail} />
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
        </button>
      </div>
    </form>
  );
};

const SecuritySettings = ({ onPasswordSubmit, isSubmitting }: { onPasswordSubmit: (data: PasswordFormValues) => void; isSubmitting: boolean; }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordFormValues) => {
    await onPasswordSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput id="currentPassword" label="Current Password" register={register} error={errors.currentPassword} type="password" Icon={Lock} />
      <FormInput id="newPassword" label="New Password" register={register} error={errors.newPassword} type="password" Icon={Lock} />
      <FormInput id="confirmPassword" label="Confirm Password" register={register} error={errors.confirmPassword} type="password" Icon={Lock} />
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
        </button>
      </div>
    </form>
  );
};

// --- MAIN CLIENT COMPONENT ---
export default function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
  const { updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [notification, setNotification] = useState({ message: '', type: '' as NotificationType });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: 'success' as NotificationType }), 5000);
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/profile', data);
      const updatedUserData = res.data;
      setUser(updatedUserData); // Update local state
      updateUser?.(updatedUserData); // Update context state
      handleSetNotification('Profile updated successfully!', 'success');
    } catch (error: unknown) {
      let message = 'An unknown error occurred.';
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      handleSetNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await api.put('/auth/password', data);
      handleSetNotification('Password changed successfully!', 'success');
    } catch (error: unknown) {
      let message = 'An unknown error occurred while changing password.';
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      handleSetNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Settings', Icon: UserIcon },
    { id: 'security', label: 'Security', Icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Account Settings</h1>
        </header>

        <ProfileHeader user={user} />

        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification({ message: '', type: '' as NotificationType })}
        />

        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                  className={`shrink-0 flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    }`}>
                  <tab.Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <ProfileSettings onProfileSubmit={onProfileSubmit} isSubmitting={isSubmitting} user={user} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings onPasswordSubmit={onPasswordSubmit} isSubmitting={isSubmitting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
