import type { ReactNode } from 'react';

type MetricTone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  className?: string;
}

const toneClasses: Record<MetricTone, { label: string; value: string }> = {
  accent: {
    label: 'text-[#6f4f8b] dark:text-[#d4c0ea]',
    value: 'text-stone-950 dark:text-white',
  },
  success: {
    label: 'text-emerald-700 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  warning: {
    label: 'text-amber-700 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
  },
  danger: {
    label: 'text-red-700 dark:text-red-300',
    value: 'text-red-700 dark:text-red-300',
  },
  neutral: {
    label: 'text-stone-500 dark:text-slate-400',
    value: 'text-stone-950 dark:text-white',
  },
};

export default function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'accent',
  className = '',
}: MetricCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <div className={`rs-panel p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${toneClass.label}`}>{label}</p>
          <div className={`mt-2 font-display text-3xl font-semibold sm:text-[2rem] ${toneClass.value}`}>
            {value}
          </div>
          {detail && (
            <p className="mt-2 text-sm text-stone-500 dark:text-slate-400">
              {detail}
            </p>
          )}
        </div>
        {icon && (
          <span className="mt-1 shrink-0 text-stone-400 dark:text-slate-500">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
