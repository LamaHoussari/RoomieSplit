export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-2xl p-8 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-purple-900 dark:text-purple-100 mb-6">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
