'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { MatchingExercise } from '@/lib/types';

interface MatchingProps {
  exercise: MatchingExercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function Matching({ exercise, onAnswer, disabled }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const allMatched = Object.keys(matches).length === exercise.left_items.length;

  const handleSelectLeft = (index: number) => {
    if (showResult || disabled) return;
    setSelectedLeft(index);
  };

  const handleSelectRight = (index: number) => {
    if (selectedLeft === null || showResult || disabled) return;
    
    // Создаем связь
    setMatches(prev => {
      const newMatches = { ...prev };
      
      // Удаляем предыдущую связь для левого элемента
      newMatches[selectedLeft] = index;
      
      return newMatches;
    });
    
    setSelectedLeft(null);
  };

  const handleCheck = () => {
    if (!allMatched || showResult) return;

    // Проверяем правильность всех соединений
    const correct = Object.entries(matches).every(([leftIdx, rightIdx]) => {
      return exercise.correct_matches[leftIdx] === String(rightIdx);
    });

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {exercise.instruction}
        </h2>
      </motion.div>

      {/* Matching Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-3">
            {exercise.left_items.map((item, index) => {
              const isSelected = selectedLeft === index;
              const isMatched = matches[index] !== undefined;
              const matchedRightIdx = matches[index];
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectLeft(index)}
                  disabled={showResult || disabled}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all relative ${
                    showResult && exercise.correct_matches[String(index)] === String(matchedRightIdx)
                      ? 'bg-emerald-50 border-emerald-500'
                      : showResult
                      ? 'bg-red-50 border-red-500'
                      : isSelected
                      ? 'bg-indigo-100 border-indigo-500'
                      : isMatched
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-white border-gray-300 hover:border-indigo-400'
                  } ${showResult || disabled ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-medium">{item}</span>
                  {isMatched && (
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {exercise.right_items.map((item, index) => {
              const isMatched = Object.values(matches).includes(index);
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectRight(index)}
                  disabled={showResult || disabled || selectedLeft === null}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isMatched
                      ? 'bg-blue-50 border-blue-400'
                      : selectedLeft !== null
                      ? 'bg-white border-gray-300 hover:border-indigo-400'
                      : 'bg-gray-50 border-gray-200'
                  } ${showResult || disabled || selectedLeft === null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="font-medium">{item}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Check Button */}
      {!showResult && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheck}
            disabled={!allMatched || disabled}
          >
            Проверить
          </Button>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`max-w-2xl mx-auto p-4 rounded-xl ${
              isCorrect ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <h3 className={`font-semibold ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                {isCorrect ? 'Все пары правильные!' : 'Некоторые пары неправильные'}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
