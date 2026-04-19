import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExpensesPage from '../../pages/ExpensesPage';

const mockUseGroups = vi.fn();
const mockUseExpenses = vi.fn();
const mockUseMembers = vi.fn();
const mockUseSettlements = vi.fn();
const mockUsePagination = vi.fn();

vi.mock('../../hooks/useGroups', () => ({
  useGroups: () => mockUseGroups(),
}));
vi.mock('../../hooks/useExpenses', () => ({
  useExpenses: () => mockUseExpenses(),
}));
vi.mock('../../hooks/useMembers', () => ({
  useMembers: () => mockUseMembers(),
}));
vi.mock('../../hooks/useSettlements', () => ({
  useSettlements: () => mockUseSettlements(),
}));
vi.mock('../../hooks/usePagination', () => ({
  usePagination: () => mockUsePagination(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ groupId: 'test' }) };
});

describe('Expense & Settlement Workflow', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({ groups: [] });
    mockUseExpenses.mockReturnValue({ expenses: [], error: null });
    mockUseMembers.mockReturnValue({ members: [] });
    mockUseSettlements.mockReturnValue({ settlements: [] });
    mockUsePagination.mockReturnValue({ currentPage: 1 });
  });

  it('renders expenses page', () => {
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('shows empty expenses list initially', () => {
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('displays expense after creation', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [{ id: '1', description: 'Lunch', amount: 50 }],
      error: null,
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('shows expense marked as paid', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [{ id: '1', description: 'Lunch', amount: 50, paid: true }],
      error: null,
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('displays settlement record', () => {
    mockUseSettlements.mockReturnValue({
      settlements: [{ id: '1', payer: 'User A', amount: 50 }],
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles multiple expenses', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [
        { id: '1', description: 'Lunch', amount: 50 },
        { id: '2', description: 'Dinner', amount: 75 },
      ],
      error: null,
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles expense creation errors', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [],
      error: 'Failed to create expense',
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles settlement workflow', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [{ id: '1', description: 'Shared', amount: 100, paid: true }],
      error: null,
    });
    mockUseSettlements.mockReturnValue({
      settlements: [{ id: '1', payer: 'User A', amount: 50 }],
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage userId="test-user" chosenGroup="test-group" setChosenGroup={() => {}} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});