import React from 'react';

const TOOLBOX_FIELDS = [
  { id: 'label', label: 'Label', type: 'label' },
  { id: 'text', label: 'Text Input', type: 'text' },
  { id: 'checkbox', label: 'Checkbox', type: 'checkbox' },
  { id: 'date', label: 'Date Picker', type: 'date' },
];

export default function Toolbox({ onDragStart, onDragEnd, onAddSection }) {
  return (
    <div className="w-full md:w-64 p-4 bg-gray-100 border-b md:border-b-0 md:border-r">
      <h2 className="text-lg font-bold mb-4">Toolbox</h2>
      {TOOLBOX_FIELDS.map(field => (
        <div
          key={field.id}
          className="cursor-move bg-white border p-2 rounded mb-2 shadow-sm"
          draggable
          onDragStart={() => onDragStart(field)}
          onDragEnd={onDragEnd}
        >
          {field.label}
        </div>
      ))}
      <button
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded"
        onClick={onAddSection}
      >
        + Add Section
      </button>
    </div>
  );
}
