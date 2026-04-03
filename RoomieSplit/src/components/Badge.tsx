type BadgeVariant = 'purple' | 'green' | 'red' | 'orange' | 'violet';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  purple: 'bg-[#f4eef8] text-[#6f4f8b] dark:bg-[#2b2136] dark:text-[#d4c0ea]',
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-200',
  orange: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200',
  violet: 'bg-[#efe8f7] text-[#7b5f99] dark:bg-[#332740] dark:text-[#cfbee4]',
};

export default function Badge({ children, variant = 'purple' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border border-stone-200/70 px-3 py-1 text-sm font-semibold dark:border-white/10 ${variants[variant]}`}>
      {children}
    </span>
  );
}
