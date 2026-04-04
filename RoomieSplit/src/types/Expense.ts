export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  payer_id: string;
  created_by: string;
  date: string;
  is_paid: boolean;
  created_at: string;
  archived_at?: string | null;
  profiles?: { name: string };
  expense_splits?: ExpenseSplit[];
}

export interface NewExpense {
  group_id: string;
  description: string;
  amount: number;
  payer_id: string;
  created_by: string;
  date: string;
  is_paid?: boolean;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number | null;
  profiles?: { name: string };
}

export interface NewExpenseSplit {
  expense_id?: string;
  user_id: string;
  share_amount?: number | null;
}
