import React, { useEffect, useMemo, useState } from 'react';
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
import { usePut } from '../hooks/usePut';
import { usePost } from '../hooks/usePost';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

export default function FormBuilderViewEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPreview = location.state?.preview;
  const mode = location.state?.create;
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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // New states for table dropdown functionality
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(formData.table_name || '');
  const [tableFields, setTableFields] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

  const [formMetadata, setFormMetadata] = useState({
    form_name: formData.form_name || '',
    table_name: formData.table_name || 'product_product',
    submit_api_route: formData.submit_api_route || 'https://submit.com/form/',
  });
  const { put } = usePut(
    `http://localhost:8000/api/v1/form/create-update/${formData?.id}/`
  );

  const { put: putFieldValues } = usePut(
    `http://localhost:8000/api/v1/form/field-values-submission/`
  );

  const { post } = usePost(`http://localhost:8000/api/v1/form/create/`);

  const { post: postFieldValues } = usePost(
    'http://localhost:8000/api/v1/form/field-values-submission/'
  );

  const { data: tableData } = useFetch(
    formData?.table_name
      ? `http://localhost:8000/api/v1/tables/${formData.table_name}/data/`
      : null
  );

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      // const response = await fetch('http://localhost:8000/api/v1/tables/');
      const response = await fetch(
        'http://localhost:8000/api/v1/tables/empty/'
      );
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data = await response.json();
      setTables(data?.tables || data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setErrorMessage('Failed to fetch tables');
      setTimeout(() => setErrorMessage(''), 2000);
    } finally {
      setLoadingTables(false);
    }
  };

  // Custom fetch functions for fields
  const fetchTableFields = async (tableName) => {
    if (!tableName) return;
    setLoadingFields(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/tables/${tableName}/fields/`
      );
      if (!response.ok) throw new Error('Failed to fetch table fields');
      const data = await response.json();
      setTableFields(data?.fields || []);
    } catch (error) {
      console.error('Error fetching table fields:', error);
      setErrorMessage('Failed to fetch table fields');
      setTimeout(() => setErrorMessage(''), 2000);
    } finally {
      setLoadingFields(false);
    }
  };

  // Function to convert database field type to form field type
  const convertDbTypeToFieldType = (dbType) => {
    const type = dbType.toLowerCase();
    if (type.includes('tinyint') || type.includes('boolean')) return 'radio';
    if (
      type.includes('decimal') ||
      type.includes('float') ||
      type.includes('double')
    )
      return 'number';
    if (type.includes('varchar') || type.includes('char')) return 'text';
    if (type.includes('text') || type.includes('longtext')) return 'textarea';
    if (type.includes('int') || type.includes('bigint')) return 'number';

    if (type.includes('date') && !type.includes('time')) return 'date';
    if (type.includes('datetime') || type.includes('timestamp'))
      return 'datetime';
    if (type.includes('time')) return 'time';
    if (type.includes('email')) return 'email';
    return 'text';
  };

  const convertedTableFields = useMemo(() => {
    if (
      !tableFields ||
      !Array.isArray(tableFields) ||
      tableFields.length === 0
    ) {
      return [];
    }
    return tableFields
      .map((field) => {
        if (!field || !field.name) {
          console.warn('Invalid field structure:', field);
          return null;
        }
        return {
          type: convertDbTypeToFieldType(field.type || 'text'),
          field_type: convertDbTypeToFieldType(field.type || 'text'),
          label: field.name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          db_column_name: field.name,
          required: field.required === 'YES',
          data_type: field.type || 'varchar(255)',
          isFromDatabase: true,
        };
      })
      .filter(Boolean);
  }, [tableFields]);

  useEffect(() => {
    if (sections.length > 0 && !sections.find((s) => s.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableFields(selectedTable);
    } else {
      setTableFields([]);
    }
  }, [selectedTable]);

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

  const handleTableChange = (e) => {
    const tableName = e.target.value;
    setSelectedTable(tableName);
    setFormMetadata((prev) => ({
      ...prev,
      table_name: tableName,
    }));
  };

  const getDataTypeFromFieldType = (fieldType) => {
    const typeMap = {
      text: 'varchar(255)',
      email: 'varchar(255)',
      password: 'varchar(255)',
      textarea: 'text',
      number: 'int',
      date: 'date',
      datetime: 'datetime',
      time: 'time',
      radio: 'tinyint',
      select: 'varchar(255)',
      file: 'varchar(500)',
      phone: 'varchar(20)',
      url: 'varchar(500)',
    };
    return typeMap[fieldType] || 'varchar(255)';
  };

  const getMaxLengthFromFieldType = (fieldType) => {
    const lengthMap = {
      text: 255,
      email: 255,
      password: 255,
      textarea: 1000,
      phone: 20,
      url: 500,
      select: 255,
      radio: 100,
      file: 500,
    };
    return lengthMap[fieldType] || 255;
  };

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
              fields: col.fields.map((f) => {
                if (f.id === updatedField.id) {
                  const updatedFieldData = {
                    ...f,
                    config: {
                      ...f.config,
                      ...updatedField.config,
                    },
                    label: updatedField.config?.label || f.label,
                    placeholder:
                      updatedField.config?.placeholder || f.placeholder,
                    required:
                      updatedField.config?.required !== undefined
                        ? updatedField.config.required
                        : f.required,
                  };
                  if (f.column !== undefined) {
                    updatedFieldData.column = f.column;
                  }

                  return updatedFieldData;
                }
                return f;
              }),
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
    const dbColumnName =
      field.db_column_name ||
      `${field.field_type || field.type || 'field'}_${Date.now()}`;

    const targetSection = sections.find(
      (section) => section.id === activeSection
    );
    const targetRow = targetSection?.rows.find((row) => row.id === rowId);
    const targetColumn = targetRow?.columns.find((col) => col.id === colId);

    const isExistingColumn =
      targetColumn && typeof targetColumn.id === 'number';

    const newField = {
      id: `${field.field_type || field.type || 'field'}-${Date.now()}`,
      db_column_name: dbColumnName,
      config: {
        field_type: field.field_type || field.type,
        label: field.label || `${field.field_type || field.type} Label`,
        placeholder:
          field.placeholder || `Enter ${field.field_type || field.type}`,
        required: field.required || false,
        ...(field.options && { options: field.options }),
      },
      data_type:
        field.data_type ||
        getDataTypeFromFieldType(field.field_type || field.type),
      max_length:
        field.max_length ||
        getMaxLengthFromFieldType(field.field_type || field.type),
    };

    if (isExistingColumn) {
      newField.column = targetColumn.id;
    }

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
                              fields: [...col.fields, newField],
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

  const handleFieldInputChange = (fieldId, dbColumnName, fieldValue) => {
    setFieldValues((prev) => ({
      ...prev,
      [dbColumnName]: fieldValue,
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
    navigate('/');
  };

  const handleSaveForm = async () => {
    const trimmedFormName = formMetadata.form_name.trim();

    if (!trimmedFormName) {
      setErrorMessage('Form name cannot be empty.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    if (!selectedTable) {
      setErrorMessage('Table name cannot be empty.');
      setTimeout(() => setErrorMessage(''), 2000);
      return;
    }

    const formIdFromInitialData = formData?.id;
    const isEditMode = !!formIdFromInitialData;

    let processedSections;

    if (isEditMode) {
      processedSections = sections.map((section, sectionIndex) => {
        const sectionPayload = {
          section_name: section.section_name,
          is_collapsable: section.is_collapsable,
          section_order: sectionIndex + 1,
        };
        if (typeof section.id === 'number') {
          sectionPayload.id = section.id;
        }

        sectionPayload.rows = section.rows.map((row, rowIndex) => {
          const rowPayload = {
            row_name: row.row_name || `Row ${rowIndex + 1}`,
            row_order: rowIndex + 1,
          };
          if (typeof row.id === 'number') {
            rowPayload.id = row.id;
          }

          rowPayload.columns = row.columns.map((column, colIndex) => {
            const columnPayload = {
              column_name: column.column_name || `Column ${colIndex + 1}`,
              column_order: colIndex + 1,
            };
            if (typeof column.id === 'number') {
              columnPayload.id = column.id;
            }

            columnPayload.fields = column.fields.map((field) => {
              const fieldPayload = {
                db_column_name: field.db_column_name,
                config: field.config,
                data_type: field.data_type,
                max_length: field.max_length,
              };
              if (typeof field.id === 'number') {
                fieldPayload.id = field.id;
              }
              return fieldPayload;
            });
            return columnPayload;
          });
          return rowPayload;
        });
        return sectionPayload;
      });
    } else {
      processedSections = sections.map((section, sectionIndex) => ({
        section_name: section.section_name,
        is_collapsable: section.is_collapsable,
        section_order: sectionIndex + 1,
        rows: section.rows.map((row, rowIndex) => ({
          row_name: row.row_name || `Row ${rowIndex + 1}`,
          row_order: rowIndex + 1,
          columns: row.columns.map((column, colIndex) => ({
            column_name: column.column_name || `Column ${colIndex + 1}`,
            column_order: colIndex + 1,
            fields: column.fields.map((field) => ({
              db_column_name: field.db_column_name,
              config: field.config,
              data_type: field.data_type,
              max_length: field.max_length,
            })),
          })),
        })),
      }));
    }

    const formDataToSave = {
      form_name: formMetadata.form_name,
      table_name: formMetadata.table_name,
      submit_api_route: formMetadata.submit_api_route,
      sections: processedSections,
    };

    try {
      let result;
      if (isEditMode) {
        result = await put(formDataToSave);
        setSuccessMessage('Form successfully updated!');
        if (tableData?.data?.[0]?.id) {
          await handleSubmitFilledForm();
        } else {
          if (fieldValues && Object.keys(fieldValues).length > 0) {
            const fieldValuePayload = {
              table_name: formMetadata.table_name,
              field_values: fieldValues,
            };
            await postFieldValues(fieldValuePayload);
          }
        }
      } else {
        result = await post(formDataToSave);
        setSuccessMessage('Form successfully created!');
        if (fieldValues && Object.keys(fieldValues).length > 0) {
          const fieldValuePayload = {
            table_name: formMetadata.table_name,
            field_values: fieldValues,
          };

          try {
            await postFieldValues(fieldValuePayload);
          } catch (submitError) {
            console.error(
              'Error submitting initial field values:',
              submitError
            );
          }
        }
      }

      setTimeout(() => {
        setSuccessMessage('');
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handleSubmitFilledForm = async () => {
    if (fieldValues && Object.keys(fieldValues).length > 0) {
      const updatedFieldValues = {
        ...fieldValues,
        id: tableData?.data?.[0]?.id,
      };
      const payload = {
        table_name: formMetadata.table_name,
        field_values: updatedFieldValues,
      };

      try {
        if (tableData?.data?.[0]?.id) {
          await putFieldValues(payload);
        } else {
          const fieldValuePayload = {
            table_name: formMetadata.table_name,
            field_values: fieldValues,
          };
          await postFieldValues(fieldValuePayload);
        }

        setSuccessMessage('Form values updated successfully!');
        setTimeout(() => setSuccessMessage(''), 2000);
      } catch (error) {
        console.error('Error updating field values:', error);
        setErrorMessage('Failed to update form values');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
    return;
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
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-500 text-green-700 px-4 py-2 rounded shadow-md z-50">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-500 text-red-700 px-4 py-2 rounded shadow-md z-50">
          {errorMessage}
        </div>
      )}
      {isMobileView && (
        <button
          onClick={() => setShowToolbox(!showToolbox)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {showToolbox ? '✕' : '🧰'}
        </button>
      )}
      {(showToolbox || !isMobileView) && !previewMode && (
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
            tableFields={convertedTableFields}
          />
        </div>
      )}
      <div
        className={`flex-1 p-4 overflow-auto ${
          isMobileView && showToolbox ? 'hidden' : 'block'
        }`}
      >
        <div className="mb-4 border-b border-gray-300 pb-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center">
              <label htmlFor="form-name" className="text-sm font-semibold mr-2">
                Form Name :
              </label>
              {!isPreview ? (
                <input
                  id="form-name"
                  type="text"
                  value={formMetadata.form_name}
                  onChange={(e) =>
                    setFormMetadata((prev) => ({
                      ...prev,
                      form_name: e.target.value,
                    }))
                  }
                  placeholder="Enter form name"
                  className="border px-3 py-1.5 rounded text-sm"
                />
              ) : (
                <span className="px-3 py-1 bg-gray-100 rounded w-full md:w-1/3 text-sm text-gray-700">
                  {formMetadata.form_name}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <label
                htmlFor="table-select"
                className="text-sm font-semibold mr-2"
              >
                Table :
              </label>
              {mode ? (
                <select
                  id="table-select"
                  value={selectedTable}
                  onChange={handleTableChange}
                  disabled={loadingTables}
                  className="border px-3 py-1.5 rounded text-sm min-w-32"
                >
                  <option value="">
                    {loadingTables ? 'Loading tables...' : 'Select Table'}
                  </option>
                  {tables?.map((table) => {
                    const tableName = table.name || table;
                    const label = tableName
                      .split('_')
                      .pop()
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <option key={tableName} value={tableName}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700">
                  {selectedTable || 'No table selected'}
                </span>
              )}
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`${
                  location.state?.preview ? 'hidden' : ''
                } bg-yellow-600 text-white px-3 py-1.5 rounded text-sm md:text-base`}
              >
                {previewMode ? 'Back to Builder' : 'Preview'}
              </button>
              <button
                onClick={() => setShowJson(true)}
                className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm md:text-base hidden"
              >
                📋 Show JSON
              </button>
              <button
                onClick={handleCancelForm}
                className="bg-gray-500 text-white px-4 py-1.5 rounded hover:bg-gray-600 text-sm md:text-base"
              >
                {location.state?.preview ? 'Back' : 'Cancel'}
              </button>
              <button
                onClick={
                  !previewMode || !mode
                    ? handleSaveForm
                    : handleSubmitFilledForm
                }
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm md:text-base"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {!previewMode && (
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
                    className="text-red-600 text-sm hover:text-red-700 mr-2 mt-4"
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
          </div>
        )}

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
          </>
        ) : (
          <>
            <FormPreview
              sections={sections}
              getColumnWidth={getColumnWidth}
              fieldValues={fieldValues}
              handleFieldInputChange={handleFieldInputChange}
              tableData={tableData}
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
