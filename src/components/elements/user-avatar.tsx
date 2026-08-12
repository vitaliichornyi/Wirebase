import { User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserAvatar() {
  return (
    <Avatar>
      <AvatarFallback>
        <User className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}
