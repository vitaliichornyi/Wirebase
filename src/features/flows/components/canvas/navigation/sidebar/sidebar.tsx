'use client';

import type {
  CanvasNode,
  NodePatch,
} from '@/features/flows/hooks/use-flow-canvas';
import type { InputNode } from '@/features/flows/types/nodes';
import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { SidebarHeader } from './sidebar-header';

import { Button } from '@/shared/ui/button';
import { InputIcon } from '@/shared/ui/icons/input-icon';
import { OutputIcon } from '@/shared/ui/icons/output-icon';
import { TrashBinIcon } from '@/shared/ui/icons/trash-bin-icon';
import { TextField } from '@/shared/ui/fields/text-field';
import { SwitchField } from '@/shared/ui/fields/switch-field';
import { Divider } from '@/shared/ui/divider';

const UTM_FIELDS = [
  { key: 'utmSource', label: 'Source', placeholder: 'google' },
  { key: 'utmMedium', label: 'Medium', placeholder: 'cpc' },
  {
    key: 'utmCampaign',
    label: 'Name',
    placeholder: 'summer_sale',
  },
  { key: 'utmTerm', label: 'Term', placeholder: 'running+shoes' },
  { key: 'utmContent', label: 'Content', placeholder: 'logolink' },
] as const satisfies {
  key: keyof InputNode;
  label: string;
  placeholder: string;
}[];

const sidebarStyles =
  'absolute right-4 top-4 flex flex-col w-72 canvas-background';

interface SidebarProps {
  selectedNode: CanvasNode | null;
  onAddInput: () => void;
  onAddOutput: () => void;
  onUpdate: (nodeId: string, patch: NodePatch) => void;
  onDelete: (nodeId: string) => void;
}

export function Sidebar({
  selectedNode,
  onAddInput,
  onAddOutput,
  onUpdate,
  onDelete,
}: SidebarProps) {
  const { isLocked } = useCanvas();

  if (!selectedNode) {
    return (
      <aside className={sidebarStyles}>
        <SidebarHeader />
        <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
          <h2 className="label-medium text-muted-foreground">Nodes</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={isLocked}
              onClick={onAddInput}
              className="justify-start gap-2"
            >
              <InputIcon />
              Input
            </Button>
            <Button
              variant="outline"
              disabled={isLocked}
              onClick={onAddOutput}
              className="justify-start gap-2"
            >
              <OutputIcon />
              Output
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  const { node } = selectedNode.data;

  return (
    <aside className={sidebarStyles}>
      <SidebarHeader selectedNodeType={node.type} />
      <div className="flex flex-col gap-4 p-4 max-h-140 overflow-x-scroll">
        <div className="flex flex-col gap-2">
          <TextField
            id="node-name"
            label="Name"
            value={node.name}
            disabled={isLocked}
            onChange={(event) =>
              onUpdate(selectedNode.id, { name: event.target.value })
            }
          />

          {node.type === 'output' && (
            <TextField
              id="node-destination"
              label="Destination URL"
              type="url"
              placeholder="https://destination.com"
              value={node.destinationUrl}
              disabled={isLocked}
              onChange={(event) =>
                onUpdate(selectedNode.id, {
                  destinationUrl: event.target.value,
                })
              }
            />
          )}

          {node.type === 'input' && (
            <TextField
              id="node-source"
              label="Link"
              prefix="https://"
              value={
                node.slug ? `wirebase/${node.slug}` : 'Generated after save'
              }
              readOnly
              aria-label="Input link"
              copyable
            />
          )}

          {node.type === 'input' && (
            <>
              <SwitchField
                id="node-enabled"
                label="Enabled"
                checked={node.status === 'enabled'}
                disabled={isLocked}
                onCheckedChange={(checked) =>
                  onUpdate(selectedNode.id, {
                    status: checked ? 'enabled' : 'disabled',
                  })
                }
              />
              <Divider />

              <h3 className="label-medium text-muted-foreground py-1.5">
                UTM tags
              </h3>

              {UTM_FIELDS.map(({ key, label, placeholder }) => (
                <TextField
                  key={key}
                  id={`node-${key}`}
                  label={label}
                  placeholder={placeholder}
                  value={node[key] ?? ''}
                  disabled={isLocked}
                  onChange={(event) =>
                    onUpdate(selectedNode.id, {
                      [key]: event.target.value || null,
                    })
                  }
                />
              ))}
            </>
          )}
        </div>

        <Button
          variant="outline"
          disabled={isLocked}
          onClick={() => onDelete(selectedNode.id)}
        >
          <TrashBinIcon />
          Delete
        </Button>
      </div>
    </aside>
  );
}
