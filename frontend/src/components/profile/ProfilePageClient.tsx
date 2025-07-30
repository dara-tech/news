'use client';

import React, { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import api from '@/lib/api';
import { User as UserIcon, Shield, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSettings } from './ProfileSettings';
import { SecuritySettings } from './SecuritySettings';

interface ProfilePageClientProps {
  initialUser: User | null;
}

type ProfileFormData = {
  name?: string;
  email?: string;
  // Add other profile fields as needed
  [key: string]: unknown;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePageClient({ initialUser }: ProfilePageClientProps) {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser || authUser);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Update user state when auth context changes
  useEffect(() => {
    if (authUser && !user) {
      setUser(authUser);
    }
  }, [authUser, user]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileSubmitting(true);
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
      setIsProfileSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordSubmitting(true);
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
      setIsPasswordSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const res = await api.put('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUserData = res.data;
      setUser(updatedUserData);
      updateUser?.(updatedUserData);
      toast.success('Profile picture updated successfully!');
    } catch (error: unknown) {
      let message = 'An unknown error occurred while uploading profile picture.';
      if (isAxiosError(error)) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsImageUploading(false);
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

        <ProfileHeader user={user} onImageUpload={handleImageUpload} isUploading={isImageUploading} />

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
              <ProfileSettings onProfileSubmit={onProfileSubmit} isSubmitting={isProfileSubmitting} user={user} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings onPasswordSubmit={onPasswordSubmit} isSubmitting={isPasswordSubmitting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
