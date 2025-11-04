'use client';

import React, { useState } from 'react';
import { X, Save, User, Mail, Globe } from 'lucide-react';
import { updateUserProfile, type UserProfile } from '@/lib/profile';

interface EditProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
}

export function EditProfile({ profile, onUpdate, onClose }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    learning_goals: profile.learning_goals || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Только буквы, цифры, дефис и подчеркивание';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Минимум 3 символа';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Максимум 500 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedProfile = await updateUserProfile(profile.id, {
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || undefined,
        learning_goals: formData.learning_goals.trim() || undefined,
      });

      onUpdate(updatedProfile);
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.message || 'Не удалось обновить профиль',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Имя
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Ваше имя"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Имя пользователя
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.username
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
                placeholder="username"
              />
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Только латинские буквы, цифры, дефис и подчеркивание
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4" />
              О себе
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.bio
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              placeholder="Расскажите немного о себе..."
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
            <p className="mt-1 text-xs text-gray-500 text-right">
              {formData.bio.length}/500
            </p>
          </div>

          {/* Learning Goals */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Цели обучения
            </label>
            <div className="space-y-2">
              {['work', 'dating', 'leadership', 'networking', 'confidence'].map((goal) => {
                const isSelected = formData.learning_goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      const goals = formData.learning_goals.split(',').filter(Boolean);
                      if (isSelected) {
                        const filtered = goals.filter((g) => g !== goal);
                        handleChange('learning_goals', filtered.join(','));
                      } else {
                        handleChange('learning_goals', [...goals, goal].join(','));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{getGoalLabel(goal)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-500">Выберите одну или несколько целей</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Сохранить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    work: '💼 Карьера и работа',
    dating: '💕 Свидания и отношения',
    leadership: '👔 Лидерство и управление',
    networking: '🤝 Нетворкинг и связи',
    confidence: '💪 Уверенность в себе',
  };
  return labels[goal] || goal;
}

