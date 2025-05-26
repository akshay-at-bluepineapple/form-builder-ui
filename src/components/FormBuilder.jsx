import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Toolbox from './Toolbox';
import DroppableColumn from './DroppableColumn';
import DraggableField from './DraggableField';
import FieldEditorModal from './FieldEditorModal';
import JsonModal from './JsonModal';
import { useLocation } from 'react-router-dom';

export default function FormBuilder() {
    const location = useLocation();
    const isPreview = location.state?.preview;
    const formData = location.state?.form || {};
    const [sections, setSections] = useState(formData.sections || []);

    // const [sections, setSections] = useState([
    //     {
    //         id: 'section-1',
    //         name: 'Section 1',
    //         collapsed: false,
    //         rows: [{
    //             id: 'row-1',
    //             columns: [{ id: 'col-1', fields: [] }]
    //         }]
    //     },
    // ]);
    // const [activeSection, setActiveSection] = useState('section-1');
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

    const updateField = (updatedField) => {
        setSections(prev =>
            prev.map(section => {
                if (section.id !== activeSection) return section;
                return {
                    ...section,
                    rows: section.rows.map(row => ({
                        ...row,
                        columns: row.columns.map(col => ({
                            ...col,
                            fields: col.fields.map(f => f.id === updatedField.id ? updatedField : f)
                        }))
                    }))
                };
            })
        );
    };

    const deleteField = (fieldId, rowId, colId) => {
        setSections(prev =>
            prev.map(section =>
                section.id !== activeSection ? section : {
                    ...section,
                    rows: section.rows.map(row =>
                        row.id !== rowId ? row : {
                            ...row,
                            columns: row.columns.map(col =>
                                col.id === colId ? {
                                    ...col,
                                    fields: col.fields.filter(f => f.id !== fieldId)
                                } : col
                            )
                        }
                    )
                }
            )
        );
    };

    const addFieldToColumn = (field, rowId, colId) => {
        setSections(prev =>
            prev.map(section =>
                section.id !== activeSection ? section : {
                    ...section,
                    rows: section.rows.map(row =>
                        row.id !== rowId ? row : {
                            ...row,
                            columns: row.columns.map(col =>
                                col.id === colId ? {
                                    ...col,
                                    fields: [...col.fields, { ...field, id: `${field.type || field.id}-${Date.now()}` }]
                                } : col
                            )
                        }
                    )
                }
            )
        );
    };

    const addNewSection = () => {
        const id = `section-${Date.now()}`;
        setSections([...sections, {
            id,
            name: `Section ${sections.length + 1}`,
            collapsed: false,
            rows: [{ id: `row-${Date.now()}`, columns: [{ id: `col-${Date.now()}`, fields: [] }] }]
        }]);
        setActiveSection(id);
    };

    const updateSectionName = (id, name) => {
        setSections(prev =>
            prev.map(section =>
                section.id === id ? { ...section, name } : section
            )
        );
        setEditingSectionId(null);
    };

    const cancelSectionEdit = () => {
        setEditingSectionId(null);
        setTempSectionName('');
    };

    const addNewRow = () => {
        setSections(prev =>
            prev.map(section =>
                section.id !== activeSection ? section : {
                    ...section,
                    rows: [...section.rows, {
                        id: `row-${Date.now()}`,
                        columns: [{ id: `col-${Date.now()}`, fields: [] }]
                    }]
                }
            )
        );
    };

    const addNewColumn = (rowId) => {
        setSections(prev =>
            prev.map(section =>
                section.id !== activeSection ? section : {
                    ...section,
                    rows: section.rows.map(row =>
                        row.id !== rowId || row.columns.length >= 3 ? row : {
                            ...row,
                            columns: [...row.columns, { id: `col-${Date.now()}`, fields: [] }]
                        }
                    )
                }
            )
        );
    };

    const deleteColumn = (rowId, colId) => {
        setSections(prev =>
            prev.map(section =>
                section.id !== activeSection ? section : {
                    ...section,
                    rows: section.rows.map(row =>
                        row.id !== rowId ? row : {
                            ...row,
                            columns: row.columns.filter(col => col.id !== colId)
                        }
                    )
                }
            )
        );
    };


    const toggleSectionCollapse = (sectionId) => {
        setSections(prev =>
            prev.map(section =>
                section.id === sectionId ? { ...section, collapsed: !section.collapsed } : section
            )
        );
    };

    React.useEffect(() => {
        if (sections.length > 0 && !sections.find(s => s.id === activeSection)) {
            setActiveSection(sections[0].id);
        }
    }, [sections, activeSection]);

    return (
        <div className="flex h-screen">
            <Toolbox
                onDragStart={setDraggedToolboxField}
                onDragEnd={() => setDraggedToolboxField(null)}
                onAddSection={addNewSection}
            />

            <div className="flex-1 p-6 overflow-auto">
                <div className="flex space-x-2 mb-4">
                    {sections.map(section => (
                        <div key={section.id} className="relative">
                            {editingSectionId === section.id ? (
                                <input
                                    type="text"
                                    autoFocus
                                    value={tempSectionName}
                                    onChange={(e) => setTempSectionName(e.target.value)}
                                    onBlur={() => updateSectionName(section.id, tempSectionName)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') updateSectionName(section.id, tempSectionName);
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
                                    className={`px-4 py-2 rounded ${section.id === activeSection
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    {section.section_name}
                                </button>
                            )}
                            <button
                                onClick={() => toggleSectionCollapse(section.id)}
                                className="absolute -right-3 -top-2 text-sm text-gray-500 hover:text-black"
                            >
                                {section.collapsed ? '➕' : '➖'}
                            </button>
                        </div>
                    ))}
                    <button onClick={() => setPreviewMode(!previewMode)} className="ml-auto bg-yellow-600 text-white px-4 py-2 rounded">
                        {previewMode ? '🛠 Back to Builder' : '👁 Preview'}
                    </button>
                    <button onClick={() => setShowJson(true)} className="bg-gray-700 text-white px-4 py-2 rounded">
                        📋 Show JSON
                    </button>
                </div>

                {!previewMode ? (
                    <>
                        {sections.find(s => s.id === activeSection && !s.collapsed)?.rows.map(row => (
                            <div key={row.id} className="mb-8">
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
                                <div className="flex gap-4">
                                    {row.columns.map(col => {
                                        const colWidth =
                                            row.columns.length === 1
                                                ? 'w-full'
                                                : row.columns.length === 2
                                                    ? 'w-1/2'
                                                    : 'w-1/3';
                                        return (<div key={col.id} className={`${colWidth} relative group rounded pt-6 px-2`}>
                                            <DndContext onDragEnd={e => {
                                                const { active, over } = e;
                                                if (active && over && active.id !== over.id) {
                                                    const fieldIds = col.fields.config.map(f => f.id);
                                                    const from = fieldIds.indexOf(active.id);
                                                    const to = fieldIds.indexOf(over.id);
                                                    if (from >= 0 && to >= 0) {
                                                        setSections(prev =>
                                                            prev.map(section =>
                                                                section.id !== activeSection ? section : {
                                                                    ...section,
                                                                    rows: section.rows.map(r =>
                                                                        r.id !== row.id ? r : {
                                                                            ...r,
                                                                            columns: r.columns.map(c =>
                                                                                c.id === col.id ? {
                                                                                    ...c,
                                                                                    fields: arrayMove(c.fields, from, to)
                                                                                } : c
                                                                            )
                                                                        }
                                                                    )
                                                                }
                                                            )
                                                        );
                                                    }
                                                } else if (draggedToolboxField) {
                                                    addFieldToColumn(draggedToolboxField, row.id, col.id);
                                                }
                                            }}>
                                                <SortableContext items={col.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                                    <button
                                                        onClick={() => deleteColumn(row.id, col.id)}
                                                        className="absolute top-1 left-1 text-xs text-red-500 hover:text-red-700 hidden group-hover:block z-10 bg-white rounded-full px-2"
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
                                                        {col.fields.map(field => (
                                                            <DraggableField
                                                                key={field.id}
                                                                field={field}
                                                                onClick={() => setEditingField(field)}
                                                                onDelete={() => deleteField(field.id, row.id, col.id)}
                                                                className="mt-2"
                                                            />
                                                        ))}
                                                    </DroppableColumn>
                                                </SortableContext>
                                            </DndContext>
                                        </div>)
                                    })}
                                </div>
                            </div>
                        ))}
                        <button onClick={addNewRow} className="bg-green-700 text-white px-4 py-2 rounded">+ Add Row</button>
                    </>
                ) : (
                    <div className="space-y-6">
                        {sections.map(section => (
                            <div key={section.id} className="bg-white p-4 rounded shadow border">
                                <h2 className="font-bold mb-2">{section.section_name}</h2>
                                {!section.collapsed && section.rows.map(row => (
                                    <div key={row.id} className="flex gap-4 mb-4">
                                        {row.columns.map(col => (
                                            <div key={col.id} className="w-1/3 space-y-3">
                                                {col.fields.map(field => (
                                                    <div key={field.id}>
                                                        <label className="block font-medium">{field.config.label}</label>
                                                        {field.config.field_type === 'text' && <input placeholder={field.config.placeholder} className="border p-1 rounded w-full" />}
                                                        {field.config.field_type === 'label' && <div>{field.config.label}</div>}
                                                        {field.config.field_type === 'checkbox' && <input type="checkbox" />}
                                                        {field.config.field_type === 'date' && <input type="date" className="border p-1 rounded" />}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
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
