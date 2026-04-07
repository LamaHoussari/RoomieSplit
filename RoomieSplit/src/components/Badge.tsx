type BadgeVariant = 'purple' | 'green' | 'red' | 'orange' | 'violet';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  purple: 'border-[#ddd0e9] bg-[#f4eef8] text-[#6f4f8b] dark:border-[#4a375e] dark:bg-[#2b2136] dark:text-[#d4c0ea]',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-200',
  red: 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-200',
  orange: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200',
  violet: 'border-[#ddd0e9] bg-[#efe8f7] text-[#7b5f99] dark:border-[#4a375e] dark:bg-[#332740] dark:text-[#cfbee4]',
};

export default function Badge({ children, variant = 'purple' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${variants[variant]}`}>
      {children}
    </span>
  );
}
