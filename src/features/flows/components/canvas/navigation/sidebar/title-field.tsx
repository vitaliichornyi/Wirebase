'use client';

import { useState, type KeyboardEvent } from 'react';
import { useCanvas } from '@/features/flows/providers/canvas-context-provider';

import { Tooltip } from '@/shared/ui/tooltip';
import {
  InputGroup,
  InputGroupInput,
} from '@/shared/ui/primitives/input-group';

export function TitleField() {
  const { flowName, handleFlowRename } = useCanvas();
  const [name, setName] = useState(flowName);

  const handleBlur = () => {
    const enteredName = name.trim();
    if (!enteredName) {
      setName(flowName);
      return;
    }
    setName(enteredName);
    if (enteredName !== flowName) {
      handleFlowRename(enteredName);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
    if (event.key === 'Escape') {
      setName(flowName);
      event.currentTarget.blur();
    }
  };

  return (
    <Tooltip label="Change name" side="right">
      <InputGroup className="h-8 w-fit border-transparent hover:bg-muted">
        <InputGroupInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Flow name"
          className="title-small field-sizing-content min-w-8 max-w-40 px-2"
        />
      </InputGroup>
    </Tooltip>
  );
}
