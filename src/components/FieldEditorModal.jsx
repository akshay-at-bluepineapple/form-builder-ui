import React, { useState } from 'react';

export default function FieldEditorModal({ field, onClose, onSave }) {
  const [localField, setLocalField] = useState({
    id: field.id,
    label: field.label || field.config?.label || '',
    placeholder: field.placeholder || field.config?.placeholder || '',
    required: field.required || field.config?.required || false,
    field_type: field.field_type || field.config?.field_type || field.type,
    ...field,
  });

  const handleSave = () => {
    const updatedField = {
      ...field,
      config: {
        ...field.config,
        label: localField.label,
        placeholder: localField.placeholder,
        required: localField.required,
        field_type: field.config?.field_type || field.field_type || field.type,
      },
    };
    onSave(updatedField);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Edit Field</h2>
        <label className="block mb-2 text-sm font-medium">Label</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={localField.label}
          onChange={(e) =>
            setLocalField({ ...localField, label: e.target.value })
          }
        />
        <label className="block mb-2 text-sm font-medium">Placeholder</label>
        <input
          className="w-full border p-2 rounded mb-4"
          value={localField.placeholder || ''}
          onChange={(e) =>
            setLocalField({ ...localField, placeholder: e.target.value })
          }
        />
        <label className="block mb-2 text-sm font-medium">Required</label>
        <input
          className="mr-2"
          type="checkbox"
          checked={localField.required}
          onChange={(e) =>
            setLocalField({ ...localField, required: e.target.checked })
          }
        />
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
