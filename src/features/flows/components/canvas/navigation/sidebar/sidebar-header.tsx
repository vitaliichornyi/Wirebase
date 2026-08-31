import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { TitleField } from './title-field';
import { Button } from '@/shared/ui/button';
import { Headline } from '@/shared/ui/headline';
import { IconButton } from '@/shared/ui/icon-button';
import { InputIcon } from '@/shared/ui/icons/input-icon';
import { LockIcon } from '@/shared/ui/icons/lock-icon';
import { LockOpenIcon } from '@/shared/ui/icons/lock-open-icon';
import { OutputIcon } from '@/shared/ui/icons/output-icon';

interface SidebarHeaderProps {
  selectedNodeType?: 'input' | 'output';
}

export function SidebarHeader({ selectedNodeType }: SidebarHeaderProps) {
  const { isLocked, toggleLock, isSaving, handleSave, isDirty } = useCanvas();
  return (
    <div className="flex justify-between px-3 pt-3 pb-3 border-b border-border">
      {selectedNodeType ? (
        <Headline
          as="h2"
          variant="title"
          size="small"
          className="flex items-center gap-1.5 pl-1"
        >
          {selectedNodeType === 'input' ? <InputIcon /> : <OutputIcon />}
          {selectedNodeType === 'input' ? 'Input' : 'Output'}
        </Headline>
      ) : (
        <TitleField />
      )}
      <div className="flex gap-2">
        <IconButton
          label={isLocked ? 'Unlock flow' : 'Lock flow'}
          onClick={toggleLock}
          aria-pressed={isLocked}
          tooltipSide="bottom"
        >
          {isLocked ? <LockIcon /> : <LockOpenIcon />}
        </IconButton>
        <Button
          onClick={handleSave}
          disabled={!isDirty}
          isSubmitting={isSaving}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
