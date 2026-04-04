import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FormField, { Input } from '../components/FormField';
import Button from '../components/Button';

type LoginMode = 'login' | 'register';

type AuthProps = {
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onClearFeedback: () => void;
  error: string;
  successMessage: string;
  loading: boolean;
};

export default function LoginPage({
  onSignUp, onSignIn, onClearFeedback, error, successMessage, loading,
}: AuthProps) {
  const [mode, setMode] = useState<LoginMode>('login');
  const [exiting, setExiting] = useState(false);
  const { dark, toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!localError) return;
    const id = setTimeout(() => setLocalError(''), 5000);
    return () => clearTimeout(id);
  }, [localError]);

  const navigate = useNavigate();

  const toggleMode = () => {
    setLocalError('');
    onClearFeedback();
    setMode(mode === 'login' ? 'register' : 'login');
  };

  function validate() {
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return false;
    }
    setLocalError('');
    return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setExiting(true);

    if (mode === 'login') {
      if (await onSignIn(email, password)) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } else {
        setExiting(false);
      }
      return;
    }

    if (await onSignUp(email, password)) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } else {
      setExiting(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit();
  };

  console.log('auth message', error || successMessage);

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_52%,#ffffff_100%)] p-6 transition-all duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(111,79,139,0.12),_transparent_25%),linear-gradient(180deg,_#0f1720_0%,_#111827_100%)]
        ${exiting ? 'translate-y-[-8px] opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <button
        type="button"
        onClick={toggle}
        className="fixed right-5 top-5 inline-flex items-center justify-center rounded-2xl border border-stone-300/80 bg-white/80 p-2.5 text-stone-700 shadow-sm transition hover:bg-stone-100/80 hover:text-stone-950 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-13a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 2Zm0 14a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 16Zm8-6a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 18 10ZM3.75 10.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 0 1.5Zm11.56 4.06a.75.75 0 0 1 1.06 0l.7.7a.75.75 0 1 1-1.06 1.06l-.7-.7a.75.75 0 0 1 0-1.06ZM3.93 4.49a.75.75 0 0 1 1.06 0l.7.7A.75.75 0 1 1 4.63 6.25l-.7-.7a.75.75 0 0 1 0-1.06Zm12.44-1.06a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.06-1.06l.7-.7a.75.75 0 0 1 1.06 0ZM5.39 14.81a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.06-1.06l.7-.7a.75.75 0 0 1 1.06 0Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a.75.75 0 0 1 .916-.916A6.5 6.5 0 1 0 18.21 12.377a.75.75 0 0 1-.917.916Z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center animate-slide-up-soft">
          <div className="mx-auto mb-4 h-12 w-12 rounded-3xl bg-[linear-gradient(135deg,#6f4f8b,#392b48)] shadow-sm dark:bg-[linear-gradient(135deg,#a88bc9,#4b365f)]" />
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-stone-900 dark:text-slate-100 sm:text-5xl">
            Roomie<span className="text-[#6f4f8b] dark:text-[#d4c0ea]">Split</span>
          </h1>
          <p className="mt-2 text-base text-stone-500 dark:text-slate-400">
            Shared expenses, zero disputes.
          </p>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="rounded-3xl border border-stone-200/80 bg-white/86 p-7 shadow-[0_30px_80px_-46px_rgba(28,25,23,0.55)] backdrop-blur-sm animate-slide-up-soft dark:border-slate-800/70 dark:bg-slate-900/78 dark:shadow-black/35 sm:p-8"
        >
          <h2 className="mb-6 font-display text-2xl font-semibold text-stone-900 dark:text-slate-100">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          <FormField label="Email">
            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </FormField>

          {mode === 'register' && (
            <FormField label="Full Name">
              <Input type="text" placeholder="Your full name" />
            </FormField>
          )}

          <FormField label="Password">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-lg px-2 text-stone-400 transition hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path d="M4.03 3.97a.75.75 0 0 0-1.06 1.06l12 12a.75.75 0 1 0 1.06-1.06l-1.53-1.53A9.78 9.78 0 0 0 18.4 10a9.77 9.77 0 0 0-3.24-3.57l-1.1 1.1A8.3 8.3 0 0 1 16.76 10a8.3 8.3 0 0 1-3.34 2.68l-1.27-1.27a3 3 0 0 0-3.83-3.83L6.9 6.15A8.26 8.26 0 0 1 10 5.52c.56 0 1.1.06 1.63.17l1.22-1.22A9.8 9.8 0 0 0 10 4.02 9.77 9.77 0 0 0 1.6 10a9.75 9.75 0 0 0 4.2 4.43l1.1-1.1A8.29 8.29 0 0 1 3.24 10 8.28 8.28 0 0 1 5.84 7.47l-1.8-1.8Zm6.06 6.06 1.88 1.88a1.5 1.5 0 0 1-1.88-1.88Zm-2.06-2.06a1.5 1.5 0 0 0 1.88 1.88L8.03 7.97Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path d="M10 4.02A9.77 9.77 0 0 0 1.6 10a9.77 9.77 0 0 0 16.8 0A9.77 9.77 0 0 0 10 4.02Zm0 12.46A8.28 8.28 0 0 1 3.24 10 8.28 8.28 0 0 1 10 5.52 8.28 8.28 0 0 1 16.76 10 8.28 8.28 0 0 1 10 16.48Zm0-9a2.52 2.52 0 1 0 0 5.04 2.52 2.52 0 0 0 0-5.04Zm0 3.54a1.02 1.02 0 1 1 0-2.04 1.02 1.02 0 0 1 0 2.04Z" />
                  </svg>
                )}
              </button>
            </div>
          </FormField>
          {mode === 'login' && (
            <div className="-mt-1 text-right text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {localError && (
            <p className="mt-4 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300">
              {localError}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" className="mt-4 w-full" size="lg" disabled={loading}>
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>

          <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-sm text-stone-500 dark:border-slate-800 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              className="font-semibold text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
              onClick={toggleMode}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
