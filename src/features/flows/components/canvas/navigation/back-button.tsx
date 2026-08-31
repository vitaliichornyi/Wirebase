'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { Logo as LogoPrimitive } from '@/shared/ui/logo';
import { IconButton } from '@/shared/ui/icon-button';
import { ArrowLeftIcon } from '@/shared/ui/icons/arrow-left-icon';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export function BackButton() {
  const { isDirty } = useCanvas();
  const router = useRouter();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleBackClick = () => {
    if (isDirty) {
      setShowLeaveConfirm(true);
      return;
    }
    router.push('/dashboard/flows');
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="group w-11 h-11 overflow-hidden canvas-background">
        <div className="flex h-full w-22 group-hover:-translate-x-1/2 transition-transform duration-200 ease-in-out">
          <div className="flex items-center justify-center w-11 h-11 shrink-0">
            <LogoPrimitive variant="icon" />
          </div>
          <div className="flex items-center justify-center w-11 h-11 shrink-0">
            <IconButton
              label="Back to home"
              size="sm"
              onClick={handleBackClick}
            >
              <ArrowLeftIcon />
            </IconButton>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Discard unsaved changes?"
        description="You have unsaved changes on this canvas. Leaving now will discard them."
        confirmLabel="Discard"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          router.push('/dashboard/flows');
        }}
      />
    </div>
  );
}
