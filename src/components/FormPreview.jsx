import React from "react";

export default function FormPreview({ sections, getColumnWidth }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.id} className="bg-white p-6 md:p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 md:mb-6 text-gray-800">
            {section.name}
          </h2>
          {!section.collapsed &&
            section.rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6"
              >
                {row.columns.map((col) => {
                  const colWidth = getColumnWidth(row.columns.length);
                  return (
                    <div key={col.id} className={`${colWidth} mb-4 md:mb-0`}>
                      <div className="space-y-4">
                        {col.fields.map((field) => (
                          <div key={field.id} className="mb-2">
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function renderField(field) {
  switch (field.type) {
    case "text":
      return (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none transition-colors"
          />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center py-2">
          <div className="flex items-center h-5">
            <input
              id={field.id}
              type="checkbox"
              className="size-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <label
            htmlFor={field.id}
            className="ml-2 block text-sm text-gray-700"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      );
    case "label":
      return (
        <div className="py-2 px-1 text-gray-700 font-normal">{field.label}</div>
      );
    case "date":
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="size-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      );
    default:
      return <div className="py-2">{field.label}</div>;
  }
}
