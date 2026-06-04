import type { Form } from '@retrofit-ui/core';
import type { RendererConfig } from '../types';
import { FormRenderer } from './FormRenderer';

function isFormSchema(schema: unknown): schema is Form {
  if (typeof schema !== 'object' || schema === null) return false;
  return 'fields' in schema && Array.isArray((schema as Form).fields);
}

export const FormRendererConfig: RendererConfig<{
  form: Form;
  onSubmit?: (values: Record<string, unknown>) => void;
}> = {
  name: 'form',
  component: FormRenderer,
  canRender: isFormSchema,
  metadata: { displayName: 'Form' },
};
