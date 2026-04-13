import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';
import {
  getCurrentSession,
  signOutUser,
  subscribeToAuthChanges,
  updateUserPassword,
} from '../services/authService';
import { friendlyError } from '../lib/friendlyError';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    const applySessionState = (hasSession: boolean) => {
      if (!active) return;
      setSessionReady(hasSession);
      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = subscribeToAuthChanges((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY') {
        setError('');
        setSessionReady(Boolean(session?.user));
        setCheckingSession(false);
        return;
      }

      if (session?.user) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    const checkSession = async () => {
      const { data } = await getCurrentSession();

      if (data.session?.user) {
        applySessionState(true);
        return;
      }

      window.setTimeout(async () => {
        const { data: delayedData } = await getCurrentSession();
        applySessionState(Boolean(delayedData.session?.user));
      }, 300);
    };

    void checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sessionReady) {
      setError('Open this page from the password reset email.');
      return;
    }

    if (!password.trim()) {
      setError('New password is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    const { error: updateError } = await updateUserPassword(password);

    if (updateError) {
      setError(friendlyError(updateError.message));
      setLoading(false);
      return;
    }

    await signOutUser();
    setSuccessMessage('Password updated. Sign in with your new password.');
    setLoading(false);

    window.setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1200);
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a new password for your account using the recovery link from your email."
    >
      {checkingSession ? (
        <p className="rs-alert border-stone-200/80 bg-stone-50/80 text-stone-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
          Validating recovery link...
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <FormField label="New Password">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </FormField>

          <FormField label="Confirm Password">
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
            />
          </FormField>

          {!sessionReady && (
            <p className="mt-4 rs-alert rs-alert-warning">
              This reset link is missing or expired. Request a new password reset email.
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

          <Button type="submit" className="mt-4 w-full" size="lg" disabled={loading || !sessionReady}>
            Update password
          </Button>
        </form>
      )}

      <div className="mt-6 border-t border-stone-200/80 pt-5 text-center text-sm text-stone-500 dark:border-slate-800 dark:text-slate-400">
        Need a fresh link?{' '}
        <Link
          to="/forgot-password"
          className="font-semibold text-[#6f4f8b] hover:underline underline-offset-4 dark:text-[#d4c0ea]"
        >
          Request another reset email
        </Link>
      </div>
    </AuthShell>
  );
}
