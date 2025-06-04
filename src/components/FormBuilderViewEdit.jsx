import React, { useEffect, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Toolbox from './Toolbox';
import DroppableColumn from './DroppableColumn';
import DraggableField from './DraggableField';
import FieldEditorModal from './FieldEditorModal';
import JsonModal from './JsonModal';
import { useLocation } from 'react-router-dom';
import FormPreview from './FormPreview';

export default function FormBuilderViewEdit() {
  const location = useLocation();
  const isPreview = location.state?.preview;
  const formData = location.state?.form || {};
  const [sections, setSections] = useState(formData.sections || []);

  const [activeSection, setActiveSection] = useState(() => {
    return formData.sections && formData.sections.length > 0
      ? formData.sections[0].id
      : null;
  });

  const [draggedToolboxField, setDraggedToolboxField] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [previewMode, setPreviewMode] = useState(isPreview || false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [tempSectionName, setTempSectionName] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showToolbox, setShowToolbox] = useState(true);
  const [fieldValues, setFieldValues] = useState({});
  const [formName, setFormName] = useState(formData.form_name || '');

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
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
                                  id: `${field.field_type || field.id}-${Date.now()}`,
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
        section_name: `Section ${sections.length + 1}`,
        is_collapsable: false,
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

  const deleteSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));

    if (activeSection === sectionId) {
      const remaining = sections.filter((s) => s.id !== sectionId);
      setActiveSection(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateSectionName = (id, name) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, section_name: name } : section
      )
    );
    setEditingSectionId(null);
  };

  const cancelSectionEdit = () => {
    setEditingSectionId(null);
    setTempSectionName('');
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

  const handleFieldInputChange = (fieldId, fieldValue) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: fieldValue,
    }));
  };

  const toggleSectionCollapse = (sectionId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, is_collapsable: !section.is_collapsable }
          : section
      )
    );
  };

  const handleCancelForm = () => {
    console.log('Cancelled');
  };

  const handleSaveForm = () => {
    const formData = {
      sections,
      fieldValues,
    };
    console.log('Form saved:', formData);
  };

  const getColumnWidth = (columnsCount) => {
    if (isMobileView) {
      return 'w-full';
    }

    switch (columnsCount) {
      case 1:
        return 'w-full';
      case 2:
        return 'sm:w-1/2 w-full';
      case 3:
        return 'lg:w-1/3 md:w-1/2 w-full';
      default:
        return 'w-full';
    }
  };

  useEffect(() => {
    if (sections.length > 0 && !sections.find((s) => s.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {isMobileView && (
        <button
          onClick={() => setShowToolbox(!showToolbox)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {showToolbox ? '✕' : '🧰'}
        </button>
      )}
      {(showToolbox || !isMobileView) && (
        <div
          className={`${
            isMobileView
              ? 'fixed inset-0 z-40 bg-white p-4 overflow-auto'
              : 'w-64'
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
          isMobileView && showToolbox ? 'hidden' : 'block'
        }`}
      >
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="form-name" className="text-sm font-semibold">
            Form Name:
          </label>
          <input
            id="form-name"
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Enter form name"
            className="border px-3 py-1 rounded w-full md:w-1/3 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex pb-2 max-w-full overflow-x-auto space-x-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="relative flex items-center space-x-1 bg-gray-100 rounded px-2 py-1 mr-2"
              >
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
                      if (e.key === 'Enter')
                        updateSectionName(section.id, tempSectionName);
                      if (e.key === 'Escape') cancelSectionEdit();
                    }}
                    className="px-3 py-1 rounded border text-sm"
                  />
                ) : (
                  <button
                    onClick={() => setActiveSection(section.id)}
                    onDoubleClick={() => {
                      setEditingSectionId(section.id);
                      setTempSectionName(section.section_name);
                    }}
                    className={`px-3 py-1 rounded whitespace-nowrap ${
                      section.id === activeSection
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {section.section_name}
                  </button>
                )}
                <button
                  onClick={() => deleteSection(section.id)}
                  className="text-red-600 text-sm hover:text-red-700 mr-2 mt-4 text-xs"
                  title="Delete section"
                >
                  ❌
                </button>
                <button
                  onClick={() => toggleSectionCollapse(section.id)}
                  className="absolute right-[14px] -top-0 text-sm text-gray-500 hover:text-black"
                >
                  {section.is_collapsable ? '➕' : '➖'}
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="ml-auto bg-yellow-600 text-white px-2 h-10 rounded text-sm md:text-base"
          >
            {previewMode ? '🛠 Back to Builder' : '👁 Preview'}
          </button>
          <button
            onClick={() => setShowJson(true)}
            className="bg-gray-700 text-white px-2 rounded h-10 text-sm md:text-base"
          >
            📋 Show JSON
          </button>
        </div>

        {!previewMode ? (
          <>
            {sections
              .find((s) => s.id === activeSection && !s.is_collapsable)
              ?.rows.map((row) => (
                <div key={row.id} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
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
                                {col.fields.map((field) => {
                                  const config = field.config
                                    ? { ...field.config, id: field.id }
                                    : { ...field, id: field.id };
                                  return (
                                    <DraggableField
                                      key={field?.id}
                                      field={config}
                                      onClick={() => setEditingField(config)}
                                      onDelete={() =>
                                        deleteField(field?.id, row.id, col.id)
                                      }
                                      className="mt-2"
                                    />
                                  );
                                })}
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
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleCancelForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveForm}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <FormPreview
              sections={sections}
              getColumnWidth={getColumnWidth}
              fieldValues={fieldValues}
              handleFieldInputChange={handleFieldInputChange}
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
        <JsonModal
          sections={sections}
          onClose={() => setShowJson(false)}
          fieldValues={fieldValues}
        />
      )}
    </div>
  );
}
