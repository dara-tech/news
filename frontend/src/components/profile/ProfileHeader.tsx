'use client';

import React, { useState, } from 'react';
import { Camera, Mail, Settings, CheckCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { ImageUploadModal } from './ImageUploadModal';

interface ProfileHeaderProps {
  user: User;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
}

export const ProfileHeader = ({ 
  user, 
  onImageUpload, 
  isUploading 
}: ProfileHeaderProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleImageUpload = (file: File) => {
    onImageUpload(file);
    setShowUploadModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <Avatar className="w-20 h-20 border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-gray-800">
            <AvatarImage 
              src={user.profileImage || user.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${user.username}`}
              alt={`${user.username}'s Avatar`}
              className="object-contain w-full h-full"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white dark:border-gray-800"
            tabIndex={-1}
            aria-label="Change profile photo"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
            <span className="sr-only">Change photo</span>
          </button>
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

      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUpload={handleImageUpload}
        username={user.username}
        user={{
          username: user.username,
          profession: user.profession,
          interests: user.interests,
          age: user.age,
          company: user.company,
          industry: user.industry,
          experience: user.experience
        }}
      />
    </>
  );
};