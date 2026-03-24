export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white/90 dark:bg-purple-950/80 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {title && (
        <h3 className="font-display font-semibold text-purple-900 dark:text-purple-100 text-lg mb-5">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
