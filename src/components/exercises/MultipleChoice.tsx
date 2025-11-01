'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { MultipleChoiceExercise } from '@/lib/types';

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MultipleChoice({ exercise, onAnswer, disabled }: MultipleChoiceProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelectOption = (index: number) => {
    if (showResult || disabled) return;
    
    setSelectedOption(index);
    const correct = index === exercise.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Даем время на анимацию перед вызовом callback
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {exercise.question}
        </h2>
      </motion.div>

      {/* Options */}
      <div className="space-y-3 max-w-2xl mx-auto">
        {exercise.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrectAnswer = index === exercise.correct_answer;
          const showCorrect = showResult && isCorrectAnswer;
          const showIncorrect = showResult && isSelected && !isCorrect;

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectOption(index)}
              disabled={showResult || disabled}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                showCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : showIncorrect
                  ? 'bg-red-50 border-red-500 text-red-900'
                  : isSelected
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-white border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
              } ${showResult || disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {showIncorrect && <XCircle className="w-6 h-6 text-red-500" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
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
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className={`font-semibold mb-1 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                  {isCorrect ? 'Правильно!' : 'Неправильно'}
                </h3>
                <p className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                  {exercise.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
