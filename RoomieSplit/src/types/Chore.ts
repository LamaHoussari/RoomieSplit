export interface Chore {
  id: string;
  group_id: string;
  name: string;
  icon: string | null;
  frequency: string;
  assigned_to: string | null;
  created_by: string;
  is_completed: boolean;
  created_at: string;
  archived_at?: string | null;
  profiles?: { name: string };
}

export interface NewChore {
  group_id: string;
  name: string;
  icon?: string | null;
  frequency: string;
  assigned_to: string | null;
  created_by: string;
}
