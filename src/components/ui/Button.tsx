import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'success' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center min-h-[36px]';
    
    const variants = {
      primary: 'bg-indigo-500 text-white hover:scale-105 hover:shadow-xl hover:bg-indigo-600 focus:ring-indigo-500 active:scale-95',
      accent: 'bg-amber-500 text-white hover:scale-105 hover:shadow-xl hover:bg-amber-600 focus:ring-amber-500 active:scale-95',
      success: 'bg-emerald-500 text-white hover:scale-105 hover:shadow-xl hover:bg-emerald-600 focus:ring-emerald-500 active:scale-95',
      error: 'bg-red-500 text-white hover:scale-105 hover:shadow-xl hover:bg-red-600 focus:ring-red-500 active:scale-95',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:scale-105 focus:ring-gray-300',
      outline: 'border-2 border-indigo-500 text-indigo-600 bg-transparent hover:bg-indigo-500 hover:text-white hover:scale-105 focus:ring-indigo-500'
    };
    
    const sizes = {
      sm: 'px-5 py-2.5 text-sm min-h-[32px]',
      md: 'px-6 py-3 text-base min-h-[40px]',
      lg: 'px-8 py-4 text-lg min-h-[48px]'
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
