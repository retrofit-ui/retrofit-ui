import type { Column, Field, FieldType } from '@retrofit-ui/core';
import type { ZodTypeAny } from 'zod';

type ZodDef = Record<string, unknown>;
// Zod v4 check: { _zod: { def: { check: string, format?: string, minimum?: number, maximum?: number } } }
type ZodCheckDef = {
  check: string;
  format?: string;
  minimum?: number;
  maximum?: number;
};
type ZodCheck = { _zod?: { def: ZodCheckDef } };

function getDef(schema: ZodTypeAny): ZodDef {
  return schema._def as unknown as ZodDef;
}

function unwrapOptional(schema: ZodTypeAny): {
  schema: ZodTypeAny;
  optional: boolean;
} {
  const def = getDef(schema);
  if (def.type === 'optional') {
    return { schema: def.innerType as ZodTypeAny, optional: true };
  }
  return { schema, optional: false };
}

function getChecks(def: ZodDef): ZodCheckDef[] {
  const raw = (def.checks as ZodCheck[] | undefined) ?? [];
  return raw
    .map((c) => c._zod?.def)
    .filter((d): d is ZodCheckDef => d !== undefined);
}

function toFieldType(def: ZodDef): FieldType {
  const type = def.type as string;
  if (type === 'string') {
    const checks = getChecks(def);
    if (checks.some((c) => c.check === 'string_format' && c.format === 'email'))
      return 'email';
    if (
      checks.some((c) => c.check === 'string_format' && c.format === 'datetime')
    )
      return 'datetime';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date'))
      return 'date';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'time'))
      return 'time';
    return 'text';
  }
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'checkbox';
  if (type === 'enum') return 'select';
  if (type === 'date') return 'datetime';
  return 'text';
}

function toColumnType(def: ZodDef): Column['type'] {
  const type = def.type as string;
  if (type === 'string') {
    const checks = getChecks(def);
    if (
      checks.some((c) => c.check === 'string_format' && c.format === 'datetime')
    )
      return 'datetime';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'date'))
      return 'date';
    if (checks.some((c) => c.check === 'string_format' && c.format === 'time'))
      return 'time';
    return 'string';
  }
  if (type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  if (type === 'enum') return 'enum';
  if (type === 'date') return 'datetime';
  return 'string';
}

function extractValidation(
  def: ZodDef,
  required: boolean,
): Field['validation'] {
  const checks = getChecks(def);
  const validation: NonNullable<Field['validation']> = { required };
  let hasAny = required;
  for (const check of checks) {
    if (check.check === 'min_length' && check.minimum !== undefined) {
      validation.min = check.minimum;
      hasAny = true;
    } else if (check.check === 'max_length' && check.maximum !== undefined) {
      validation.max = check.maximum;
      hasAny = true;
    }
  }
  return hasAny ? validation : undefined;
}

function toLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

export function zodFieldToField(
  key: string,
  schema: ZodTypeAny,
  readOnly = false,
): Field {
  const { schema: inner, optional } = unwrapOptional(schema);
  const def = getDef(inner);
  const fieldType = toFieldType(def);
  const required = !optional;

  const field: Field = {
    name: key,
    label: toLabel(key),
    type: fieldType,
    required,
    readOnly,
  };

  const validation = extractValidation(def, required);
  if (validation) field.validation = validation;

  if (fieldType === 'select') {
    const entries = def.entries as Record<string, unknown> | undefined;
    if (entries) {
      field.options = Object.values(entries).map((v) => ({
        label: String(v),
        value: v as string,
      }));
    }
  }

  return field;
}

export function zodFieldToColumn(key: string, schema: ZodTypeAny): Column {
  const { schema: inner } = unwrapOptional(schema);
  const def = getDef(inner);

  return {
    key,
    label: toLabel(key),
    type: toColumnType(def),
    sortable: false,
    filterable: false,
    editable: false,
    alignment: 'left',
  };
}

export function getShapeKeys(schema: ZodTypeAny): string[] {
  const def = getDef(schema);
  const shape = def.shape as Record<string, ZodTypeAny> | undefined;
  return shape ? Object.keys(shape) : [];
}

export function getShape(schema: ZodTypeAny): Record<string, ZodTypeAny> {
  const def = getDef(schema);
  return (def.shape as Record<string, ZodTypeAny>) ?? {};
}
