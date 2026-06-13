import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

import { createSignal, For, onMount } from 'solid-js';

export type ToastVariant = 'success' | 'danger' | 'warning';

interface SlAlertElement extends HTMLElement {
  toast(): Promise<void>;
}

const icons: Record<ToastVariant, string> = {
  success: 'check2-circle',
  danger: 'exclamation-octagon',
  warning: 'exclamation-triangle',
};

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

let nextId = 0;
const [toasts, setToasts] = createSignal<ToastItem[]>([]);

export function showToast(variant: ToastVariant, message: string) {
  setToasts((prev) => [...prev, { id: nextId++, variant, message }]);
}

function ToastAlert(props: ToastItem & { onDone: () => void }) {
  let ref!: SlAlertElement;
  onMount(() => {
    void ref.toast().then(props.onDone);
  });
  return (
    <sl-alert ref={ref} variant={props.variant} closable duration={3000}>
      <sl-icon slot="icon" name={icons[props.variant]} />
      {props.message}
    </sl-alert>
  );
}

export function ToastContainer() {
  return (
    <For each={toasts()}>
      {(toast) => (
        <ToastAlert
          {...toast}
          onDone={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
        />
      )}
    </For>
  );
}
