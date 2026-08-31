'use client';

import { useState } from 'react';

import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import { Tooltip } from '@/shared/ui/tooltip';

const COPIED_TOOLTIP_DURATION_MS = 1500;

interface CopyButtonProps {
  value: string;
  disabled?: boolean;
}

export function CopyButton({ value, disabled = false }: CopyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), COPIED_TOOLTIP_DURATION_MS);
  };

  return (
    <Tooltip
      label={justCopied ? 'Copied!' : 'Copy'}
      open={justCopied || isHovered}
      onOpenChange={setIsHovered}
    >
      <button
        type="button"
        aria-label="Copy"
        disabled={disabled}
        onClick={handleCopy}
        className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <CopyIcon />
      </button>
    </Tooltip>
  );
}
