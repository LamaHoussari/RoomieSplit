import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md',
  outline:
    'border border-purple-200/80 dark:border-purple-800 text-purple-700 dark:text-purple-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/30 shadow-sm hover:shadow-md',
  danger:
    'border border-red-200/80 dark:border-red-900 text-red-600 dark:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 shadow-sm hover:shadow-md',
  ghost:
    'text-purple-700 dark:text-purple-200 hover:bg-purple-50/80 dark:hover:bg-purple-900/30',
};
const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-5 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:translate-y-[1px]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white
      dark:focus-visible:ring-offset-[#110e1c]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none disabled:active:translate-y-0
      ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
