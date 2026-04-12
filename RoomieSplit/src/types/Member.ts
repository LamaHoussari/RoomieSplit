export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  color_class: string | null;
  nickname?: string | null;
  joined_at: string;
  profiles?: {
    name: string;
    email: string | null;
    phone?: string | null;
    payment_method?: string | null;
  };
}

export interface NewGroupMember {
  group_id: string;
  user_id: string;
  role?: string;
  color_class?: string | null;
  nickname?: string | null;
}