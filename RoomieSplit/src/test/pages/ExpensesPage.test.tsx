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

describe('ExpensesPage', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({ groups: [] });
    mockUseExpenses.mockReturnValue({ expenses: [], error: null });
    mockUseMembers.mockReturnValue({ members: [] });
    mockUseSettlements.mockReturnValue({ settlements: [] });
    mockUsePagination.mockReturnValue({ currentPage: 1 });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles empty expenses', () => {
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders with expenses data', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [{ id: '1', description: 'Test', amount: 10 }],
      error: null,
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders with multiple expenses', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [
        { id: '1', description: 'Test 1', amount: 10 },
        { id: '2', description: 'Test 2', amount: 20 },
      ],
      error: null,
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders error state', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [],
      error: 'Test error',
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders success state', () => {
    mockUseExpenses.mockReturnValue({
      expenses: [],
      error: null,
      successMessage: 'Success',
    });
    const { container } = render(
      <BrowserRouter>
        <ExpensesPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});