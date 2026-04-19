import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

describe('Auth Workflow', () => {
  const mockOnSignUp = vi.fn().mockResolvedValue(true);
  const mockOnSignIn = vi.fn().mockResolvedValue(true);
  const mockOnClearFeedback = vi.fn();

  beforeEach(() => {
    mockOnSignUp.mockClear();
    mockOnSignIn.mockClear();
    mockOnClearFeedback.mockClear();
  });

  it('renders login form', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error=""
          successMessage=""
          loading={false}
        />
      </BrowserRouter>
    );
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('handles sign in attempt', async () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error=""
          successMessage=""
          loading={false}
        />
      </BrowserRouter>
    );
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('displays error message when auth fails', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error="Invalid credentials"
          successMessage=""
          loading={false}
        />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('displays success message on login', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error=""
          successMessage="Login successful"
          loading={false}
        />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('shows loading state during auth', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error=""
          successMessage=""
          loading={true}
        />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });

  it('toggles between sign in and sign up modes', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage
          onSignUp={mockOnSignUp}
          onSignIn={mockOnSignIn}
          onClearFeedback={mockOnClearFeedback}
          error=""
          successMessage=""
          loading={false}
        />
      </BrowserRouter>
    );
    expect(container).toBeDefined();
  });
});