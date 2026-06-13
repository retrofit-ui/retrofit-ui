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
      'sl-alert': JSX.HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
        open?: boolean;
        closable?: boolean;
        duration?: number;
        children?: JSX.Element;
        'on:sl-after-hide'?: SlEventHandler;
      };
      'sl-icon': JSX.HTMLAttributes<HTMLElement> & {
        name?: string;
        src?: string;
        slot?: string;
      };
      'sl-dialog': JSX.HTMLAttributes<HTMLElement> & {
        open?: boolean;
        'prop:open'?: boolean;
        label?: string;
        'no-header'?: boolean;
        children?: JSX.Element;
        'on:sl-show'?: SlEventHandler;
        'on:sl-hide'?: SlEventHandler;
        'on:sl-request-close'?: SlEventHandler;
      };
      'sl-skeleton': JSX.HTMLAttributes<HTMLElement> & {
        effect?: 'none' | 'sheen' | 'pulse';
      };
    }
  }
}
