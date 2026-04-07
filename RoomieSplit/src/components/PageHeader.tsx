interface PageHeaderProps {
  title: string;
  subtitle?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: string;
}

export default function PageHeader({
  title,
  subtitle,
  filters,
  actions,
  eyebrow = 'Workspace',
}: PageHeaderProps) {
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="rs-kicker">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-stone-950 dark:text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm text-stone-500 dark:text-slate-400 sm:text-base">
              {subtitle}
            </p>
          )}
          {filters && <div className="mt-5 flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </section>
  );
}
