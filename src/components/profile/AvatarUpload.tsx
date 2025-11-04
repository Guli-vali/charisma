'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, User } from 'lucide-react';
import { uploadAvatar, deleteAvatar, getAvatarUrl, getUserInitials } from '@/lib/profile';
import type { UserProfile } from '@/lib/profile';

interface AvatarUploadProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
}

export function AvatarUpload({ profile, onUpdate, size = 'medium', editable = true }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const avatarUrl = getAvatarUrl(profile, size === 'small' ? 'thumb' : size === 'large' ? 'large' : 'medium');
  const initials = getUserInitials(profile.name);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Размер изображения должен быть менее 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setSelectedFile(file);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const updatedProfile = await uploadAvatar(profile.id, selectedFile);
      onUpdate(updatedProfile);
      setShowModal(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить аватар');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить свой аватар?')) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const updatedProfile = await deleteAvatar(profile.id);
      onUpdate(updatedProfile);
    } catch (err: any) {
      setError(err.message || 'Не удалось удалить аватар');
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  return (
    <>
      <div className="relative inline-block">
        {/* Avatar Display */}
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg relative group`}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={profile.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}

          {/* Hover Overlay */}
          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={handleButtonClick}>
              <Camera className={`${iconSizes[size]} text-white`} />
            </div>
          )}
        </div>

        {/* Edit Button */}
        {editable && (
          <button
            onClick={handleButtonClick}
            disabled={isUploading}
            className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
            title="Изменить аватар"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Загрузить аватар</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mb-6">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={192}
                    height={192}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Error in Modal */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleModalClose}
                disabled={isUploading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Загрузить
                  </>
                )}
              </button>
            </div>

            {/* Delete Option */}
            {avatarUrl && (
              <button
                onClick={handleDelete}
                disabled={isUploading}
                className="w-full mt-4 px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Удалить текущий аватар
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Avatars Section (Optional) */}
      {showModal && !previewUrl && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Или выберите готовый:</h4>
          <div className="grid grid-cols-4 gap-2">
            {/* Placeholder for preset avatars */}
            {[1, 2, 3, 4].map((i) => (
              <button
                key={i}
                className="w-full aspect-square rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <User className="w-8 h-8 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

