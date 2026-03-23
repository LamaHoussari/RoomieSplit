export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-purple-900 dark:text-purple-100 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-purple-500/90 dark:text-purple-300/70 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
