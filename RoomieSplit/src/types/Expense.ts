export interface Expense {
  id: number;
  group_id: number;
  description: string;
  amount: number;
  payer_id: string;
  date: string;
  is_paid: boolean;
  created_at: string;
  profiles?: { name: string };
  expense_splits?: ExpenseSplit[];
}

export interface NewExpense {
  group_id: number;
  description: string;
  amount: number;
  payer_id: string;
  date: string;
  is_paid?: boolean;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id: string;
  share_amount: number | null;
  profiles?: { name: string };
}

export interface NewExpenseSplit {
  expense_id: number;
  user_id: string;
  share_amount?: number | null;
}