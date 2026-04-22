import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localError) return;
    const id = setTimeout(() => setLocalError(''), 5000);
    return () => clearTimeout(id);
  }, [localError]);

  const toggleMode = () => {
    setLocalError('');
    onClearFeedback();
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
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

  return (
    <div className={exiting ? 'translate-y-[-8px] opacity-0 transition-all duration-300' : 'translate-y-0 opacity-100 transition-all duration-300'}>
      <AuthShell
        title={mode === 'login' ? 'Sign in' : 'Create account'}
        subtitle={mode === 'login' ? 'Pick up where you left off and get back to the live state of your home.' : 'Start a new workspace and bring roommates into one shared system.'}
      >
        <div className="mb-6 grid grid-cols-2 border border-stone-200/80 bg-stone-100/75 p-1 dark:border-slate-800 dark:bg-slate-900/55">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-4 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-[#6f4f8b] text-white dark:bg-[#7e62a0]' : 'text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-4 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-[#6f4f8b] text-white dark:bg-[#7e62a0]' : 'text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white'}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <FormField label="Email">
            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </FormField>

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
                className="absolute inset-y-0 right-3 inline-flex items-center justify-center rounded-[6px] px-2 text-stone-400 transition hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-200"
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

          {mode === 'register' && (
            <div className="-mt-1 text-right text-sm">
              <button
                type="button"
                onClick={generatePassword}
                className="font-medium text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
              >
                Suggested password
              </button>
            </div>
          )}
          
          {localError && (
            <p className="mt-4 rs-alert rs-alert-error">
              {localError}
            </p>
          )}
          {error && (
            <p className="mt-4 rs-alert rs-alert-error">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="mt-4 rs-alert rs-alert-success">
              {successMessage}
            </p>
          )}

          <Button type="submit" className="mt-5 w-full" size="lg" disabled={loading}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-sm text-stone-500 dark:border-slate-800 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              className="font-semibold text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
              onClick={toggleMode}
            >
              {mode === 'login' ? 'Create one' : 'Sign in instead'}
            </button>
          </div>
        </form>
      </AuthShell>
    </div>
  );
}
