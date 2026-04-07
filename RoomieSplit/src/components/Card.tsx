interface CardProps {
  title?: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function Card({
  title,
  description,
  eyebrow,
  action,
  children,
  className = '',
  contentClassName = '',
}: CardProps) {
  return (
    <section className={`rs-panel p-5 sm:p-6 ${className}`}>
      {(title || description || eyebrow || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {eyebrow && <p className="rs-kicker">{eyebrow}</p>}
            {title && (
              <h3 className="mt-1 font-display text-xl font-semibold text-stone-950 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
