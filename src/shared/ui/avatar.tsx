import {
  Avatar as AvatarPrimitive,
  AvatarFallback,
} from '@/shared/ui/primitives/avatar';
import { User } from 'lucide-react';

export function Avatar() {
  return (
    <AvatarPrimitive className="w-6.5 h-6.5 rounded-md after:rounded-md">
      <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <User className="size-3.5" />
      </AvatarFallback>
    </AvatarPrimitive>
  );
}
