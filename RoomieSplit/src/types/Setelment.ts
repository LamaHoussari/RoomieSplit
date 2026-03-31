export interface Settlement {
  id: number;
  group_id: number;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  paid: number;
  created_at: string;
  from_profile?: { name: string };
  to_profile?: { name: string };
}

export interface NewSettlement {
  group_id: number;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  paid?: number;
}