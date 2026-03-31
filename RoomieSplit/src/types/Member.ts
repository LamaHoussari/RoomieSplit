export interface GroupMember {
  id: number;
  group_id: number;
  user_id: string;
  role: string;
  color_class: string;
  joined_at: string;
  profiles?: {
    name: string;
    email: string | null;
  };
}

export interface NewGroupMember {
  group_id: number;
  user_id: string;
  role?: string;
  color_class?: string;
}