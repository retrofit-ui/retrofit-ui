export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'radio-group'
  | 'textarea'
  | 'markdown'
  | 'file'
  | 'color'
  | 'tags'
  | 'rating';

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FieldOption {
  label: string;
  value: string | number;
}

/** One form field. Omitted flags default to `false`. */
export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  validation?: FieldValidation;
  placeholder?: string;
  helpText?: string;
  tooltip?: string;
  options?: FieldOption[];
  /** Initial value, e.g. the current value of an edit form. */
  value?: unknown;
  colorFormat?: 'hex' | 'rgb' | 'hsl';
  colorSwatches?: string[];
  /** Positive integer. */
  ratingMax?: number;
  ratingPrecision?: number;
}
