import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import Skeleton from './Skeleton';
import { useDelete } from '../hooks/useDelete';

function FormListing() {
  const navigate = useNavigate();
  const {
    data: forms,
    loading,
    error,
    setData,
  } = useFetch('http://localhost:8000/api/v1/form/');
  const { deleteRequest } = useDelete();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const handleDelete = async () => {
    const formId = selectedForm?.id;
    const { success, error } = await deleteRequest(
      `http://localhost:8000/api/v1/form/soft-delete/${formId}/`
    );
    if (success) {
      setData((prevForms) => prevForms.filter((form) => form.id !== formId));
      setShowDeleteModal(false);
      setSelectedForm(null);
    } else {
      console.error(error);
    }
  };

  return (
    <div className="text-gray-900 bg-gray-50 min-h-screen py-4">
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-xl md:text-2xl font-semibold mb-2 md:mb-0">
            Forms
          </h1>
          <button
            onClick={() =>
              navigate('/forms/new', {
                state: { create: true },
              })
            }
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition text-sm"
          >
            Create Form
          </button>
        </div>
        {loading && (
          <div className="mt-6 px-4">
            <Skeleton rows={3} height="h-10" />
          </div>
        )}
        {error && (
          <p className="text-center mt-4 text-red-500">Error: {error}</p>
        )}
        {forms && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base border-separate border-spacing-y-2">
              <thead className="bg-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-right py-3 pr-22">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forms.map((form, index) => (
                  <tr
                    key={form.id}
                    className="bg-white hover:bg-gray-50 transition shadow rounded"
                  >
                    <td className="px-4 py-3">
                      <p className="text-md font-medium">{form.form_name}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/forms/${form.id}`, {
                              state: { preview: true, form },
                            })
                          }
                          className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-3 rounded-md transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/forms/${form.id}/edit`, {
                              state: { preview: false, form },
                            })
                          }
                          className="inline-block bg-amber-200 hover:bg-amber-300 text-amber-900 font-medium py-1 px-3 rounded-md transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedForm(form);
                            setShowDeleteModal(true);
                          }}
                          className="inline-block bg-red-400 hover:bg-red-500 text-white font-medium py-1 px-3 rounded-md transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && selectedForm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-90 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg text-center font-semibold mb-4">
              Are you sure you want to delete this {''}
              {selectedForm?.form_name} form ?
            </h2>
            <p className="mb-6 text-gray-600"></p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 w-20 text-base font-semibold bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 w-20 text-base font-semibold bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormListing;
