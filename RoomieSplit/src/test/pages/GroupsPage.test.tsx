import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GroupsPage from '../../pages/GroupsPage';

const mockUseGroups = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('../../hooks/useGroups', () => ({
  useGroups: () => mockUseGroups(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockUseNavigate };
}); vi.mock('../../services/inviteService');
vi.mock('../../utils/friendlyError');

describe('GroupsPage', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: null,
      successMessage: '',
      loading: false,
    });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders as container element', () => {
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('handles empty groups list', () => {
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

  it('renders with groups data', () => {
    mockUseGroups.mockReturnValue({
      groups: [{ id: '1', name: 'Test Group' }],
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

  it('renders with error state', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: 'Test error',
      successMessage: '',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders with success state', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      error: null,
      successMessage: 'Success message',
    });
    const { container } = render(
      <BrowserRouter>
        <GroupsPage />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});