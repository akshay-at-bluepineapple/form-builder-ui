import React from 'react';

export default function Toolbox({
  onDragStart,
  onDragEnd,
  onAddSection,
  isMobileView,
  onClose,
  tableFields,
}) {
  return (
    <div className="h-full flex flex-col p-5 bg-gray-50 shadow-[4px_0_10px_rgba(0,0,0,0.1)]">
      {isMobileView && onClose && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-base">Fields</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
      {!isMobileView && <h2 className="font-medium text-base mb-2">Fields</h2>}
      <div className="border-b border-gray-300 pb-3 mb-3">
        <div class="relative">
          <span class="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search"
            class="pl-6 pr-2 py-1.5 border rounded-md focus:outline-none bg-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2 max-h-[82vh] overflow-y-auto">
        {tableFields?.map((field) => (
          <div
            key={field.id}
            className="cursor-move bg-white p-2 rounded shadow-md"
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
