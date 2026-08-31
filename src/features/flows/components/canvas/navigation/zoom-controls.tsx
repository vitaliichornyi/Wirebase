import { useReactFlow, useStore } from '@xyflow/react';

import { IconButton } from '@/shared/ui/icon-button';
import { FrameIcon } from '@/shared/ui/icons/frame-icon';
import { MinusIcon } from '@/shared/ui/icons/minus-icon';
import { PlusIcon } from '@/shared/ui/icons/plus-icon';

export function ZoomControls() {
  const { fitView, zoomOut, zoomIn } = useReactFlow();
  const zoom = useStore((state) => state.transform[2]);

  return (
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <div className="p-0.5 pointer-events-auto canvas-background">
        <IconButton
          label="Fit view"
          size="sm"
          onClick={() => fitView({ maxZoom: 1 })}
        >
          <FrameIcon />
        </IconButton>
      </div>
      <div className="flex items-center gap-2 p-0.5 pointer-events-auto canvas-background">
        <IconButton label="Zoom out" size="sm" onClick={() => zoomOut()}>
          <MinusIcon />
        </IconButton>
        <span className="w-10 text-center label-medium">
          {Math.round(zoom * 100)}%
        </span>
        <IconButton label="Zoom in" size="sm" onClick={() => zoomIn()}>
          <PlusIcon />
        </IconButton>
      </div>
    </div>
  );
}
