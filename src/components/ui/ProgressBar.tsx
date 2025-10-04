import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'primary' | 'accent' | 'success' | 'error';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar = ({
  value,
  max = 100,
  variant = 'primary',
  showLabel = true,
  label,
  size = 'md',
  className,
  ...props
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const variantStyles = {
    primary: 'bg-indigo-500',
    accent: 'bg-amber-500',
    success: 'bg-emerald-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Прогресс'}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-gray-200', sizeStyles[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-300 ease-in-out',
            variantStyles[variant],
            sizeStyles[size]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
          <span>{value}</span>
          <span>из {max}</span>
        </div>
      )}
    </div>
  );
};

export { ProgressBar };
