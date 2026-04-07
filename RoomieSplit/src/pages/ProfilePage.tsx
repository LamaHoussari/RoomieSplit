import { useEffect, useState } from 'react';
import type { AppUser } from '../types/auth';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';
import { signInWithEmail, updateUserPassword } from '../services/authService';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabaseClient';
import { Skeleton } from '../components/Skeleton';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'PayPal', 'Venmo', 'Zelle', 'Other'] as const;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 5) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 8)}`;
}

function isValidPhone(value: string): boolean {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return digits.length === 8;
}

export default function ProfilePage({ user }: { user: AppUser }) {
  const { profile, loading: profileLoading, avatarUrl } = useProfile(user.id);
  const initialState = {
    name: user.name || '',
    email: user.email || '',
    nickname: '',
    phone: '',
    paymentMethod: '' as string,
  };
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialState);
  const [saved, setSaved] = useState(initialState);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (!profile) return;
    const loaded = {
      name: profile.name || '',
      email: profile.email || '',
      nickname: profile.nickname || '',
      phone: profile.phone || '',
      paymentMethod: profile.payment_method || '',
    };
    setDraft(loaded);
    setSaved(loaded);
  }, [profile]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!pwSuccess) return;
    const id = setTimeout(() => setPwSuccess(''), 4000);
    return () => clearTimeout(id);
  }, [pwSuccess]);

  useEffect(() => {
    if (!pwError) return;
    const id = setTimeout(() => setPwError(''), 5000);
    return () => clearTimeout(id);
  }, [pwError]);

  const isDirty =
    draft.name !== saved.name ||
    draft.email !== saved.email ||
    draft.nickname !== saved.nickname ||
    draft.phone !== saved.phone ||
    draft.paymentMethod !== saved.paymentMethod;

  const initials = (draft.name || user.email || '?')
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage personal details, payment preferences, and account security."
      />

      {profileLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2 rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 !rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78">
            <Skeleton className="mb-4 h-5 w-28" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200/80 bg-white/82 p-6 shadow-[0_18px_48px_-32px_rgba(28,25,23,0.45)] dark:border-slate-800/70 dark:bg-slate-900/78">
            <Skeleton className="mb-4 h-5 w-20" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Avatar + Display Name */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={draft.name || 'Avatar'}
                className="h-20 w-20 flex-shrink-0 rounded-full object-cover shadow"
              />
            ) : (
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border border-[#ddd0e9] bg-[#6f4f8b] text-2xl font-bold text-white shadow dark:border-[#4a375e] dark:bg-[#7e62a0]">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-stone-900 dark:text-slate-100">
                {draft.name || 'No name set'}
              </h2>
              <p className="truncate text-sm text-stone-500 dark:text-slate-400">
                {user.email}
              </p>
              {draft.nickname && (
                <p className="mt-0.5 truncate text-sm italic text-stone-400 dark:text-slate-500">
                  "{draft.nickname}"
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card
          title="Account Info"
          className={isEditing ? 'ring-2 ring-[#8c74aa]/20 dark:ring-[#b59ad6]/20' : ''}
        >
          <FormField label="Display Name">
            <Input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              readOnly={!isEditing}
              className={!isEditing ? 'cursor-default bg-stone-100 dark:bg-slate-800/70' : ''}
            />
          </FormField>
          <FormField label="Preferred Nickname">
            <Input
              value={draft.nickname}
              onChange={e => setDraft(d => ({ ...d, nickname: e.target.value }))}
              placeholder="How your roomies call you"
              readOnly={!isEditing}
              className={!isEditing ? 'cursor-default bg-stone-100 dark:bg-slate-800/70' : ''}
            />
          </FormField>
          <FormField label="Email">
            <Input
              value={draft.email}
              onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
              type="email"
              readOnly={!isEditing}
              className={!isEditing ? 'cursor-default bg-stone-100 dark:bg-slate-800/70' : ''}
            />
          </FormField>
          <FormField label="Phone Number (optional)">
            <Input
              value={draft.phone}
              onChange={e => {
                const formatted = formatPhone(e.target.value);
                setDraft(d => ({ ...d, phone: formatted }));
                if (phoneError) setPhoneError('');
              }}
              onBlur={() => {
                if (draft.phone && !isValidPhone(draft.phone)) {
                  setPhoneError('Enter a valid 8-digit phone number.');
                } else {
                  setPhoneError('');
                }
              }}
              type="tel"
              placeholder="(05) 123-4567"
              readOnly={!isEditing}
              className={`${!isEditing ? 'cursor-default bg-stone-100 dark:bg-slate-800/70' : ''} ${phoneError ? 'border-red-400 dark:border-red-500' : ''}`}
            />
            {phoneError && (
              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{phoneError}</p>
            )}
          </FormField>
          <FormField label="Preferred Payment Method">
            {isEditing ? (
              <select
                value={draft.paymentMethod}
                onChange={e => setDraft(d => ({ ...d, paymentMethod: e.target.value }))}
                className="w-full rounded-xl border border-stone-300/80 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition focus:border-[#8c74aa] focus:ring-2 focus:ring-[#8c74aa]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:focus:border-[#b59ad6] dark:focus:ring-[#b59ad6]/20"
              >
                <option value="">Select a method</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <Input
                value={draft.paymentMethod || 'Not set'}
                readOnly
                className="cursor-default bg-stone-100 dark:bg-slate-800/70"
              />
            )}
          </FormField>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500 dark:text-slate-400">
              {isEditing ? 'Editing enabled' : 'Click edit to update your info.'}
            </span>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(saved);
                    setPhoneError('');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!isDirty || (!!draft.phone && !isValidPhone(draft.phone))}
                  onClick={async () => {
                    if (draft.phone && !isValidPhone(draft.phone)) {
                      setPhoneError('Enter a valid 8-digit phone number.');
                      return;
                    }
                    setPhoneError('');
                    await supabase.from('profiles').update({
                      name: draft.name,
                      nickname: draft.nickname || null,
                      phone: draft.phone || null,
                      payment_method: draft.paymentMethod || null,
                    }).eq('id', user.id);
                    setSaved(draft);
                    setIsEditing(false);
                  }}
                >
                  Save changes
                </Button>
              </div>
            )}
          </div>
        </Card>

        <Card title="Security">
          <form onSubmit={async e => {
            e.preventDefault();
            setPwError('');
            setPwSuccess('');

            if (!currentPassword || !newPassword || !confirmPassword) {
              setPwError('All password fields are required.');
              return;
            }
            if (newPassword.length < 6) {
              setPwError('New password must be at least 6 characters.');
              return;
            }
            if (newPassword !== confirmPassword) {
              setPwError('New passwords do not match.');
              return;
            }
            if (currentPassword === newPassword) {
              setPwError('New password must be different from current password.');
              return;
            }

            setPwLoading(true);
            const { error: signInErr } = await signInWithEmail(user.email!, currentPassword);
            if (signInErr) {
              setPwError('Current password is incorrect.');
              setPwLoading(false);
              return;
            }

            const { error: updateErr } = await updateUserPassword(newPassword);
            if (updateErr) {
              setPwError(updateErr.message);
              setPwLoading(false);
              return;
            }

            setPwSuccess('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPwLoading(false);
          }}>
          <FormField label="Current password">
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Current password"
                className="pr-10"
                value={currentPassword}
                onChange={e => { setCurrentPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-slate-200"
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0 0 13.52 13.52M6.35 6.35C4.234 7.856 2.755 9.88 2.18 12c1.058 3.9 4.835 6.75 9.82 6.75a11.1 11.1 0 0 0 5.647-1.534M9.88 4.44A11.1 11.1 0 0 1 12 4.25c4.985 0 8.762 2.85 9.82 6.75-.44 1.623-1.378 3.082-2.666 4.238" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </FormField>

          <FormField label="New Password">
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="New password"
                className="pr-10"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-stone-400 transition-colors hover:text-stone-700 dark:hover:text-slate-200"
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.477 10.477A3 3 0 0 0 13.52 13.52M6.35 6.35C4.234 7.856 2.755 9.88 2.18 12c1.058 3.9 4.835 6.75 9.82 6.75a11.1 11.1 0 0 0 5.647-1.534M9.88 4.44A11.1 11.1 0 0 1 12 4.25c4.985 0 8.762 2.85 9.82 6.75-.44 1.623-1.378 3.082-2.666 4.238" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm New Password">
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
            />
          </FormField>

          {pwError && (
            <p className="mt-2 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-2.5 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300">
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="mt-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
              {pwSuccess}
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={pwLoading}
            type="submit"
          >
            {pwLoading ? 'Updating...' : 'Update password'}
          </Button>
          </form>
        </Card>
      </div>
      )}
    </>
  );
}
