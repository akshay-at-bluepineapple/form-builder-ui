import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableField({ field, onClick, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative p-2 bg-white rounded-lg mb-2 cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 text-xs text-red-500 hover:text-red-700 group-hover:block"
      >
        ❌
      </button>
      <div onClick={onClick} className="pr-4">
        {field.label}
      </div>
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-1 right-1 text-xs cursor-move text-gray-400 hover:text-gray-600"
        title="Drag"
      >
        ☰
      </div>
    </div>
  );
}
