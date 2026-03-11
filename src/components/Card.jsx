export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-purple-950/80 border border-purple-100 dark:border-purple-900/60 rounded-2xl p-6 shadow-sm ${className}`}>
      {title && (
        <h3 className="font-display font-semibold text-purple-800 dark:text-purple-200 text-base mb-5">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
