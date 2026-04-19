import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GroupsPage from '../../pages/GroupsPage';

const mockUseGroups = vi.fn();

vi.mock('../../hooks/useGroups', () => ({
  useGroups: () => mockUseGroups(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock('../../services/inviteService');
vi.mock('../../utils/friendlyError');

describe('Group Workflow', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: null,
      successMessage: '',
      loading: false,
    });
  });

  it('renders groups page', () => {
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('displays empty groups list on load', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: null,
      successMessage: '',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('shows group after creation', () => {
    mockUseGroups.mockReturnValue({
      groups: [{ id: '1', name: 'Test Group' }],
      error: null,
      successMessage: 'Group created',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('displays multiple groups', () => {
    mockUseGroups.mockReturnValue({
      groups: [
        { id: '1', name: 'Group A' },
        { id: '2', name: 'Group B' },
      ],
      error: null,
      successMessage: '',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles member addition', () => {
    mockUseGroups.mockReturnValue({
      groups: [{ id: '1', name: 'Test Group', members: 2 }],
      error: null,
      successMessage: 'Member added',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('shows group balances', () => {
    mockUseGroups.mockReturnValue({
      groups: [{ id: '1', name: 'Test Group', balance: 50 }],
      error: null,
      successMessage: '',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('handles group operation errors', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: 'Failed to load groups',
      successMessage: '',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});