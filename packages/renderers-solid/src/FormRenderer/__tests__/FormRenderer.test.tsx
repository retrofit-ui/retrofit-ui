import type { Form } from '@retrofit-ui/core';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import { FormRenderer } from '../FormRenderer';

const form: Form = {
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      readOnly: false,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      readOnly: false,
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: false,
      readOnly: false,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
  metadata: {
    title: 'Registration',
    submitLabel: 'Register',
    layout: 'single-column',
  },
};

describe('FormRenderer', () => {
  it('shows validation errors for empty required fields', async () => {
    render(() => <FormRenderer form={form} />);
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn();
    render(() => <FormRenderer form={form} onSubmit={onSubmit} />);
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

describe('FormRenderer – validation', () => {
  it('shows min length error when value is too short', async () => {
    const f: Form = {
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: false,
          readOnly: false,
          validation: { min: 5 },
        },
      ],
      metadata: { submitLabel: 'Save', layout: 'single-column' },
    };
    render(() => <FormRenderer form={f} />);
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Minimum length is 5');
  });

  it('shows max length error when value is too long', async () => {
    const f: Form = {
      fields: [
        {
          name: 'code',
          label: 'Code',
          type: 'text',
          required: false,
          readOnly: false,
          validation: { max: 3 },
        },
      ],
      metadata: { submitLabel: 'Save', layout: 'single-column' },
    };
    render(() => <FormRenderer form={f} />);
    fireEvent.change(screen.getByLabelText(/Code/), {
      target: { value: 'abcde' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Maximum length is 3');
  });

  it('shows pattern error when value does not match', async () => {
    const f: Form = {
      fields: [
        {
          name: 'zip',
          label: 'Zip',
          type: 'text',
          required: false,
          readOnly: false,
          validation: { pattern: '^\\d+$' },
        },
      ],
      metadata: { submitLabel: 'Save', layout: 'single-column' },
    };
    render(() => <FormRenderer form={f} />);
    fireEvent.change(screen.getByLabelText(/Zip/), {
      target: { value: 'abc' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Invalid format');
  });
});
