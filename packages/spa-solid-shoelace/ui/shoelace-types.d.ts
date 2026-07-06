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
      'sl-switch': SlBaseProps & {
        checked?: boolean;
        'prop:checked'?: boolean;
        value?: string;
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
      'sl-radio-button': JSX.HTMLAttributes<HTMLElement> & {
        value?: string;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        pill?: boolean;
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
      'sl-drawer': JSX.HTMLAttributes<HTMLElement> & {
        open?: boolean;
        'prop:open'?: boolean;
        label?: string;
        'attr:label'?: string;
        placement?: 'top' | 'end' | 'bottom' | 'start';
        contained?: boolean;
        'no-header'?: boolean;
        children?: JSX.Element;
        'on:sl-show'?: SlEventHandler;
        'on:sl-hide'?: SlEventHandler;
        'on:sl-after-show'?: SlEventHandler;
        'on:sl-after-hide'?: SlEventHandler;
        'on:sl-initial-focus'?: SlEventHandler;
        'on:sl-request-close'?: SlEventHandler;
      };
      'sl-skeleton': JSX.HTMLAttributes<HTMLElement> & {
        effect?: 'none' | 'sheen' | 'pulse';
      };
      'sl-color-picker': JSX.HTMLAttributes<HTMLElement> & {
        format?: 'hex' | 'rgb' | 'hsl' | 'hsv';
        value?: string;
        'prop:value'?: string;
        swatches?: string;
        inline?: boolean;
        disabled?: boolean;
        'no-format-toggle'?: boolean;
        'on:sl-change'?: SlEventHandler;
        'on:sl-input'?: SlEventHandler;
        'aria-label'?: string;
      };
      'sl-tag': JSX.HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
        size?: 'small' | 'medium' | 'large';
        pill?: boolean;
        removable?: boolean;
        'on:sl-remove'?: SlEventHandler;
        children?: JSX.Element;
      };
      'sl-rating': JSX.HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: number;
        'prop:value'?: number;
        max?: number;
        'attr:max'?: number;
        precision?: number;
        'attr:precision'?: number;
        readonly?: boolean;
        'on:sl-change'?: SlEventHandler;
        'on:sl-hover'?: SlEventHandler;
      };
      'sl-badge': JSX.HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
        pill?: boolean;
        pulse?: boolean;
        children?: JSX.Element;
      };
      'sl-button-group': JSX.HTMLAttributes<HTMLElement> & {
        label?: string;
        children?: JSX.Element;
      };
      'sl-tooltip': JSX.HTMLAttributes<HTMLElement> & {
        content?: string;
        'attr:content'?: string;
        placement?:
          | 'top'
          | 'top-start'
          | 'top-end'
          | 'bottom'
          | 'bottom-start'
          | 'bottom-end'
          | 'right'
          | 'right-start'
          | 'right-end'
          | 'left'
          | 'left-start'
          | 'left-end';
        disabled?: boolean;
        distance?: number;
        open?: boolean;
        skidding?: number;
        trigger?: string;
        hoist?: boolean;
        children?: JSX.Element;
      };
      'sl-icon-button': JSX.HTMLAttributes<HTMLElement> & {
        name?: string;
        library?: string;
        src?: string;
        label?: string;
        disabled?: boolean;
        href?: string;
        size?: 'small' | 'medium' | 'large';
        'on:click'?: SlEventHandler;
      };
      'sl-format-bytes': JSX.HTMLAttributes<HTMLElement> & {
        value?: number;
        unit?: 'byte' | 'bit';
        display?: 'long' | 'short' | 'narrow';
      };
      'sl-format-number': JSX.HTMLAttributes<HTMLElement> & {
        value?: number;
        type?: 'currency' | 'decimal' | 'percent';
        currency?: string;
        'currency-display'?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
        'no-grouping'?: boolean;
        'minimum-integer-digits'?: number;
        'minimum-fraction-digits'?: number;
        'maximum-fraction-digits'?: number;
        'minimum-significant-digits'?: number;
        'maximum-significant-digits'?: number;
      };
      'sl-tree': JSX.HTMLAttributes<HTMLElement> & {
        selection?: 'single' | 'multiple' | 'leaf';
        'on:sl-selection-change'?: SlEventHandler;
        children?: JSX.Element;
      };
      'sl-tree-item': JSX.HTMLAttributes<HTMLElement> & {
        expanded?: boolean;
        selected?: boolean;
        disabled?: boolean;
        lazy?: boolean;
        'data-id'?: string;
        children?: JSX.Element;
        'on:sl-expand'?: SlEventHandler;
        'on:sl-collapse'?: SlEventHandler;
      };
      'sl-relative-time': JSX.HTMLAttributes<HTMLElement> & {
        date?: string;
        lang?: string;
        format?: 'long' | 'short' | 'narrow';
        numeric?: 'always' | 'auto';
        sync?: boolean;
      };
      'sl-card': JSX.HTMLAttributes<HTMLElement> & {
        children?: JSX.Element;
      };
      'sl-tab-group': JSX.HTMLAttributes<HTMLElement> & {
        placement?: 'top' | 'bottom' | 'start' | 'end';
        activation?: 'auto' | 'manual';
        'no-scroll-controls'?: boolean;
        children?: JSX.Element;
        'on:sl-tab-show'?: SlEventHandler;
        'on:sl-tab-hide'?: SlEventHandler;
      };
      'sl-tab': JSX.HTMLAttributes<HTMLElement> & {
        panel?: string;
        slot?: string;
        active?: boolean;
        disabled?: boolean;
        closable?: boolean;
        children?: JSX.Element;
      };
      'sl-tab-panel': JSX.HTMLAttributes<HTMLElement> & {
        name?: string;
        active?: boolean;
        children?: JSX.Element;
      };
      'sl-details': JSX.HTMLAttributes<HTMLElement> & {
        summary?: string;
        open?: boolean;
        'prop:open'?: boolean;
        disabled?: boolean;
        children?: JSX.Element;
        'on:sl-show'?: SlEventHandler;
        'on:sl-hide'?: SlEventHandler;
        'on:sl-after-show'?: SlEventHandler;
        'on:sl-after-hide'?: SlEventHandler;
      };
    }
  }
}
