'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/features/flows/hooks/use-flow-canvas';
import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { InputIcon } from '@/shared/ui/icons/input-icon';
import { TextField } from '@/shared/ui/text-field';
import { cn } from '@/shared/lib/utils';

export function InputNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const { onSelectNode } = useCanvas();
  const { node } = data;

  if (node.type !== 'input') return null;

  const isDisabled = node.status === 'disabled';
  const link = `localhost:3000/c/${node.slug || '…'}`;

  return (
    <div
      className={cn(
        'w-64 p-3 canvas-background transition-opacity',
        selected && 'ring-4 border-ring ring-ring/50',
        isDisabled && 'opacity-50',
      )}
      onClick={() => onSelectNode(id)}
    >
      <div className="flex items-center gap-1.5 mb-3 label-large">
        <InputIcon />
        Input
      </div>
      <TextField
        id={id}
        value={link}
        readOnly
        prefix="https://"
        aria-label="Input link"
        copyable
      />
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="size-3! border-2! bg-background! border-muted-foreground!"
      />
    </div>
  );
}
