'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { SequenceExercise } from '@/lib/types';

interface SequenceProps {
  exercise: SequenceExercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function Sequence({ exercise, onAnswer, disabled }: SequenceProps) {
  // Перемешиваем элементы при инициализации
  const [items, setItems] = useState(() => {
    const shuffled = [...exercise.items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleMoveUp = (index: number) => {
    if (index === 0 || showResult || disabled) return;
    
    const newItems = [...items];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1 || showResult || disabled) return;
    
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setItems(newItems);
  };

  const handleCheck = () => {
    if (showResult) return;

    // Проверяем правильность порядка
    const userOrder = items.map(item => exercise.items.indexOf(item));
    const correct = JSON.stringify(userOrder) === JSON.stringify(exercise.correct_order);

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

      {/* Sequence Items */}
      <div className="max-w-2xl mx-auto space-y-3">
        {items.map((item, index) => {
          const originalIndex = exercise.items.indexOf(item);
          const isInCorrectPosition = showResult && exercise.correct_order[index] === originalIndex;
          
          return (
            <motion.div
              key={item}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 ${
                showResult
                  ? isInCorrectPosition
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-red-50 border-red-500'
                  : 'bg-white border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                {/* Order Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Item Text */}
                <div className="flex-1 font-medium text-gray-900">
                  {item}
                </div>

                {/* Move Buttons */}
                {!showResult && !disabled && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Result Icon */}
                {showResult && (
                  <div className="flex-shrink-0">
                    {isInCorrectPosition ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Check Button */}
      {!showResult && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheck}
            disabled={disabled}
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
                {isCorrect ? 'Правильная последовательность!' : 'Попробуйте еще раз в следующий раз'}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
