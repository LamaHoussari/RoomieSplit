import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';
import { requestPasswordReset } from '../services/authService';
import { friendlyError } from '../lib/friendlyError';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(id);
  }, [error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError('Email is required.');
      setSuccessMessage('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const redirectTo = new URL('/reset-password', window.location.origin).toString();
    const { error: resetError } = await requestPasswordReset(normalizedEmail, redirectTo);

    if (resetError) {
      setError(friendlyError(resetError.message));
      setLoading(false);
      return;
    }

    setSuccessMessage('Password reset email sent. Check your inbox for the recovery link.');
    setLoading(false);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a password recovery link."
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Email">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={event => setEmail(event.target.value)}
          />
        </FormField>

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

        <Button type="submit" className="mt-4 w-full" size="lg" disabled={loading}>
          Send reset email
        </Button>
      </form>

      <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-sm text-stone-500 dark:border-slate-800 dark:text-slate-400">
        Remembered your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
        >
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

