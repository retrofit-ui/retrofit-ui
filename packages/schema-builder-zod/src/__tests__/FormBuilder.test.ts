import { FormSchema } from '@retrofit-ui/core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formFromSchema } from '../FormBuilder';

const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  email: z.string().email(),
  note: z.string().optional(),
});

const UpdateTodoSchema = z.object({
  title: z.string(),
  done: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
});

describe('formFromSchema', () => {
  it('maps string → text field', () => {
    const form = formFromSchema(TodoSchema).build();
    const titleField = form.fields.find((f) => f.name === 'title');
    expect(titleField?.type).toBe('text');
  });

  it('maps boolean → checkbox field', () => {
    const form = formFromSchema(TodoSchema).build();
    const doneField = form.fields.find((f) => f.name === 'done');
    expect(doneField?.type).toBe('checkbox');
  });

  it('maps number → number field', () => {
    const form = formFromSchema(TodoSchema).build();
    const idField = form.fields.find((f) => f.name === 'id');
    expect(idField?.type).toBe('number');
  });

  it('maps enum → select field with options', () => {
    const form = formFromSchema(TodoSchema).build();
    const priorityField = form.fields.find((f) => f.name === 'priority');
    expect(priorityField?.type).toBe('select');
    expect(priorityField?.options?.map((o) => o.value)).toEqual([
      'low',
      'medium',
      'high',
    ]);
  });

  it('maps email string → email field', () => {
    const form = formFromSchema(TodoSchema).build();
    const emailField = form.fields.find((f) => f.name === 'email');
    expect(emailField?.type).toBe('email');
  });

  it('marks optional fields as not required', () => {
    const form = formFromSchema(TodoSchema).build();
    const noteField = form.fields.find((f) => f.name === 'note');
    expect(noteField?.required).toBe(false);
  });

  it('marks non-optional fields as required', () => {
    const form = formFromSchema(TodoSchema).build();
    const titleField = form.fields.find((f) => f.name === 'title');
    expect(titleField?.required).toBe(true);
  });

  it('withMutability marks absent fields as readOnly', () => {
    const form = formFromSchema(TodoSchema)
      .withMutability(UpdateTodoSchema)
      .build();
    const idField = form.fields.find((f) => f.name === 'id');
    const emailField = form.fields.find((f) => f.name === 'email');
    const titleField = form.fields.find((f) => f.name === 'title');
    expect(idField?.readOnly).toBe(true);
    expect(emailField?.readOnly).toBe(true);
    expect(titleField?.readOnly).toBe(false);
  });

  it('withFieldOverrides wins over derived defaults', () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({
        title: { label: 'Task Title', placeholder: 'Enter task' },
      })
      .build();
    const titleField = form.fields.find((f) => f.name === 'title');
    expect(titleField?.label).toBe('Task Title');
    expect(titleField?.placeholder).toBe('Enter task');
  });

  it('withSubmit sets submitAction on metadata', () => {
    const form = formFromSchema(TodoSchema)
      .withSubmit({ method: 'POST', url: '/api/todos' })
      .build();
    expect(form.metadata?.submitAction).toEqual({
      method: 'POST',
      url: '/api/todos',
    });
  });

  it('withDelete sets deleteAction on metadata', () => {
    const form = formFromSchema(TodoSchema)
      .withDelete({ method: 'DELETE', url: '/api/todos/1' })
      .build();
    expect(form.metadata?.deleteAction).toEqual({
      method: 'DELETE',
      url: '/api/todos/1',
    });
  });

  it('withTitle sets title on metadata', () => {
    const form = formFromSchema(TodoSchema).withTitle('Edit Todo').build();
    expect(form.metadata?.title).toBe('Edit Todo');
  });

  it("withFieldOverrides accepts 'radio-group' type", () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({
        priority: { type: 'radio-group' },
      })
      .build();
    const priorityField = form.fields.find((f) => f.name === 'priority');
    expect(priorityField?.type).toBe('radio-group');
  });

  it('withFieldOverrides can set type to tags', () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({ title: { type: 'tags' } })
      .build();
    expect(form.fields.find((f) => f.name === 'title')?.type).toBe('tags');
  });

  it('tags field override passes FormSchema.parse()', () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({ title: { type: 'tags' } })
      .build();
    expect(() => FormSchema.parse(form)).not.toThrow();
  });

  it('build() output passes FormSchema.parse()', () => {
    const form = formFromSchema(TodoSchema)
      .withMutability(UpdateTodoSchema)
      .withSubmit({ method: 'POST', url: '/api/todos' })
      .withTitle('Create Todo')
      .build();
    expect(() => FormSchema.parse(form)).not.toThrow();
  });

  it('withFieldOverrides accepts tooltip', () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({
        title: { tooltip: 'The 3-digit code on the back of your card' },
      })
      .build();
    const titleField = form.fields.find((f) => f.name === 'title');
    expect(titleField?.tooltip).toBe('The 3-digit code on the back of your card');
  });

  it('tooltip survives FormSchema.parse() after build', () => {
    const form = formFromSchema(TodoSchema)
      .withFieldOverrides({
        title: { tooltip: 'The 3-digit code on the back of your card' },
      })
      .build();
    expect(() => FormSchema.parse(form)).not.toThrow();
  });
});
