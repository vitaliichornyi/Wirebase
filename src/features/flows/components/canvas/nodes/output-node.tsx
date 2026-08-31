'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CanvasNode } from '@/features/flows/hooks/use-flow-canvas';
import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { OutputIcon } from '@/shared/ui/icons/output-icon';
import { TextField } from '@/shared/ui/text-field';
import { cn } from '@/shared/lib/utils';

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, '');
}

export function OutputNode({ id, data, selected }: NodeProps<CanvasNode>) {
  const { onSelectNode } = useCanvas();
  const { node } = data;

  if (node.type !== 'output') return null;

  return (
    <div
      className={cn(
        'w-64 p-3 canvas-background transition-opacity',
        selected && 'ring-4 border-ring ring-ring/50',
      )}
      onClick={() => onSelectNode(id)}
    >
      <div className="flex items-center gap-1.5 mb-3 label-large">
        <OutputIcon />
        Output
      </div>
      <TextField
        id={id}
        value={stripProtocol(node.destinationUrl)}
        readOnly
        prefix="https://"
        placeholder="destination.com"
        aria-label="Output destination"
        copyable
      />
      <Handle
        id="in"
        type="target"
        position={Position.Left}
        className="size-3! border-2! bg-background! border-muted-foreground!"
      />
    </div>
  );
}
