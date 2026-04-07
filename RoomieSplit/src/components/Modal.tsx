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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className="modal-layer fixed inset-0 z-50 grid place-items-center bg-stone-950/28 p-5 backdrop-blur-[3px] animate-fade-in dark:bg-slate-950/76 sm:p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="rs-panel rs-panel-strong w-full max-w-xl overflow-hidden animate-pop-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 bg-[#6f4f8b] dark:bg-[#b59ad6]" />
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="rs-kicker">Dialog</p>
              <h2 className="mt-1 font-display text-xl font-semibold text-stone-950 dark:text-white">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rs-action-icon"
              aria-label="Close"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 1 1.06 0L10 7.94l2.66-2.72a.75.75 0 1 1 1.08 1.04L11.06 9l2.68 2.74a.75.75 0 1 1-1.08 1.04L10 10.06l-2.66 2.72a.75.75 0 0 1-1.08-1.04L8.94 9 6.28 6.26a.75.75 0 0 1 0-1.04Z" />
              </svg>
            </button>
          </div>
          <div className="max-h-[72vh] overflow-y-auto pr-1">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
