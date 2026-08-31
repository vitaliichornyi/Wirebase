'use client';

import { createContext, useContext } from 'react';

interface ContextValue {
  flowName: string;
  handleFlowRename: (name: string) => void;
  isLocked: boolean;
  toggleLock: () => void;
  isDirty: boolean;
  isSaving: boolean;
  handleSave: () => void;
  onSelectNode: (nodeId: string) => void;
}

interface CanvasContextProviderProps {
  children: React.ReactNode;
  value: ContextValue;
}

const CanvasContext = createContext<ContextValue | null>(null);

export function CanvasContextProvider({
  children,
  value,
}: CanvasContextProviderProps) {
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasContextProvider');
  }
  return context;
}
