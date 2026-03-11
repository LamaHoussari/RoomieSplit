import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import FormField, { Input } from '../components/FormField';
import Button from '../components/Button';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-purple-50 dark:bg-purple-950 flex items-center justify-center p-6">
      <button
        onClick={toggle}
        className="fixed top-5 right-5 text-xl text-purple-400 hover:text-purple-600 transition-colors"
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-purple-700 dark:text-purple-300 tracking-tight">
            Roomie<span className="text-purple-400 dark:text-purple-500">Split</span>
          </h1>
          <p className="text-sm text-purple-400 dark:text-purple-500 mt-2">
            Shared expenses, zero disputes.
          </p>
        </div>

        <div className="bg-white dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-2xl p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-purple-900 dark:text-purple-100 mb-6">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>

          <FormField label="Email">
            <Input type="email" placeholder="you@example.com" />
          </FormField>

          {mode === 'register' && (
            <FormField label="Full Name">
              <Input type="text" placeholder="Your full name" />
            </FormField>
          )}

          <FormField label="Password">
            <Input type="password" placeholder="••••••••" />
          </FormField>

          <Button className="w-full mt-4" size="lg" onClick={() => navigate('/dashboard')}>
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>

          <div className="border-t border-purple-100 dark:border-purple-800 mt-6 pt-5 text-center text-sm text-purple-400">
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
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
