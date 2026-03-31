export interface Chore {
  id: number;
  group_id: number;
  name: string;
  icon: string;
  frequency: string;
  assigned_to: string;
  is_completed: boolean;
  created_at: string;
  profiles?: { name: string };
}

export interface NewChore {
  group_id: number;
  name: string;
  icon?: string;
  frequency: string;
  assigned_to: string;
}
