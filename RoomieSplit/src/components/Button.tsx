import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-[#6f4f8b] text-white shadow-sm hover:bg-[#61457a] hover:shadow-md dark:bg-[#7e62a0] dark:text-white dark:hover:bg-[#8d70b0]',
  outline:
    'border border-[#ddd0e9] bg-white/70 text-[#6f4f8b] shadow-sm hover:bg-[#f4eef8] hover:shadow-md dark:border-[#4a375e] dark:bg-slate-900/50 dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]',
  danger:
    'border border-red-200/80 bg-red-50/80 text-red-700 shadow-sm hover:bg-red-100/80 hover:shadow-md dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50',
  ghost:
    'text-[#6f4f8b] hover:bg-[#f4eef8] dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]',
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
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8c74aa]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white
      dark:focus-visible:ring-offset-slate-950
      disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:shadow-none disabled:active:translate-y-0
      ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
