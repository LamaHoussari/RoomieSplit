export interface Member {
  name: string;
  initials: string;
  colorClass: string;
  balance: number;
}

export interface Expense {
  id: number;
  desc: string;
  amount: number;
  payer: string;
  date: string;
  split: string[];
}

export interface Group {
  id: number;
  name: string;
  members: number;
  total: number;
  created: string;
  code: string;
}

export interface Chore {
  icon: string;
  name: string;
  freq: string;
  assigned: string;
}
