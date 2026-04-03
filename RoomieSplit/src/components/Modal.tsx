import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  return createPortal(
    <div
      onClick={onClose}
      className="modal-layer fixed inset-0 z-50 grid place-items-center bg-stone-950/15 p-5 backdrop-blur-[2px] animate-fade-in dark:bg-slate-950/70 sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-3xl border border-stone-200/80 bg-white/96 p-6 shadow-2xl animate-pop-in dark:border-slate-800 dark:bg-slate-900/96 sm:p-7"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-slate-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl p-2 text-stone-500 transition hover:bg-stone-100/80 hover:text-stone-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
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
    </div>,
    document.body,
  );
}
