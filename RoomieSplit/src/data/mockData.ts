import type { Member} from "../types/Member"
import type {Expense} from "../types/Expense"
import type {Group} from "../types/Group" 
import type {Chore} from '../types/Chore'
import type {Setelment} from '../types/Setelment'

export const MOCK_MEMBERS: Member[] = [
  { name: 'Rand',  initials: 'RA', colorClass: 'bg-purple-500/20 text-purple-400', balance: +235 },
  { name: 'Reem',  initials: 'RE', colorClass: 'bg-violet-500/20 text-violet-400', balance: -120 },
  { name: 'Lama',  initials: 'LA', colorClass: 'bg-fuchsia-500/20 text-fuchsia-400', balance: -115 },
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 1, desc: 'Rent - April',  amount: 1500, payer: 'Rand', date: '2026-04-01', split: ['Rand', 'Reem', 'Lama'] },
  { id: 2, desc: 'Electric bill', amount: 90,   payer: 'Reem', date: '2026-03-28', split: ['Rand', 'Reem', 'Lama'] },
  { id: 3, desc: 'Groceries run', amount: 55,   payer: 'Lama', date: '2026-03-25', split: ['Reem', 'Lama'] },
  { id: 4, desc: 'Internet',      amount: 60,   payer: 'Rand', date: '2026-03-20', split: ['Rand', 'Reem', 'Lama'] },
];

export const MOCK_GROUPS: Group[] = [
  { id: 1, name: 'Hamra Flat',   members: 3, total: 1705, created: 'Jan 2026', code: 'FLAT-4KX2' },
  { id: 2, name: 'Summer Dorms', members: 2, total: 340,  created: 'Feb 2026', code: 'DORM-9YZ1' },
];

export const MOCK_CHORES: Chore[] = [
  { icon: '', name: 'Vacuum living room', freq: 'Weekly',    assigned: 'Rand' },
  { icon: '', name: 'Do laundry',         freq: 'Weekly',    assigned: 'Reem' },
  { icon: '', name: 'Wash dishes',         freq: 'Daily',     assigned: 'Lama' },
  { icon: '', name: 'Groceries run',       freq: 'Bi-weekly', assigned: 'Rand' },
  { icon: '', name: 'Feed the cat',        freq: 'Daily',     assigned: 'Reem' },
];

export const MOCK_SETELEMENTS: Setelment[] = [
  { id: 1, from: 'Reem', to: 'Rand', amount: 120, paid: 0 },
  { id: 2, from: 'Lama', to: 'Rand', amount: 115, paid: 0 },
];