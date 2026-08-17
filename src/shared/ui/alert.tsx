import {
  Alert as AlertPrimitive,
  AlertDescription,
} from '@/shared/ui/primitives/alert';

interface AlertProps {
  variant?: 'default' | 'destructive';
  message: string;
}

export function Alert({ variant = 'destructive', message }: AlertProps) {
  return (
    <AlertPrimitive variant={variant}>
      <AlertDescription>{message}</AlertDescription>
    </AlertPrimitive>
  );
}
