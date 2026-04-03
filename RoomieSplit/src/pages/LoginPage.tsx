import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FormField, { Input } from '../components/FormField';
import Button from '../components/Button';

type LoginMode = 'login' | 'register';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER_EMAIL_DOMAIN_PATTERN = /@(example\.com|example\.org|example\.net)$/i;

type AuthProps = {
  onSignUp: (email: string, password: string) => Promise<boolean>;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  error: string;
  successMessage: string;
  loading: boolean;
};

export default function LoginPage({
  onSignUp, onSignIn, error, successMessage, loading,
}: AuthProps) {
  const [mode, setMode] = useState<LoginMode>('login');
  const [exiting, setExiting] = useState(false);
  const { dark, toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const navigate = useNavigate();

  function validate(normalizedEmail: string) {
    if (!normalizedEmail || !password.trim()) {
      setLocalError('Email and password are required.');
      return false;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setLocalError('Enter a valid email address.');
      return false;
    }

    if (PLACEHOLDER_EMAIL_DOMAIN_PATTERN.test(normalizedEmail)) {
      setLocalError('Use a real email inbox. Placeholder domains like example.com cannot sign up.');
      return false;
    }

    setLocalError('');
    return true;
  }

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);

    if (!validate(normalizedEmail)) return;
    setExiting(true);

    if (mode === 'login') {
      if (await onSignIn(normalizedEmail, password)) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } else {
        setExiting(false);
      }
      return;
    }

    if (await onSignUp(normalizedEmail, password)) {
      setPassword('');
      setMode('login');
    }

    setExiting(false);
  };

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

        <div className="rounded-3xl border border-stone-200/80 bg-white/86 p-7 shadow-[0_30px_80px_-46px_rgba(28,25,23,0.55)] backdrop-blur-sm animate-slide-up-soft dark:border-slate-800/70 dark:bg-slate-900/78 dark:shadow-black/35 sm:p-8">
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
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          </FormField>

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
          {successMessage && (
            <p className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
              {successMessage}
            </p>
          )}

          <Button className="mt-4 w-full" size="lg" onClick={handleSubmit} disabled={loading}>
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>

          <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-sm text-stone-500 dark:border-slate-800 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              className="font-semibold text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
