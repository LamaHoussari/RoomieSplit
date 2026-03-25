interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm grid place-items-center z-50 p-5 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-purple-950 border border-purple-100/80 dark:border-purple-900/70 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl animate-pop-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="font-display text-xl font-semibold text-purple-900 dark:text-purple-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl p-2 text-purple-500/80 hover:text-purple-700 hover:bg-purple-50/80 dark:text-purple-300/80 dark:hover:text-purple-100 dark:hover:bg-purple-900/40 transition"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 1 1.06 0L10 7.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L11.06 9l2.68 2.74a.75.75 0 1 1-1.08 1.04L10 10.06l-2.66 2.72a.75.75 0 0 1-1.08-1.04L8.94 9 6.28 6.26a.75.75 0 0 1 0-1.04Z" />
            </svg>
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
