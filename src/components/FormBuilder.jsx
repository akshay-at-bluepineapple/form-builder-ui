import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Toolbox from "./Toolbox";
import DroppableColumn from "./DroppableColumn";
import DraggableField from "./DraggableField";
import FieldEditorModal from "./FieldEditorModal";
import JsonModal from "./JsonModal";
import FormPreview from "./FormPreview";

export default function FormBuilder() {
  const [sections, setSections] = useState([
    {
      id: "section-1",
      name: "Section 1",
      collapsed: false,
      rows: [
        {
          id: "row-1",
          columns: [{ id: "col-1", fields: [] }],
        },
      ],
    },
  ]);
  const [activeSection, setActiveSection] = useState("section-1");
  const [draggedToolboxField, setDraggedToolboxField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [tempSectionName, setTempSectionName] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showToolbox, setShowToolbox] = useState(true);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (isMobileView) {
      setShowToolbox(false);
    } else {
      setShowToolbox(true);
    }
  }, [isMobileView]);

  const updateField = (updatedField) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== activeSection) return section;
        return {
          ...section,
          rows: section.rows.map((row) => ({
            ...row,
            columns: row.columns.map((col) => ({
              ...col,
              fields: col.fields.map((f) =>
                f.id === updatedField.id ? updatedField : f
              ),
            })),
          })),
        };
      })
    );
  };

  const deleteField = (fieldId, rowId, colId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== activeSection
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : {
                      ...row,
                      columns: row.columns.map((col) =>
                        col.id === colId
                          ? {
                              ...col,
                              fields: col.fields.filter(
                                (f) => f.id !== fieldId
                              ),
                            }
                          : col
                      ),
                    }
              ),
            }
      )
    );
  };

  const addFieldToColumn = (field, rowId, colId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== activeSection
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : {
                      ...row,
                      columns: row.columns.map((col) =>
                        col.id === colId
                          ? {
                              ...col,
                              fields: [
                                ...col.fields,
                                {
                                  ...field,
                                  id: `${field.type || field.id}-${Date.now()}`,
                                },
                              ],
                            }
                          : col
                      ),
                    }
              ),
            }
      )
    );
  };

  const addNewSection = () => {
    const id = `section-${Date.now()}`;
    setSections([
      ...sections,
      {
        id,
        name: `Section ${sections.length + 1}`,
        collapsed: false,
        rows: [
          {
            id: `row-${Date.now()}`,
            columns: [{ id: `col-${Date.now()}`, fields: [] }],
          },
        ],
      },
    ]);
    setActiveSection(id);
  };

  const updateSectionName = (id, name) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, name } : section
      )
    );
    setEditingSectionId(null);
  };

  const cancelSectionEdit = () => {
    setEditingSectionId(null);
    setTempSectionName("");
  };

  const addNewRow = () => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== activeSection
          ? section
          : {
              ...section,
              rows: [
                ...section.rows,
                {
                  id: `row-${Date.now()}`,
                  columns: [{ id: `col-${Date.now()}`, fields: [] }],
                },
              ],
            }
      )
    );
  };

  const addNewColumn = (rowId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== activeSection
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.id !== rowId || row.columns.length >= 3
                  ? row
                  : {
                      ...row,
                      columns: [
                        ...row.columns,
                        { id: `col-${Date.now()}`, fields: [] },
                      ],
                    }
              ),
            }
      )
    );
  };

  const deleteColumn = (rowId, colId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== activeSection
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.id !== rowId
                  ? row
                  : {
                      ...row,
                      columns: row.columns.filter((col) => col.id !== colId),
                    }
              ),
            }
      )
    );
  };

  const toggleSectionCollapse = (sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, collapsed: !section.collapsed }
          : section
      )
    );
  };

  const getColumnWidth = (columnsCount) => {
    if (isMobileView) {
      return "w-full";
    }

    switch (columnsCount) {
      case 1:
        return "w-full";
      case 2:
        return "sm:w-1/2 w-full";
      case 3:
        return "lg:w-1/3 md:w-1/2 w-full";
      default:
        return "w-full";
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {isMobileView && (
        <button
          onClick={() => setShowToolbox(!showToolbox)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {showToolbox ? "✕" : "🧰"}
        </button>
      )}
      {(showToolbox || !isMobileView) && (
        <div
          className={`${
            isMobileView
              ? "fixed inset-0 z-40 bg-white p-4 overflow-auto"
              : "w-64"
          }`}
        >
          <Toolbox
            onDragStart={setDraggedToolboxField}
            onDragEnd={() => setDraggedToolboxField(null)}
            onAddSection={addNewSection}
            isMobileView={isMobileView}
            onClose={isMobileView ? () => setShowToolbox(false) : undefined}
          />
        </div>
      )}
      <div
        className={`flex-1 p-4 md:p-6 overflow-auto ${
          isMobileView && showToolbox ? "hidden" : "block"
        }`}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex pb-2 max-w-full">
            {sections.map((section) => (
              <div key={section.id} className="relative flex-shrink-0 space-x-8">
                {editingSectionId === section.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={tempSectionName}
                    onChange={(e) => setTempSectionName(e.target.value)}
                    onBlur={() =>
                      updateSectionName(section.id, tempSectionName)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        updateSectionName(section.id, tempSectionName);
                      if (e.key === "Escape") cancelSectionEdit();
                    }}
                    className="px-3 py-1 rounded border text-sm"
                  />
                ) : (
                  <button
                    onClick={() => setActiveSection(section.id)}
                    onDoubleClick={() => {
                      setEditingSectionId(section.id);
                      setTempSectionName(section.name);
                    }}
                    className={`px-3 py-1 rounded whitespace-nowrap ${
                      section.id === activeSection
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {section.name}
                  </button>
                )}
                <button
                  onClick={() => toggleSectionCollapse(section.id)}
                  className="absolute right-2 -top-2 text-sm text-gray-500 hover:text-black"
                >
                  {section.collapsed ? "➕" : "➖"}
                </button>
              </div>
            ))}
          </div>
          <div className="flex ml-auto gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="ml-auto bg-yellow-600 text-white px-2 h-10 rounded text-sm md:text-base"
            >
              {previewMode ? "🛠 Back to Builder" : "👁 Preview"}
            </button>
            <button
              onClick={() => setShowJson(true)}
              className="bg-gray-700 text-white px-2 rounded h-10 text-sm md:text-base"
            >
              📋 Show JSON
            </button>
          </div>
        </div>

        {!previewMode ? (
          <>
            {sections
              .find((s) => s.id === activeSection && !s.collapsed)
              ?.rows.map((row) => (
                <div key={row.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    {/* <h3 className="text-sm font-medium text-gray-500">Row: {row.id}</h3> */}
                    <button
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                      disabled={row.columns.length >= 3}
                      onClick={() => addNewColumn(row.id)}
                    >
                      + Column
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    {row.columns.map((col) => {
                      const colWidth = getColumnWidth(row.columns.length);
                      return (
                        <div
                          key={col.id}
                          className={`${colWidth} relative rounded pt-6 mb-4 md:mb-0`}
                        >
                          <DndContext
                            onDragEnd={(e) => {
                              const { active, over } = e;
                              if (active && over && active.id !== over.id) {
                                const fieldIds = col.fields.map((f) => f.id);
                                const from = fieldIds.indexOf(active.id);
                                const to = fieldIds.indexOf(over.id);
                                if (from >= 0 && to >= 0) {
                                  setSections((prev) =>
                                    prev.map((section) =>
                                      section.id !== activeSection
                                        ? section
                                        : {
                                            ...section,
                                            rows: section.rows.map((r) =>
                                              r.id !== row.id
                                                ? r
                                                : {
                                                    ...r,
                                                    columns: r.columns.map(
                                                      (c) =>
                                                        c.id === col.id
                                                          ? {
                                                              ...c,
                                                              fields: arrayMove(
                                                                c.fields,
                                                                from,
                                                                to
                                                              ),
                                                            }
                                                          : c
                                                    ),
                                                  }
                                            ),
                                          }
                                    )
                                  );
                                }
                              } else if (draggedToolboxField) {
                                addFieldToColumn(
                                  draggedToolboxField,
                                  row.id,
                                  col.id
                                );
                              }
                            }}
                          >
                            <SortableContext
                              items={col.fields.map((f) => f.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <button
                                onClick={() => deleteColumn(row.id, col.id)}
                                className="absolute top-1 right-0 text-xs text-red-500 hover:text-red-700 group-hover:block z-10 bg-white rounded-full px-1"
                                title="Delete column"
                              >
                                ❌
                              </button>
                              <DroppableColumn
                                id={`drop-${col.id}`}
                                rowId={row.id}
                                colId={col.id}
                                draggedToolboxField={draggedToolboxField}
                                onDropToolboxField={addFieldToColumn}
                              >
                                {col.fields.map((field) => (
                                  <DraggableField
                                    key={field.id}
                                    field={field}
                                    onClick={() => setEditingField(field)}
                                    onDelete={() =>
                                      deleteField(field.id, row.id, col.id)
                                    }
                                    className="mt-2"
                                  />
                                ))}
                              </DroppableColumn>
                            </SortableContext>
                          </DndContext>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            <button
              onClick={addNewRow}
              className="bg-green-700 text-white px-4 py-2 rounded"
            >
              + Add Row
            </button>
          </>
        ) : (
          <>
            <FormPreview
              sections={sections}
              getColumnWidth={getColumnWidth}
              isMobileView={isMobileView}
            />
          </>
        )}
      </div>

      {editingField && (
        <FieldEditorModal
          field={editingField}
          onClose={() => setEditingField(null)}
          onSave={(updated) => {
            updateField(updated);
            setEditingField(null);
          }}
        />
      )}

      {showJson && (
        <JsonModal sections={sections} onClose={() => setShowJson(false)} />
      )}
    </div>
  );
}
