import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import FormField, { Input } from '../components/FormField';
import Button from '../components/Button';

type LoginMode = 'login' | 'register';

type AuthProps = {
    onSignUp: (email:string, password:string) => Promise<boolean>;
    onSignIn: (email:string, password:string) => Promise<boolean>;
error:string;
successMessage: string;
loading:boolean;
}

export default function LoginPage({
    onSignUp, onSignIn, error, successMessage, loading
}: AuthProps) {
  const [mode, setMode] = useState<LoginMode>('login');
  const [exiting, setExiting] = useState(false);
  const { dark, toggle } = useTheme();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [localError, setLocalError] = useState("")

  function validate(){
      if(!email.trim() || !password.trim()){
          setLocalError("Email & pass are required!")
          return false
      }
      setLocalError("")
      return true;
  }

  const handleSubmit = async () => {
    if (!validate()) return;
    setExiting(true);
    if (mode === 'login') {
      await onSignIn(email, password)
    } else {
      await onSignUp(email, password)
  }
};

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0c18] dark:to-purple-950 flex items-center justify-center p-6 transition-all duration-300
        ${exiting ? 'opacity-0 translate-y-[-8px]' : 'opacity-100 translate-y-0'}`}
    >
      <button
        type="button"
        onClick={toggle}
        className="fixed top-5 right-5 inline-flex items-center justify-center rounded-2xl p-2.5 border border-purple-200/70 bg-white/70 hover:bg-white shadow-sm text-purple-700 hover:text-purple-900 transition
        dark:border-purple-900/70 dark:bg-purple-950/60 dark:hover:bg-purple-950 dark:text-purple-200 dark:hover:text-white"
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
        <div className="text-center mb-8 animate-slide-up-soft">
          <div className="mx-auto mb-4 h-12 w-12 rounded-3xl bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-sm" />
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-purple-900 dark:text-purple-100 tracking-tight">
            Roomie<span className="text-purple-600 dark:text-purple-300">Split</span>
          </h1>
          <p className="text-base text-purple-600/80 dark:text-purple-300/70 mt-2">
            Shared expenses, zero disputes.
          </p>
        </div>

        <div className="bg-white/85 dark:bg-purple-950/50 border border-purple-100/80 dark:border-purple-900/60 rounded-3xl p-7 sm:p-8 shadow-xl shadow-purple-900/5 dark:shadow-black/30 animate-slide-up-soft">
          <h2 className="font-display text-2xl font-semibold text-purple-900 dark:text-purple-100 mb-6">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          <FormField label="Email">
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>

          {mode === 'register' && (
            <FormField label="Full Name">
              <Input type="text" placeholder="Your full name" />
            </FormField>
          )}

          <FormField label="Password">
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
        
          {/* Note: needs styling */}
          {localError && <p>{localError}</p>}
          {error && <p>{error}</p>}
          {successMessage && <p>{successMessage}</p>}
          <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={loading}>
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>

          <div className="border-t border-purple-100 dark:border-purple-900/60 mt-6 pt-5 text-center text-sm text-purple-600/70 dark:text-purple-300/70">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              className="text-purple-700 dark:text-purple-200 font-semibold hover:underline underline-offset-4"
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
