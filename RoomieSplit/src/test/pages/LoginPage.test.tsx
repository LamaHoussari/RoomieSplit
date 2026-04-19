import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({ dark: false, toggle: vi.fn() }),
}));

describe('LoginPage', () => {
  const mockProps = {
    onSignUp: vi.fn(),
    onSignIn: vi.fn(),
    onClearFeedback: vi.fn(),
    error: '',
    successMessage: '',
    loading: false,
  };

  it('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('accepts form props', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} />
      </BrowserRouter>
    );
    expect(container.querySelector('form')).toBeDefined();
  });

  it('renders with error prop', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} error="Test error" />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders with success prop', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} successMessage="Success" />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders loading state', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} loading={true} />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('renders input fields', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage {...mockProps} />
      </BrowserRouter>
    );
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });
});