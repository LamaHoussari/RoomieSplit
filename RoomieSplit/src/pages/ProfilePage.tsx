import { useState } from 'react';
import type { AppUser } from '../types/auth';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';

export default function ProfilePage({ user }: { user: AppUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: user.name || '',
    email: user.email || '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const isDirty = draft.name !== (user.name || '') || draft.email !== (user.email || '');

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Account Info"
          className={isEditing ? 'ring-2 ring-[#8c74aa]/20 dark:ring-[#b59ad6]/20' : ''}
        >
          <FormField label="Full Name">
            <Input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
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

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-sm text-stone-500 dark:text-slate-400">
              {isEditing ? 'Editing enabled' : 'Click edit to update your info.'}
            </span>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft({ name: user.name || '', email: user.email || '' });
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
                    setDraft({ name: user.name || '', email: user.email || '' });
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!isDirty}
                  onClick={() => {
                    setDraft({ name: user.name || '', email: user.email || '' });
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
          <FormField label="Current password">
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} placeholder="Current password" className="pr-10" />
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
              <Input type={showNew ? 'text' : 'password'} placeholder="New password" className="pr-10" />
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
          <Button variant="outline" size="sm" className="mt-2">
            Update password
          </Button>
        </Card>
      </div>
    </>
  );
}
