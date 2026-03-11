export default function FormField({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium uppercase tracking-wider text-purple-400 dark:text-purple-500 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full bg-purple-50/60 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 text-sm text-purple-900 dark:text-purple-100 placeholder-purple-300 dark:placeholder-purple-600 outline-none focus:border-purple-400 dark:focus:border-purple-600 transition-colors ${className}`}
      {...props}
    />
  );
}

export function Select({ children, className = '', ...props }) {
  return (
    <select
      className={`w-full bg-purple-50/60 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 text-sm text-purple-900 dark:text-purple-100 outline-none focus:border-purple-400 dark:focus:border-purple-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
