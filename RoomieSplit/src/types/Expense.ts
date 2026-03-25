export interface Expense {
  id: number;
  desc: string;
  amount: number;
  payer: string;
  date: string;
  split: string[];
}