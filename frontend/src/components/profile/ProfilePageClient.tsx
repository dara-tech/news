'use client';

import React, { useState, useEffect, ElementType, ComponentPropsWithoutRef } from 'react';
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
  Settings,
  Edit3,
  Eye,
  EyeOff,
} from 'lucide-react';

import { toast } from 'sonner';

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

const FormInput = <T extends FieldValues>({
  id,
  label,
  register,
  error,
  type = 'text',
  Icon,
  ...props
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 z-10" />
        )}
        <input
          id={id}
          type={inputType}
          {...register(id)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3 border rounded-xl bg-white dark:bg-gray-800 transition-all duration-200 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
          } focus:outline-none focus:ring-4 focus:ring-opacity-20`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertTriangle size={12} />
          {error.message}
        </p>
      )}
    </div>
  );
};

const ProfileHeader = ({ user }: { user: User }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    user.profileImage || user.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`
  );

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      setImageSrc(`https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`);
    }
  };

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative">
        <Image
          src={imageSrc}
          alt={`${user.username}'s Avatar`}
          width={80}
          height={80}
          className="rounded-xl border border-gray-200 dark:border-gray-700 shadow object-cover"
          onError={handleImageError}
          priority
        />
        <button
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          tabIndex={-1}
        >
          <Camera size={16} />
          <span className="sr-only">Change photo</span>
        </button>
        <div className="absolute -top-1 -left-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.username}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 mb-2">
          <Mail size={14} />
          {user.email}
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            <Settings size={12} />
            {user.role}
          </span>
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
            <CheckCircle size={10} />
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({
  onProfileSubmit,
  isSubmitting,
  user,
}: {
  onProfileSubmit: (data: ProfileFormValues) => void;
  isSubmitting: boolean;
  user: User;
}) => {
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

const SecuritySettings = ({
  onPasswordSubmit,
  isSubmitting,
}: {
  onPasswordSubmit: (data: PasswordFormValues) => void;
  isSubmitting: boolean;
}) => {
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

export default function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser || authUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update user state when auth context changes
  useEffect(() => {
    if (authUser && !user) {
      setUser(authUser);
    }
  }, [authUser, user]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/profile', data);
      const updatedUserData = res.data;
      setUser(updatedUserData);
      updateUser?.(updatedUserData);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      let message = 'An unknown error occurred.';
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await api.put('/auth/password', data);
      toast.success('Password changed successfully!');
    } catch (error: unknown) {
      let message = 'An unknown error occurred while changing password.';
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', Icon: UserIcon },
    { id: 'security', label: 'Security', Icon: Shield },
  ];

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your profile information and security settings</p>
        </header>

        <ProfileHeader user={user} />

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
          {/* Mobile Tab Navigation */}
          <div className="sm:hidden border-b border-gray-200 dark:border-gray-700">
            <nav className="flex" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  }`}
                >
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
