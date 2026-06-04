import type { Form } from '@retrofit-ui/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormRenderer } from '../FormRenderer';

const form: Form = {
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
  metadata: { title: 'Registration', submitLabel: 'Register' },
};

describe('FormRenderer', () => {
  it('renders all field labels', () => {
    render(<FormRenderer form={form} />);
    expect(screen.getByText(/Name/)).toBeDefined();
    expect(screen.getByText(/Email/)).toBeDefined();
    expect(screen.getByText(/Role/)).toBeDefined();
  });

  it('renders the submit button with custom label', () => {
    render(<FormRenderer form={form} />);
    expect(screen.getByRole('button', { name: 'Register' })).toBeDefined();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<FormRenderer form={form} />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn();
    render(<FormRenderer form={form} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });
});
