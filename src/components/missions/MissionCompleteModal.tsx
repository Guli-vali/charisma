'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input } from '@/components/ui';
import { X, Star } from 'lucide-react';

interface MissionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (proofText?: string, moodRating?: number, wasDifficult?: boolean) => void;
  missionTitle: string;
}

export function MissionCompleteModal({
  isOpen,
  onClose,
  onConfirm,
  missionTitle,
}: MissionCompleteModalProps) {
  const [proofText, setProofText] = useState('');
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [wasDifficult, setWasDifficult] = useState<boolean | null>(null);

  const handleConfirm = () => {
    onConfirm(
      proofText || undefined,
      moodRating || undefined,
      wasDifficult !== null ? wasDifficult : undefined
    );
    
    // Сбрасываем состояние
    setProofText('');
    setMoodRating(null);
    setWasDifficult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <Card>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Отметить выполнение
                  </h3>
                  <p className="text-gray-600">{missionTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Proof Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Как прошло выполнение? (опционально)
                </label>
                <textarea
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Расскажите о своем опыте..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Mood Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Как вы себя чувствовали?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMoodRating(rating)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          moodRating && rating <= moodRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Было ли сложно?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWasDifficult(false)}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      wasDifficult === false
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400'
                    }`}
                  >
                    😊 Легко
                  </button>
                  <button
                    onClick={() => setWasDifficult(true)}
                    className={`p-3 rounded-xl border-2 font-medium transition-all ${
                      wasDifficult === true
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-amber-400'
                    }`}
                  >
                    😅 Сложно
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Отмена
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={handleConfirm}
                >
                  Подтвердить выполнение
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
