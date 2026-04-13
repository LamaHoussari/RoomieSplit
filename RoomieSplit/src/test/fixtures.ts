/**
 * Shared test fixtures for RoomieSplit domain objects.
 */
import type { AppUser } from "../types/auth";
import type { Group } from "../types/Group";
import type { GroupMember } from "../types/Member";
import type { Expense, ExpenseSplit } from "../types/Expense";
import type { Settlement } from "../types/Settlement";
import type { Chore } from "../types/Chore";
import type { Profile } from "../types/Profile";

export const TEST_USER_ID = "user-001";
export const TEST_USER_ID_2 = "user-002";
export const TEST_GROUP_ID = "group-001";

export const mockUser: AppUser = {
  id: TEST_USER_ID,
  email: "alice@example.com",
  name: "alice",
  isAdmin: false,
};

export const mockAdminUser: AppUser = {
  id: "admin-001",
  email: "admin@example.com",
  name: "admin",
  isAdmin: true,
};

export const mockProfile: Profile = {
  id: TEST_USER_ID,
  name: "Alice",
  email: "alice@example.com",
  nickname: null,
  phone: null,
  payment_method: null,
  avatar_path: "user-001/avatar.svg",
  created_at: "2025-01-01T00:00:00Z",
};

export const mockGroup: Group = {
  id: TEST_GROUP_ID,
  name: "Test Apartment",
  code: "APT123",
  created_by: TEST_USER_ID,
  created_at: "2025-01-01T00:00:00Z",
  description: "Our apartment expenses",
  currency: "USD",
};

export const mockGroups: Group[] = [
  mockGroup,
  {
    id: "group-002",
    name: "Vacation Group",
    code: "VAC456",
    created_by: TEST_USER_ID,
    created_at: "2025-02-01T00:00:00Z",
    description: null,
    currency: "EUR",
  },
];

export const mockMember1: GroupMember = {
  id: "member-001",
  group_id: TEST_GROUP_ID,
  user_id: TEST_USER_ID,
  role: "admin",
  color_class: null,
  nickname: null,
  joined_at: "2025-01-01T00:00:00Z",
  profiles: {
    name: "Alice",
    email: "alice@example.com",
  },
};

export const mockMember2: GroupMember = {
  id: "member-002",
  group_id: TEST_GROUP_ID,
  user_id: TEST_USER_ID_2,
  role: "member",
  color_class: null,
  nickname: "Bob",
  joined_at: "2025-01-02T00:00:00Z",
  profiles: {
    name: "Bob",
    email: "bob@example.com",
  },
};

export const mockMembers: GroupMember[] = [mockMember1, mockMember2];

export const mockExpenseSplits: ExpenseSplit[] = [
  {
    id: "split-001",
    expense_id: "expense-001",
    user_id: TEST_USER_ID,
    share_amount: 25,
    profiles: { name: "Alice" },
  },
  {
    id: "split-002",
    expense_id: "expense-001",
    user_id: TEST_USER_ID_2,
    share_amount: 25,
    profiles: { name: "Bob" },
  },
];

export const mockExpense: Expense = {
  id: "expense-001",
  group_id: TEST_GROUP_ID,
  description: "Groceries",
  amount: 50,
  payer_id: TEST_USER_ID,
  created_by: TEST_USER_ID,
  date: "2025-03-15",
  is_paid: true,
  created_at: "2025-03-15T10:00:00Z",
  archived_at: null,
  profiles: { name: "Alice" },
  expense_splits: mockExpenseSplits,
};

export const mockExpenses: Expense[] = [
  mockExpense,
  {
    id: "expense-002",
    group_id: TEST_GROUP_ID,
    description: "Utilities",
    amount: 100,
    payer_id: TEST_USER_ID_2,
    created_by: TEST_USER_ID_2,
    date: "2025-03-16",
    is_paid: false,
    created_at: "2025-03-16T12:00:00Z",
    archived_at: null,
    profiles: { name: "Bob" },
    expense_splits: [],
  },
];

export const mockSettlement: Settlement = {
  id: "settlement-001",
  group_id: TEST_GROUP_ID,
  from_user_id: TEST_USER_ID_2,
  to_user_id: TEST_USER_ID,
  amount: 25,
  paid: 0,
  created_by: TEST_USER_ID,
  created_at: "2025-03-15T10:05:00Z",
  expense_id: "expense-001",
  archived_at: null,
  from_profile: { name: "Bob" },
  to_profile: { name: "Alice" },
};

export const mockSettlements: Settlement[] = [
  mockSettlement,
  {
    id: "settlement-002",
    group_id: TEST_GROUP_ID,
    from_user_id: TEST_USER_ID,
    to_user_id: TEST_USER_ID_2,
    amount: 50,
    paid: 50,
    created_by: TEST_USER_ID_2,
    created_at: "2025-03-16T12:05:00Z",
    expense_id: "expense-002",
    archived_at: null,
    from_profile: { name: "Alice" },
    to_profile: { name: "Bob" },
  },
];

export const mockChore: Chore = {
  id: "chore-001",
  group_id: TEST_GROUP_ID,
  name: "Take out trash",
  icon: "🗑️",
  frequency: "weekly",
  assigned_to: TEST_USER_ID,
  created_by: TEST_USER_ID,
  is_completed: false,
  created_at: "2025-03-01T00:00:00Z",
  archived_at: null,
};

export const mockChores: Chore[] = [
  mockChore,
  {
    id: "chore-002",
    group_id: TEST_GROUP_ID,
    name: "Wash dishes",
    icon: "🍽️",
    frequency: "daily",
    assigned_to: TEST_USER_ID_2,
    created_by: TEST_USER_ID,
    is_completed: true,
    created_at: "2025-03-01T00:00:00Z",
    archived_at: null,
  },
];
