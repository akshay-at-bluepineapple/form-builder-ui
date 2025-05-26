import React from "react";

const TOOLBOX_FIELDS = [
  { id: "label", label: "Label", type: "label" },
  { id: "text", label: "Text Input", type: "text" },
  { id: "checkbox", label: "Checkbox", type: "checkbox" },
  { id: "date", label: "Date Picker", type: "date" },
];

export default function Toolbox({
  onDragStart,
  onDragEnd,
  onAddSection,
  isMobileView,
  onClose,
}) {
  return (
    <div className="h-full flex flex-col p-5 bg-gray-50 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
      {isMobileView && onClose && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Toolbox</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
      {!isMobileView && <h2 className="text-lg font-bold mb-4">Toolbox</h2>}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
        {TOOLBOX_FIELDS.map((field) => (
          <div
            key={field.id}
            className="cursor-move bg-white p-2 rounded mb-2 shadow-md"
            draggable
            onDragStart={() => onDragStart(field)}
            onDragEnd={onDragEnd}
          >
            {field.label}
          </div>
        ))}
      </div>
      <button
        className="mt-auto bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        onClick={onAddSection}
      >
        + Add Section
      </button>
    </div>
  );
}
