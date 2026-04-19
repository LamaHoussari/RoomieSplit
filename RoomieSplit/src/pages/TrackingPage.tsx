import { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import TrackingCalendar from '../components/TrackingCalendar';
import { Select } from '../components/FormField';
import { useGroups } from '../hooks/useGroups';
import { useChores } from '../hooks/useChores';
import { useExpenses } from '../hooks/useExpenses';
import { useMembers } from '../hooks/useMembers';

interface TrackingPageProps {
  userId: string;
  chosenGroup: string;
  setChosenGroup: (id: string) => void;
}

export default function TrackingPage({ userId, chosenGroup, setChosenGroup }: TrackingPageProps) {
  const { groups } = useGroups(userId);
  const allGroupIds = useMemo(() => groups.map(g => g.id), [groups]);
  const groupId = chosenGroup || null;

  const { expenses, loading: expensesLoading } = useExpenses(groupId, allGroupIds);
  const { chores, loading: choresLoading } = useChores(groupId, allGroupIds);
  const { members } = useMembers(groupId, allGroupIds);

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Tracking"
        subtitle="Calendar view of recurring chores, payments, and scheduled expenses."
        filters={
          <div className="w-44">
            <Select value={chosenGroup} onChange={e => setChosenGroup(e.target.value)} className="py-2.5 text-sm">
              <option value="">All Groups</option>
              {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
            </Select>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <TrackingCalendar
          chores={chores}
          expenses={expenses}
          groups={groups}
          members={members}
          loading={expensesLoading || choresLoading}
          showGroupName={!groupId && groups.length > 1}
        />
      </Card>
    </>
  );
}
