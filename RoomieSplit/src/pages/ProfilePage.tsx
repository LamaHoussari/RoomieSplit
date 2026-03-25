import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';

interface Profile {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: 'Rand Al Yaman', email: 'rand@example.com' });
  const [draft, setDraft] = useState<Profile>(profile);
  const [isEditing, setIsEditing] = useState(false);

  const isDirty = draft.name !== profile.name || draft.email !== profile.email;

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Account Info"
          className={isEditing ? 'ring-2 ring-purple-400/25 dark:ring-purple-400/20' : ''}
        >
          <FormField label="Full Name">
            <Input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              readOnly={!isEditing}
              className={!isEditing ? 'cursor-default bg-purple-50/70 dark:bg-purple-950/40' : ''}
            />
          </FormField>
          <FormField label="Email">
            <Input
              value={draft.email}
              onChange={e => setDraft(d => ({ ...d, email: e.target.value }))}
              type="email"
              readOnly={!isEditing}
              className={!isEditing ? 'cursor-default bg-purple-50/70 dark:bg-purple-950/40' : ''}
            />
          </FormField>

          <div className="flex items-center justify-between gap-3 mt-5">
            <span className="text-sm text-purple-600/70 dark:text-purple-300/70">
              {isEditing ? 'Editing enabled' : 'Click edit to update your info.'}
            </span>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraft(profile);
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
                    setDraft(profile);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!isDirty}
                  onClick={() => {
                    setProfile(draft);
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
            <Input type="password" placeholder="••••••••" />
          </FormField>
          <FormField label="New password">
            <Input type="password" placeholder="••••••••" />
          </FormField>
          <Button variant="outline" size="sm" className="mt-2">
            Update password
          </Button>
        </Card>
      </div>
    </>
  );
}
