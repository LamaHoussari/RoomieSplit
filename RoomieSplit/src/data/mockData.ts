import type { GroupMember } from "../types/Member"
import type { Expense } from "../types/Expense"
import type { Group } from "../types/Group"
import type { Chore } from '../types/Chore'
import type { Settlement } from '../types/Setelment'
import type { Profile } from '../types/Profile'

// Fake UUIDs for mock profiles
const RAND_ID  = "a1b2c3d4-0001-4000-8000-000000000001";
const REEM_ID  = "a1b2c3d4-0002-4000-8000-000000000002";
const LAMA_ID  = "a1b2c3d4-0003-4000-8000-000000000003";

export const MOCK_PROFILES: Profile[] = [
  { id: RAND_ID, name: "Rand",  email: "rand@example.com",  avatar_url: null, created_at: "2026-01-01" },
  { id: REEM_ID, name: "Reem",  email: "reem@example.com",  avatar_url: null, created_at: "2026-01-01" },
  { id: LAMA_ID, name: "Lama",  email: "lama@example.com",  avatar_url: null, created_at: "2026-01-01" },
];

export function profileName(userId: string): string {
  return MOCK_PROFILES.find((p) => p.id === userId)?.name ?? "Unknown";
}

export function computeBalance(userId: string): number {
  let balance = 0;
  for (const e of MOCK_EXPENSES) {
    if (e.payer_id === userId) balance += e.amount;
    const mySplit = e.expense_splits?.find(s => s.user_id === userId);
    if (mySplit?.share_amount) balance -= mySplit.share_amount;
  }
  for (const s of MOCK_SETTLEMENTS) {
    if (s.from_user_id === userId) balance += s.paid;
    if (s.to_user_id === userId) balance -= s.paid;
  }
  return balance;
}

export const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Hamra Flat',   code: 'FLAT-4KX2', created_by: RAND_ID, created_at: '2026-01-15' },
  { id: 2, name: 'Summer Dorms', code: 'DORM-9YZ1', created_by: RAND_ID, created_at: '2026-02-10' },
];

export const MOCK_MEMBERS: GroupMember[] = [
  { id: 1, group_id: 1, user_id: RAND_ID, role: 'admin',  color_class: 'bg-purple-500/20 text-purple-400',  joined_at: '2026-01-15', profiles: { name: 'Rand',  email: 'rand@example.com' } },
  { id: 2, group_id: 1, user_id: REEM_ID, role: 'member', color_class: 'bg-violet-500/20 text-violet-400',  joined_at: '2026-01-16', profiles: { name: 'Reem',  email: 'reem@example.com' } },
  { id: 3, group_id: 1, user_id: LAMA_ID, role: 'member', color_class: 'bg-fuchsia-500/20 text-fuchsia-400', joined_at: '2026-01-16', profiles: { name: 'Lama',  email: 'lama@example.com' } },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 1, group_id: 1, description: 'Rent - April',  amount: 1500, payer_id: RAND_ID, date: '2026-04-01', is_paid: false, created_at: '2026-04-01',
    profiles: { name: 'Rand' },
    expense_splits: [
      { id: 1, expense_id: 1, user_id: RAND_ID, share_amount: 500, profiles: { name: 'Rand' } },
      { id: 2, expense_id: 1, user_id: REEM_ID, share_amount: 500, profiles: { name: 'Reem' } },
      { id: 3, expense_id: 1, user_id: LAMA_ID, share_amount: 500, profiles: { name: 'Lama' } },
    ],
  },
  { id: 2, group_id: 1, description: 'Electric bill', amount: 90,  payer_id: REEM_ID, date: '2026-03-28', is_paid: true, created_at: '2026-03-28',
    profiles: { name: 'Reem' },
    expense_splits: [
      { id: 4, expense_id: 2, user_id: RAND_ID, share_amount: 30, profiles: { name: 'Rand' } },
      { id: 5, expense_id: 2, user_id: REEM_ID, share_amount: 30, profiles: { name: 'Reem' } },
      { id: 6, expense_id: 2, user_id: LAMA_ID, share_amount: 30, profiles: { name: 'Lama' } },
    ],
  },
  { id: 3, group_id: 1, description: 'Groceries run', amount: 55,  payer_id: LAMA_ID, date: '2026-03-25', is_paid: false, created_at: '2026-03-25',
    profiles: { name: 'Lama' },
    expense_splits: [
      { id: 7, expense_id: 3, user_id: REEM_ID, share_amount: 27.5, profiles: { name: 'Reem' } },
      { id: 8, expense_id: 3, user_id: LAMA_ID, share_amount: 27.5, profiles: { name: 'Lama' } },
    ],
  },
  { id: 4, group_id: 1, description: 'Internet',      amount: 60,  payer_id: RAND_ID, date: '2026-03-20', is_paid: false, created_at: '2026-03-20',
    profiles: { name: 'Rand' },
    expense_splits: [
      { id: 9,  expense_id: 4, user_id: RAND_ID, share_amount: 20, profiles: { name: 'Rand' } },
      { id: 10, expense_id: 4, user_id: REEM_ID, share_amount: 20, profiles: { name: 'Reem' } },
      { id: 11, expense_id: 4, user_id: LAMA_ID, share_amount: 20, profiles: { name: 'Lama' } },
    ],
  },
];

export const MOCK_CHORES: Chore[] = [
  { id: 1, group_id: 1, icon: '', name: 'Vacuum living room', frequency: 'Weekly',    assigned_to: RAND_ID, is_completed: true,  created_at: '2026-01-20', profiles: { name: 'Rand' } },
  { id: 2, group_id: 1, icon: '', name: 'Do laundry',         frequency: 'Weekly',    assigned_to: REEM_ID, is_completed: false, created_at: '2026-01-20', profiles: { name: 'Reem' } },
  { id: 3, group_id: 1, icon: '', name: 'Wash dishes',        frequency: 'Daily',     assigned_to: LAMA_ID, is_completed: false, created_at: '2026-01-20', profiles: { name: 'Lama' } },
  { id: 4, group_id: 1, icon: '', name: 'Groceries run',      frequency: 'Bi-weekly', assigned_to: RAND_ID, is_completed: false, created_at: '2026-01-20', profiles: { name: 'Rand' } },
  { id: 5, group_id: 1, icon: '', name: 'Feed the cat',       frequency: 'Daily',     assigned_to: REEM_ID, is_completed: false, created_at: '2026-01-20', profiles: { name: 'Reem' } },
];

export const MOCK_SETTLEMENTS: Settlement[] = [
  { id: 1, group_id: 1, from_user_id: REEM_ID, to_user_id: RAND_ID, amount: 120, paid: 0, created_at: '2026-03-30',
    from_profile: { name: 'Reem' }, to_profile: { name: 'Rand' } },
  { id: 2, group_id: 1, from_user_id: LAMA_ID, to_user_id: RAND_ID, amount: 115, paid: 0, created_at: '2026-03-30',
    from_profile: { name: 'Lama' }, to_profile: { name: 'Rand' } },
];