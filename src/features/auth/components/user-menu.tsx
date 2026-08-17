'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/features/auth/actions/auth';
import { UserAvatar } from '@/shared/ui/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';

export function UserMenu() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await logoutUser();

    if (error) {
      console.error(error);
      setIsLoggingOut(false);
      return;
    }

    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="flex items-center justify-center size-8 mx-2 mb-2 rounded-lg outline-none hover:bg-sidebar-accent focus-visible:bg-sidebar-accent"
      >
        <UserAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right">
        <DropdownMenuItem disabled>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
