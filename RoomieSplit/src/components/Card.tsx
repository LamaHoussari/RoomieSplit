interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] backdrop-blur-sm transition-shadow hover:shadow-[0_24px_56px_-34px_rgba(28,25,23,0.5)] dark:border-slate-800/70 dark:bg-slate-900/78 ${className}`}>
      {title && (
        <h3 className="mb-5 text-lg font-display font-semibold text-stone-900 dark:text-slate-100">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
