import type { JSX } from 'solid-js';

type SlEventHandler = (e: Event) => void;

interface SlBaseProps extends JSX.HTMLAttributes<HTMLElement> {
  class?: string;
  disabled?: boolean;
  label?: string;
  'help-text'?: string;
  size?: 'small' | 'medium' | 'large';
  invalid?: boolean;
}

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'sl-button': SlBaseProps & {
        variant?:
          | 'default'
          | 'primary'
          | 'success'
          | 'neutral'
          | 'warning'
          | 'danger'
          | 'text';
        type?: 'button' | 'submit' | 'reset';
        loading?: boolean;
        outline?: boolean;
        pill?: boolean;
        href?: string;
      };
      'sl-input': SlBaseProps & {
        type?: string;
        value?: string;
        'prop:value'?: string;
        placeholder?: string;
        readonly?: boolean;
        clearable?: boolean;
        'on:sl-input'?: SlEventHandler;
        'on:sl-change'?: SlEventHandler;
      };
      'sl-textarea': SlBaseProps & {
        value?: string;
        'prop:value'?: string;
        placeholder?: string;
        readonly?: boolean;
        rows?: number;
        resize?: 'none' | 'vertical' | 'auto';
        'on:sl-input'?: SlEventHandler;
        'on:sl-change'?: SlEventHandler;
      };
      'sl-select': SlBaseProps & {
        value?: string;
        'prop:value'?: string;
        placeholder?: string;
        multiple?: boolean;
        clearable?: boolean;
        'on:sl-change'?: SlEventHandler;
        children?: JSX.Element;
      };
      'sl-option': JSX.HTMLAttributes<HTMLElement> & {
        value?: string;
        disabled?: boolean;
        children?: JSX.Element;
      };
      'sl-checkbox': SlBaseProps & {
        checked?: boolean;
        'prop:checked'?: boolean;
        value?: string;
        indeterminate?: boolean;
        'on:sl-change'?: SlEventHandler;
        children?: JSX.Element;
      };
      'sl-radio-group': SlBaseProps & {
        value?: string;
        'prop:value'?: string;
        name?: string;
        required?: boolean;
        'on:sl-change'?: SlEventHandler;
        children?: JSX.Element;
      };
      'sl-radio': SlBaseProps & {
        value?: string;
        children?: JSX.Element;
      };
      'sl-divider': JSX.HTMLAttributes<HTMLElement> & { vertical?: boolean };
    }
  }
}
