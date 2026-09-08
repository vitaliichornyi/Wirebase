'use client';

import { useEffect, useMemo } from 'react';

import { ReactFlow, ReactFlowProvider, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowCanvas } from '../../hooks/use-flow-canvas';
import { CanvasContextProvider } from '../../providers/canvas-context-provider';
import { InputNode } from './nodes/input-node';
import { OutputNode } from './nodes/output-node';

import type { FlowWithGraph } from '../../types/flows';

import { BackButton } from './navigation/back-button';
import { Sidebar } from './navigation/sidebar/sidebar';
import { ZoomControls } from './navigation/zoom-controls';
import { DEMO_ACCOUNT_RESTRICTION_MESSAGE } from '@/shared/lib/demo-account';
import { toast } from '@/shared/ui/toast';

const NODE_TYPES: NodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
};

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const VALIDATION_ERROR_MESSAGE = 'Add a destination URL before saving.';

interface FlowCanvasProps {
  initial: FlowWithGraph;
  host: string;
}

export function FlowCanvas({ initial, host }: FlowCanvasProps) {
  const {
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
    setSelectedNodeId,
    isLocked,
    setIsLocked,
    isDirty,
    isSaving,
    handleSave,
    saveError,
  } = useFlowCanvas(initial);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!saveError) return;

    const displayedSaveError =
      saveError === VALIDATION_ERROR_MESSAGE ||
      saveError === DEMO_ACCOUNT_RESTRICTION_MESSAGE
        ? saveError
        : GENERIC_ERROR_MESSAGE;

    toast({
      title: 'Failed to save flow',
      description: displayedSaveError,
      type: 'error',
    });
  }, [saveError]);

  const contextValue = useMemo(
    () => ({
      host,
      flowName,
      handleFlowRename,
      isLocked,
      toggleLock: () => setIsLocked((prev) => !prev),
      isDirty,
      isSaving,
      handleSave,
      onSelectNode: setSelectedNodeId,
    }),
    [
      host,
      flowName,
      handleFlowRename,
      isLocked,
      setIsLocked,
      isDirty,
      isSaving,
      handleSave,
      setSelectedNodeId,
    ],
  );

  return (
    <ReactFlowProvider>
      <CanvasContextProvider value={contextValue}>
        <div className="fixed inset-0 bg-muted z-40">
          <div className="relative w-screen h-screen">
            <BackButton />

            <ReactFlow
              className="h-full w-full"
              nodes={nodes}
              edges={edges}
              nodeTypes={NODE_TYPES}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleAddEdge}
              onNodesDelete={(deleted) =>
                deleted.forEach((node) => handleDeleteNode(node.id))
              }
              onEdgesDelete={(deleted) =>
                deleted.forEach((edge) => handleDeleteEdge(edge.id))
              }
              onPaneClick={() => setSelectedNodeId(null)}
              nodesDraggable={!isLocked}
              nodesConnectable={!isLocked}
              elementsSelectable={!isLocked}
              proOptions={{ hideAttribution: true }}
              fitView
              fitViewOptions={{ maxZoom: 1 }}
            >
              <ZoomControls />
            </ReactFlow>
            <Sidebar
              selectedNode={selectedNode}
              onAddInput={() => handleAddNode('input', { x: 0, y: 0 })}
              onAddOutput={() => handleAddNode('output', { x: 320, y: 0 })}
              onUpdate={handleUpdateNodeData}
              onDelete={handleDeleteNode}
            />
          </div>
        </div>
      </CanvasContextProvider>
    </ReactFlowProvider>
  );
}
