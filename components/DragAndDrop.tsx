"use client";

import * as Dnd from '@hello-pangea/dnd';

// Re-export the core components but cast their types where necessary to avoid
// cross-package React type mismatches between different @types/react versions.
// Export as `any` to avoid incompatible React type expectations between
// different @types/react versions. This is a local, minimal workaround so
// consumer files (like TaskBoard.tsx) can use the render-props without
// spurious type errors.
export const DragDropContext: any = Dnd.DragDropContext;
export const Droppable: any = Dnd.Droppable;
export const Draggable: any = Dnd.Draggable;

export type { 
  DraggableProvided,
  DroppableProvided,
  DropResult,
  DraggableStateSnapshot,
  DroppableStateSnapshot
} from '@hello-pangea/dnd';

export default Dnd;
