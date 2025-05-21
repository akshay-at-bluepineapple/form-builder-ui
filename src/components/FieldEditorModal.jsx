import React, { useState } from 'react';

export default function FieldEditorModal({ field, onClose, onSave }) {
  const [localField, setLocalField] = useState({ ...field });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Edit Field</h2>
        <label className="block mb-2 text-sm font-medium">Label</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={localField.label}
          onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
        />
        <label className="block mb-2 text-sm font-medium">Placeholder</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={localField.placeholder || ''}
          onChange={(e) => setLocalField({ ...localField, placeholder: e.target.value })}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSave(localField)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
