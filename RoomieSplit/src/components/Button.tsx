import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border border-[#6f4f8b] bg-[#6f4f8b] text-white hover:border-[#5d4177] hover:bg-[#5d4177] dark:border-[#8d70b0] dark:bg-[#7e62a0] dark:hover:border-[#9a7fbb] dark:hover:bg-[#8d70b0]',
  outline:
    'border border-[#d5c9e2] bg-white/76 text-[#5f467a] hover:border-[#6f4f8b] hover:bg-[#f4eef8] dark:border-[#4a375e] dark:bg-slate-900/62 dark:text-[#d4c0ea] dark:hover:border-[#8d70b0] dark:hover:bg-[#2b2136]',
  danger:
    'border border-red-300/70 bg-red-50/92 text-red-700 hover:border-red-400 hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50',
  ghost:
    'border border-transparent bg-transparent text-[#6f4f8b] hover:bg-[#f4eef8] dark:text-[#d4c0ea] dark:hover:bg-[#2b2136]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-11 px-5 text-sm sm:text-base',
  lg: 'min-h-12 px-6 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-w-fit items-center justify-center gap-2 rounded-[8px] font-semibold transition-all duration-150
      active:translate-y-[1px]
      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8c74aa]/14 focus-visible:ring-offset-2 focus-visible:ring-offset-white
      dark:focus-visible:ring-offset-slate-950
      disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:shadow-none disabled:active:translate-y-0
      ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
