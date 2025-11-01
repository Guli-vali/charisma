'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle, Check, X } from 'lucide-react';
import type { TrueFalseExercise } from '@/lib/types';

interface TrueFalseProps {
  exercise: TrueFalseExercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function TrueFalse({ exercise, onAnswer, disabled }: TrueFalseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = (answer: boolean) => {
    if (showResult || disabled) return;
    
    setSelectedAnswer(answer);
    const correct = answer === exercise.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Statement */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
          {exercise.statement}
        </h2>
      </motion.div>

      {/* True/False Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleAnswer(true)}
            disabled={showResult || disabled}
            className={`w-full p-6 rounded-2xl border-4 transition-all duration-200 ${
              showResult && exercise.correct_answer
                ? 'bg-emerald-500 border-emerald-600 text-white scale-105'
                : showResult && selectedAnswer === true && !isCorrect
                ? 'bg-red-500 border-red-600 text-white'
                : selectedAnswer === true && !showResult
                ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:scale-105'
            } ${showResult || disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <Check className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl font-bold">ПРАВДА</span>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleAnswer(false)}
            disabled={showResult || disabled}
            className={`w-full p-6 rounded-2xl border-4 transition-all duration-200 ${
              showResult && !exercise.correct_answer
                ? 'bg-emerald-500 border-emerald-600 text-white scale-105'
                : showResult && selectedAnswer === false && !isCorrect
                ? 'bg-red-500 border-red-600 text-white'
                : selectedAnswer === false && !showResult
                ? 'bg-red-100 border-red-500 text-red-900'
                : 'bg-white border-red-300 text-red-700 hover:bg-red-50 hover:scale-105'
            } ${showResult || disabled ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className="text-center">
              <X className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xl font-bold">ЛОЖЬ</span>
            </div>
          </button>
        </motion.div>
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
