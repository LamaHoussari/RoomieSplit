import { useState, useRef, useEffect, Children, isValidElement } from 'react';
import type { ReactNode, InputHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
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

interface SelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, children, className = '', disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse options from <option> children
  const options: { value: string; label: string }[] = [];
  const parseChildren = (nodes: ReactNode) => {
    Children.forEach(nodes, child => {
      if (isValidElement(child) && child.type === 'option') {
        const optionProps = child.props as { value: string; children: ReactNode };
        options.push({
          value: optionProps.value,
          label: String(optionProps.children ?? ''),
        });
      }
    });
  };
  parseChildren(children);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between bg-white/90 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl pl-4 pr-3 py-2.5 text-sm text-purple-900 dark:text-purple-100 outline-none shadow-sm
        hover:border-purple-400 dark:hover:border-purple-500
        focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200/60 dark:focus:ring-purple-700/40 transition
        disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className="truncate">{selected?.label ?? '—'}</span>
        <svg
          className={`ml-2 h-4 w-4 text-purple-500/80 dark:text-purple-300/70 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1.5 w-full bg-white dark:bg-purple-950 border border-purple-200/80 dark:border-purple-800/80 rounded-2xl shadow-lg overflow-hidden py-1">
          {options.map(opt => (
            <li
              key={opt.value}
              onClick={() => { onChange({ target: { value: opt.value } }); setOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors
                ${opt.value === value
                  ? 'bg-purple-600 text-white font-ariel'
                  : 'text-purple-900 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900/40'
                }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}