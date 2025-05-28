import React from "react";

export default function JsonModal({ sections, onClose, fieldValues }) {
  const structure = {
    submitApiRoute: "/api/form-submit",
    sections: sections.map((section) => ({
      sectionName: section.name,
      collapsable: true,
      rows: section.rows.map((row) => ({
        rowId: row.id,
        rowName: row.id,
        columns: row.columns.map((col) => ({
          fields: col.fields.map((field) => ({
            type: field.type || field.id,
            label: field.label || "",
            placeholder: field.placeholder || "",
            required: field.required || false,
            value: fieldValues[field.id] ?? '',
          })),
        })),
      })),
    })),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-2xl relative">
        <h2 className="text-lg font-bold mb-4">Form JSON</h2>
        <textarea
          readOnly
          className="w-full h-80 p-2 border rounded font-mono text-sm"
          value={JSON.stringify(structure, null, 2)}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Close
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(structure, null, 2));
              alert("Copied to clipboard!");
            }}
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
}
