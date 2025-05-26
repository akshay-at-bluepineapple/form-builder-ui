import React from "react";
import { useDroppable } from "@dnd-kit/core";

export default function DroppableColumn({
  id,
  children,
  rowId,
  colId,
  onDropToolboxField,
  draggedToolboxField,
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        if (draggedToolboxField) {
          onDropToolboxField(draggedToolboxField, rowId, colId);
        }
      }}
      className="min-h-20 p-4 shadow rounded bg-gray-100"
    >
      {children}
    </div>
  );
}
