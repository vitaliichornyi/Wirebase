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
import { Alert } from '@/shared/ui/alert';

const NODE_TYPES: NodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
};

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const VALIDATION_ERROR_MESSAGE = 'Add a destination URL before saving.';

interface FlowCanvasProps {
  initial: FlowWithGraph;
}

export function FlowCanvas({ initial }: FlowCanvasProps) {
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

  const displayedSaveError =
    saveError &&
    (saveError === VALIDATION_ERROR_MESSAGE
      ? saveError
      : GENERIC_ERROR_MESSAGE);

  const contextValue = useMemo(
    () => ({
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

            {displayedSaveError && (
              <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center px-4">
                <div className="pointer-events-auto w-full max-w-md">
                  <Alert message={displayedSaveError} />
                </div>
              </div>
            )}

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
