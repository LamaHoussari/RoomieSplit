const variants = {
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-800/40 dark:text-purple-300',
  green:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  red:    'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400',
  orange: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
};

export default function Badge({ children, variant = 'purple' }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
