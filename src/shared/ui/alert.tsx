import { AlertCircle, Info } from 'lucide-react';

import {
  Alert as AlertPrimitive,
  AlertDescription,
} from '@/shared/ui/primitives/alert';

interface AlertProps {
  variant?: 'default' | 'destructive';
  message: string;
}

const alertIcons = {
  default: Info,
  destructive: AlertCircle,
} as const;

export function Alert({ variant = 'destructive', message }: AlertProps) {
  const Icon = alertIcons[variant];

  return (
    <AlertPrimitive variant={variant}>
      <Icon />
      <AlertDescription>{message}</AlertDescription>
    </AlertPrimitive>
  );
}
