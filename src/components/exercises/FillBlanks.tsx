'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FillBlanksExercise } from '@/lib/types';

interface FillBlanksProps {
  exercise: FillBlanksExercise;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function FillBlanks({ exercise, onAnswer, disabled }: FillBlanksProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const blankKeys = Object.keys(exercise.blanks);
  const allFilled = blankKeys.every(key => selectedAnswers[key]);

  const handleSelectAnswer = (blankKey: string, answer: string) => {
    if (showResult || disabled) return;
    setSelectedAnswers(prev => ({ ...prev, [blankKey]: answer }));
  };

  const handleCheck = () => {
    if (!allFilled || showResult) return;

    // Проверяем правильность ответов
    const correct = blankKeys.every((key, index) => {
      return selectedAnswers[key] === exercise.correct_answers[index];
    });

    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  // Разбиваем предложение на части
  const renderSentence = () => {
    let sentence = exercise.sentence;
    const parts: JSX.Element[] = [];
    
    blankKeys.forEach((blankKey, index) => {
      const [before, after] = sentence.split(`{${blankKey}}`);
      
      if (before) {
        parts.push(<span key={`text-${index}`}>{before}</span>);
      }
      
      parts.push(
        <span
          key={blankKey}
          className={`inline-block min-w-[120px] px-3 py-1 mx-1 rounded-lg border-2 font-semibold ${
            showResult
              ? selectedAnswers[blankKey] === exercise.correct_answers[index]
                ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                : 'bg-red-100 border-red-500 text-red-900'
              : selectedAnswers[blankKey]
              ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
              : 'bg-gray-100 border-gray-300 border-dashed text-gray-400'
          }`}
        >
          {selectedAnswers[blankKey] || '___'}
        </span>
      );
      
      sentence = after || '';
    });
    
    if (sentence) {
      parts.push(<span key="text-end">{sentence}</span>);
    }
    
    return parts;
  };

  return (
    <div className="space-y-6">
      {/* Sentence with blanks */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
      >
        {renderSentence()}
      </motion.div>

      {/* Word bank */}
      <div className="max-w-2xl mx-auto">
        <p className="text-sm text-gray-600 mb-3">Выберите слова для заполнения пропусков:</p>
        <div className="space-y-4">
          {blankKeys.map((blankKey, blankIndex) => (
            <div key={blankKey} className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Пропуск {blankIndex + 1}:</p>
              <div className="flex flex-wrap gap-2">
                {exercise.blanks[blankKey].map((option, optionIndex) => (
                  <motion.button
                    key={optionIndex}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectAnswer(blankKey, option)}
                    disabled={showResult || disabled}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedAnswers[blankKey] === option
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
                    } ${showResult || disabled ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check Button */}
      {!showResult && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheck}
            disabled={!allFilled || disabled}
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
                {isCorrect ? 'Правильно!' : 'Попробуйте еще раз в следующий раз'}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
