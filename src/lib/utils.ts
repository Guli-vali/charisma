import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateProgressToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const totalXpForCurrentLevel = currentLevel * 100;
  const xpIntoCurrentLevel = xp - ((currentLevel - 1) * 100);
  return (xpIntoCurrentLevel / 100) * 100;
}

export function calculateXpToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const totalXpForCurrentLevel = currentLevel * 100;
  const xpIntoCurrentLevel = xp - ((currentLevel - 1) * 100);
  return 100 - xpIntoCurrentLevel;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
