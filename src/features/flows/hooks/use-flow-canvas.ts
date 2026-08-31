'use client';

import { useCallback, useRef, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge as XyflowEdge,
  type EdgeChange,
  type Node as XyflowNode,
  type NodeChange,
} from '@xyflow/react';

import { renameFlow } from '@/features/flows/actions/flows';
import {
  addInputNode,
  addOutputNode,
  deleteNode,
  renameNode,
  repositionNode,
  updateInputNodeStatus,
  updateInputNodeUtm,
  updateOutputDestinationUrl,
} from '@/features/flows/actions/nodes';
import { connectEdge, disconnectEdge } from '@/features/flows/actions/edges';
import type {
  FlowNode,
  InputNode,
  OutputNode,
} from '@/features/flows/types/nodes';
import type { FlowWithGraph } from '@/features/flows/types/flows';

export type CanvasNodeData = {
  node: FlowNode;
  isNew: boolean;
} & Record<string, unknown>;
export type CanvasNode = XyflowNode<CanvasNodeData>;
export type CanvasEdge = XyflowEdge & { isNew: boolean };
export type NodePatch = Partial<InputNode> & Partial<OutputNode>;

const NEW_INPUT_DEFAULTS = {
  status: 'enabled' as const,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
};

function toCanvasNode(node: FlowNode): CanvasNode {
  return {
    id: node.id,
    type: node.type === 'input' ? 'inputNode' : 'outputNode',
    position: { x: node.positionX, y: node.positionY },
    data: { node, isNew: false },
  };
}

function toCanvasEdge(edge: FlowWithGraph['edges'][number]): CanvasEdge {
  return {
    id: edge.id,
    source: edge.fromNodeId,
    sourceHandle: 'out',
    target: edge.toNodeId,
    targetHandle: 'in',
    isNew: false,
  };
}

function isTemporaryId(id: string): boolean {
  return id.startsWith('temp-');
}

export function useFlowCanvas(initial: FlowWithGraph) {
  const savedSnapshotRef = useRef(initial);
  const flowId = initial.flow.id;
  const [flowName, setFlowName] = useState(initial.flow.name);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<CanvasNode[]>(
    initial.nodes.map(toCanvasNode),
  );
  const [edges, setEdges] = useState<CanvasEdge[]>(
    initial.edges.map(toCanvasEdge),
  );
  const [deletedNodeIds, setDeletedNodeIds] = useState<Set<string>>(new Set());
  const [deletedEdgeIds, setDeletedEdgeIds] = useState<Set<string>>(new Set());
  const [isLocked, setIsLocked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleFlowRename = useCallback(
    (name: string) => {
      setFlowName(name);
      markDirty();
    },
    [markDirty],
  );

  const handleAddNode = useCallback(
    (type: 'input' | 'output', position: { x: number; y: number }) => {
      const tempId = `temp-${crypto.randomUUID()}`;
      const base = {
        id: tempId,
        flowId,
        userId: '',
        positionX: position.x,
        positionY: position.y,
        createdAt: '',
        updatedAt: '',
      };
      const node: FlowNode =
        type === 'input'
          ? {
              ...base,
              type: 'input',
              name: 'Untitled link',
              slug: '',
              ...NEW_INPUT_DEFAULTS,
            }
          : {
              ...base,
              type: 'output',
              name: 'Untitled destination',
              destinationUrl: '',
            };
      setNodes((current) => [
        ...current,
        {
          id: tempId,
          type: type === 'input' ? 'inputNode' : 'outputNode',
          position,
          data: { node, isNew: true },
        },
      ]);
      setSelectedNodeId(tempId);
      markDirty();
    },
    [markDirty],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId,
        ),
      );

      if (!isTemporaryId(nodeId)) {
        setDeletedNodeIds((current) => new Set(current).add(nodeId));
      }
      setSelectedNodeId((current) => (current === nodeId ? null : current));
      markDirty();
    },
    [markDirty],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      setNodes((current) => applyNodeChanges(changes, current));
      if (
        changes.some(
          (change) => change.type === 'position' && change.dragging === false,
        )
      ) {
        markDirty();
      }
    },
    [markDirty],
  );

  const handleUpdateNodeData = useCallback(
    (nodeId: string, patch: NodePatch) => {
      console.log(patch);
      console.log(nodes);
      setNodes((current) =>
        current.map((canvasNode) =>
          canvasNode.id === nodeId
            ? {
                ...canvasNode,
                data: {
                  ...canvasNode.data,
                  node: { ...canvasNode.data.node, ...patch } as FlowNode,
                },
              }
            : canvasNode,
        ),
      );
      markDirty();
    },
    [markDirty],
  );

  const handleAddEdge = useCallback(
    (connection: Connection) => {
      setEdges((current) =>
        addEdge({ ...connection, isNew: true } as CanvasEdge, current),
      );
      markDirty();
    },
    [markDirty],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((current) => current.filter((edge) => edge.id !== edgeId));
      if (!isTemporaryId(edgeId)) {
        setDeletedEdgeIds((current) => new Set(current).add(edgeId));
      }
      markDirty();
    },
    [markDirty],
  );

  const handleEdgesChange = useCallback((changes: EdgeChange<CanvasEdge>[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveError(null);

    const missingDestinationUrl = nodes.some(
      (canvasNode) =>
        canvasNode.data.node.type === 'output' &&
        !canvasNode.data.node.destinationUrl.trim(),
    );
    if (missingDestinationUrl) {
      setSaveError('Add a destination URL before saving.');
      return false;
    }

    setIsSaving(true);

    try {
      const lastSavedSnapshot = savedSnapshotRef.current;

      if (flowName !== lastSavedSnapshot.flow.name) {
        const { data, error } = await renameFlow({ flowId, name: flowName });
        if (error) throw new Error(error);
      }

      const realNodeIdByTempId = new Map<string, string>();
      const justCreatedNodeIds = new Set<string>();

      for (const canvasNode of nodes) {
        if (!canvasNode.data.isNew) continue;
        const node = canvasNode.data.node;

        const { data, error } =
          node.type === 'input'
            ? await addInputNode({
                flowId,
                name: node.name,
                positionX: canvasNode.position.x,
                positionY: canvasNode.position.y,
              })
            : await addOutputNode({
                flowId,
                name: node.name,
                destinationUrl: node.destinationUrl,
                positionX: canvasNode.position.x,
                positionY: canvasNode.position.y,
              });

        if (error || !data) {
          throw new Error(error ?? 'Unknown server error');
        }

        realNodeIdByTempId.set(canvasNode.id, data.id);
        justCreatedNodeIds.add(data.id);
      }

      for (const nodeId of deletedNodeIds) {
        const { error } = await deleteNode({ nodeId });
        if (error) throw new Error(error);
      }

      for (const canvasNode of nodes) {
        const realId = realNodeIdByTempId.get(canvasNode.id) ?? canvasNode.id;
        const wasJustCreated = justCreatedNodeIds.has(realId);

        const node = canvasNode.data.node;
        const savedNode = lastSavedSnapshot.nodes.find(
          (candidate) => candidate.id === realId,
        );

        if (!wasJustCreated) {
          if (!savedNode) continue;

          if (
            savedNode.positionX !== canvasNode.position.x ||
            savedNode.positionY !== canvasNode.position.y
          ) {
            const { data, error } = await repositionNode({
              nodeId: realId,
              positionX: canvasNode.position.x,
              positionY: canvasNode.position.y,
            });
            if (error) throw new Error(error);
          }

          if (savedNode.name !== node.name) {
            const { data, error } = await renameNode({
              nodeId: realId,
              name: node.name,
            });
            if (error) throw new Error(error);
          }
        }

        if (node.type === 'input') {
          const baselineStatus = wasJustCreated
            ? NEW_INPUT_DEFAULTS.status
            : (savedNode as InputNode | undefined)?.status;

          if (baselineStatus !== undefined && baselineStatus !== node.status) {
            const { data, error } = await updateInputNodeStatus({
              nodeId: realId,
              status: node.status,
            });
            if (error) throw new Error(error);
          }

          const baselineUtm = wasJustCreated
            ? NEW_INPUT_DEFAULTS
            : (savedNode as InputNode | undefined);
          const utmChanged =
            baselineUtm !== undefined &&
            (baselineUtm.utmSource !== node.utmSource ||
              baselineUtm.utmMedium !== node.utmMedium ||
              baselineUtm.utmCampaign !== node.utmCampaign ||
              baselineUtm.utmTerm !== node.utmTerm ||
              baselineUtm.utmContent !== node.utmContent);
          if (utmChanged) {
            const { data, error } = await updateInputNodeUtm({
              nodeId: realId,
              utmSource: node.utmSource,
              utmMedium: node.utmMedium,
              utmCampaign: node.utmCampaign,
              utmTerm: node.utmTerm,
              utmContent: node.utmContent,
            });
            if (error) throw new Error(error);
          }
        }

        if (node.type === 'output' && !wasJustCreated) {
          const baselineUrl = (savedNode as OutputNode | undefined)
            ?.destinationUrl;
          if (
            baselineUrl !== undefined &&
            baselineUrl !== node.destinationUrl
          ) {
            const { data, error } = await updateOutputDestinationUrl({
              nodeId: realId,
              destinationUrl: node.destinationUrl,
            });
            if (error) throw new Error(error);
          }
        }
      }

      for (const edge of edges) {
        if (!edge.isNew) continue;

        const fromNodeId = realNodeIdByTempId.get(edge.source) ?? edge.source;
        const toNodeId = realNodeIdByTempId.get(edge.target) ?? edge.target;
        const { data, error } = await connectEdge({
          flowId,
          fromNodeId,
          toNodeId,
        });
        if (error) throw new Error(error);
      }

      for (const edgeId of deletedEdgeIds) {
        const deletedEdge = lastSavedSnapshot.edges.find(
          (candidate) => candidate.id === edgeId,
        );
        const alreadyCascaded =
          deletedEdge &&
          (deletedNodeIds.has(deletedEdge.fromNodeId) ||
            deletedNodeIds.has(deletedEdge.toNodeId));
        if (alreadyCascaded) continue;

        const { error } = await disconnectEdge({ edgeId });
        if (error) throw new Error(error);
      }

      const resolvedNodes: CanvasNode[] = nodes.map((canvasNode) => {
        const realId = realNodeIdByTempId.get(canvasNode.id) ?? canvasNode.id;
        return {
          ...canvasNode,
          id: realId,
          data: {
            node: { ...canvasNode.data.node, id: realId } as FlowNode,
            isNew: false,
          },
        };
      });

      const resolvedEdges: CanvasEdge[] = edges.map((edge) => ({
        ...edge,
        source: realNodeIdByTempId.get(edge.source) ?? edge.source,
        target: realNodeIdByTempId.get(edge.target) ?? edge.target,
        isNew: false,
      }));

      setNodes(resolvedNodes);
      setEdges(resolvedEdges);
      setDeletedNodeIds(new Set());
      setDeletedEdgeIds(new Set());
      setIsDirty(false);

      setSelectedNodeId((current) =>
        current ? (realNodeIdByTempId.get(current) ?? current) : current,
      );

      savedSnapshotRef.current = {
        flow: { ...lastSavedSnapshot.flow, name: flowName },
        nodes: resolvedNodes.map((canvasNode) => ({
          ...canvasNode.data.node,
          positionX: canvasNode.position.x,
          positionY: canvasNode.position.y,
        })),
        edges: resolvedEdges.map((edge) => ({
          id: edge.id,
          flowId,
          userId: '',
          fromNodeId: edge.source,
          fromSlot: 'out',
          toNodeId: edge.target,
          toSlot: 'in',
          createdAt: '',
        })),
      };

      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Unknown server error',
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [deletedEdgeIds, deletedNodeIds, edges, flowId, flowName, nodes]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;

  return {
    nodes,
    edges,
    flowName,
    handleFlowRename,
    handleAddNode,
    handleDeleteNode,
    handleNodesChange,
    handleUpdateNodeData,
    handleAddEdge,
    handleDeleteEdge,
    handleEdgesChange,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    isLocked,
    setIsLocked,
    isDirty,
    isSaving,
    handleSave,
    saveError,
  };
}
