import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

type ToastVariant = 'success' | 'danger' | 'warning';

interface SlAlertElement extends HTMLElement {
  variant: ToastVariant;
  closable: boolean;
  duration: number;
  toast(): Promise<void>;
}

const icons: Record<ToastVariant, string> = {
  success: 'check2-circle',
  danger: 'exclamation-octagon',
  warning: 'exclamation-triangle',
};

export function showToast(variant: ToastVariant, message: string) {
  const alert = document.createElement('sl-alert') as unknown as SlAlertElement;
  alert.variant = variant;
  alert.closable = true;
  alert.duration = 3000;
  alert.innerHTML = `<sl-icon slot="icon" name="${icons[variant]}"></sl-icon> ${message}`;
  document.body.append(alert);
  void alert.toast();
}
