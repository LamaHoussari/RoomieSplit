import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField, { Input } from '../components/FormField';

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Account Info">
          <FormField label="Full Name">
            <Input defaultValue="Rand Al Yaman" />
          </FormField>
          <FormField label="Email">
            <Input defaultValue="rand@example.com" type="email" />
          </FormField>
          <Button size="sm" className="mt-4">Save changes</Button>
        </Card>

        <Card title="Security">
          <FormField label="Current password">
            <Input type="password" placeholder="••••••••" />
          </FormField>
          <FormField label="New password">
            <Input type="password" placeholder="••••••••" />
          </FormField>
          <Button variant="outline" size="sm" className="mt-4">Update password</Button>

          <div className="border-t border-purple-100 dark:border-purple-800/60 mt-6 pt-5">
            <Button variant="danger" size="sm" onClick={() => navigate('/login')}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
