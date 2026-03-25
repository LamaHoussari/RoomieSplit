import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-base font-semibold text-purple-700/80 dark:text-purple-200/80 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full bg-white/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl px-4 py-3.5 text-base text-purple-900 dark:text-purple-100 placeholder-purple-400/90 dark:placeholder-purple-300/60 outline-none shadow-sm
      focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200/60 dark:focus:ring-purple-700/40 transition
      disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = '', ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none bg-white/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl pl-4 pr-10 py-3.5 text-base text-purple-900 dark:text-purple-100 outline-none shadow-sm
        focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200/60 dark:focus:ring-purple-700/40 transition
        disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500/80 dark:text-purple-300/70"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
