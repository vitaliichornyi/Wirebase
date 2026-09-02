import { toast as toastPrimitive } from '@/shared/ui/primitives/toast';

type ToastType = 'success' | 'info' | 'warning' | 'error' | 'loading';

interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
}

export function toast({ title, description, type = 'info' }: ToastOptions) {
  return toastPrimitive.add({ title, description, type });
}
