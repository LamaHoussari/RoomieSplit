import { useState, useRef, useEffect, Children, isValidElement, useId, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { CSSProperties, KeyboardEvent, ReactNode, InputHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-semibold text-stone-700 dark:text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-2xl border border-stone-300/80 bg-white/88 px-4 py-3.5 text-base text-stone-900 placeholder:text-stone-400 outline-none shadow-sm transition
      focus:border-[#8c74aa] focus:ring-2 focus:ring-[#8c74aa]/15
      dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-[#b59ad6] dark:focus:ring-[#b59ad6]/20
      disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

interface SelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, children, className = '', disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();

  const options = useMemo(() => {
    const parsedOptions: { value: string; label: string; disabled: boolean }[] = [];
    Children.forEach(children, child => {
      if (isValidElement(child) && child.type === 'option') {
        const optionProps = child.props as { value?: string; children: ReactNode; disabled?: boolean };
        parsedOptions.push({
          value: String(optionProps.value ?? ''),
          label: String(optionProps.children ?? ''),
          disabled: Boolean(optionProps.disabled),
        });
      }
    });
    return parsedOptions;
  }, [children]);

  const selected = options.find(o => o.value === value);
  const selectedIndex = options.findIndex(o => o.value === value);

  const findNextEnabledIndex = (startIndex: number) => {
    if (options.length === 0) return -1;
    for (let offset = 1; offset <= options.length; offset += 1) {
      const nextIndex = (startIndex + offset + options.length) % options.length;
      if (!options[nextIndex].disabled) return nextIndex;
    }
    return -1;
  };

  const findPreviousEnabledIndex = (startIndex: number) => {
    if (options.length === 0) return -1;
    for (let offset = 1; offset <= options.length; offset += 1) {
      const nextIndex = (startIndex - offset + options.length) % options.length;
      if (!options[nextIndex].disabled) return nextIndex;
    }
    return -1;
  };

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const minWidth = Math.min(rect.width, viewportWidth - 24);
    const left = Math.max(12, Math.min(rect.left, viewportWidth - minWidth - 12));
    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUpwards = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(320, Math.max(140, openUpwards ? spaceAbove - 8 : spaceBelow - 8));
    const top = openUpwards
      ? Math.max(12, rect.top - maxHeight - 8)
      : Math.min(viewportHeight - maxHeight - 12, rect.bottom + 8);

    setMenuStyle({
      position: 'fixed',
      top,
      left,
      width: minWidth,
      maxHeight,
      zIndex: 90,
    });
  };

  const selectValue = (nextValue: string) => {
    onChange({ target: { value: nextValue } });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nextIndex = selectedIndex >= 0 && !options[selectedIndex]?.disabled
      ? selectedIndex
      : options.findIndex(option => !option.disabled);
    setActiveIndex(nextIndex);
  }, [open, options, selectedIndex]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || options.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((current) => findNextEnabledIndex(current < 0 ? selectedIndex : current));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((current) => findPreviousEnabledIndex(current < 0 ? selectedIndex : current));
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (activeIndex >= 0 && !options[activeIndex]?.disabled) {
        selectValue(options[activeIndex].value);
      }
      return;
    }

    if (e.key === 'Escape' && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border border-stone-300/80 bg-white/92 px-4 py-3 text-left text-sm text-stone-900 outline-none shadow-[0_10px_24px_-18px_rgba(28,25,23,0.55)] transition
        hover:border-stone-400 hover:bg-white
        focus-visible:border-[#8c74aa] focus-visible:ring-2 focus-visible:ring-[#8c74aa]/15
        dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900
        dark:focus-visible:border-[#b59ad6] dark:focus-visible:ring-[#b59ad6]/20
        disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <span className="min-w-0">
          <span className="block truncate font-medium text-stone-900 dark:text-slate-100">
            {selected?.label ?? '-'}
          </span>
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-stone-100/90 text-stone-500 transition-all group-hover:bg-stone-200/80 group-hover:text-stone-700 dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:bg-slate-700/80 dark:group-hover:text-slate-200 ${open ? 'rotate-180' : ''}`}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <ul
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          style={menuStyle}
          className="overflow-y-auto rounded-3xl border border-stone-200/90 bg-white/96 p-1.5 shadow-[0_24px_60px_-28px_rgba(28,25,23,0.42)] backdrop-blur-xl dark:border-slate-700/90 dark:bg-slate-950/96"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isActive = index === activeIndex;

            return (
              <li key={opt.value} role="presentation">
                <button
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => {
                    if (!opt.disabled) setActiveIndex(index);
                  }}
                  onClick={() => {
                    if (!opt.disabled) selectValue(opt.value);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left text-sm transition-colors
                    ${opt.disabled
                      ? 'cursor-not-allowed text-stone-400 opacity-60 dark:text-slate-600'
                      : isSelected
                        ? 'bg-[#6f4f8b] text-white shadow-sm dark:bg-[#352643] dark:text-[#f1e8fb]'
                        : isActive
                          ? 'bg-stone-100 text-stone-900 dark:bg-slate-800 dark:text-slate-100'
                          : 'text-stone-700 hover:bg-stone-100/90 hover:text-stone-900 dark:text-slate-200 dark:hover:bg-slate-800/90 dark:hover:text-slate-100'
                    }`}
                >
                  <span className="truncate font-medium">{opt.label}</span>
                  <span className="shrink-0">
                    {isSelected ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-8 8.091a.75.75 0 0 1-1.07 0l-4.347-4.398a.75.75 0 0 1 1.067-1.055l3.813 3.857 7.466-7.55a.75.75 0 0 1 1.065-.005Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`block h-2.5 w-2.5 rounded-full ${isActive ? 'bg-stone-300 dark:bg-slate-600' : 'bg-transparent'}`} />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}
    </div>
  );
}
