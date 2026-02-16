'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Loader } from "@/utils/Loader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { addDeveloperSchema } from '@/utils/validations';
import ConfirmModal from '@/components/modals/ConfirmModal';
import GlobalHeader from '@/components/GlobalHeader';

const ManageDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector((state: any) => state.auth.token);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<number | null>(null);

  const fetchDevelopers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/get-all-developers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch developers');
      const data = await res.json();
      setDevelopers(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching developers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleAddDeveloper = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/add-developer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add developer');
      await fetchDevelopers();
      setIsAddingNew(false);
    } catch (err: any) {
      setError(err.message || 'Error adding developer');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeveloper = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/edit-developer/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update developer');
      await fetchDevelopers();
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Error updating developer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeveloper = async (developerId: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/delete-developer/${developerId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      if (!res.ok) throw new Error('Failed to delete developer');
      await fetchDevelopers();
    } catch (err: any) {
      setError(err.message || 'Error deleting developer');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setError('');
  };

  const DeveloperForm = ({ initialData = {}, onSave, onCancel, saveText = "Add Developer" }: any) => {
    const handleSubmit = (values: any) => {
      onSave(values);
    };

    return (
      <tr className="bg-blue-50">
        <td colSpan={4} className="px-6 py-4">
          <Formik
            initialValues={{
              name: initialData.name || "",
              email: initialData.email || "",
              contact: initialData.contact || "",
            }}
            validationSchema={addDeveloperSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Field
                      type="text"
                      name="name"
                      placeholder="Developer Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Field
                      type="text"
                      name="contact"
                      placeholder="Contact Number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <ErrorMessage
                      name="contact"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50"
                  >
                    <Save size={16} /> {saveText}
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </td>
      </tr>
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      <GlobalHeader title="Manage Developers" />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Developers</h1>
                <p className="text-gray-600">Add, edit, and manage your development team</p>
              </div>
              {!isAddingNew && editingId === null && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                >
                  <Plus size={20} /> Add New Developer
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <div className="text-sm font-medium">{error}</div>
              </div>
            </div>
          )}


          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>):(
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Add New Developer Form Row */}
                  {isAddingNew && (
                    <DeveloperForm
                      onSave={handleAddDeveloper}
                      onCancel={handleCancel}
                      saveText="Add Developer"
                    />
                  )}

                  {/* Developer Rows */}
                  {developers.map((dev: any) => (
                    editingId === dev.developerId ? (
                      <DeveloperForm
                        key={dev.developerId}
                        initialData={dev}
                        onSave={handleUpdateDeveloper}
                        onCancel={handleCancel}
                        saveText="Update Developer"
                      />
                    ) : (
                      <tr key={dev.developerId} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dev.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{dev.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{dev.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(dev.developerId)}
                              className="inline-flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDeveloperId(dev.developerId);
                                setShowDeleteModal(true);
                              }}
                              className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                  <ConfirmModal
                    isOpen={showDeleteModal}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this developer? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                    onCancel={() => {
                      setShowDeleteModal(false);
                      setSelectedDeveloperId(null);
                    }}
                    onConfirm={async () => {
                      if (selectedDeveloperId) {
                        await handleDeleteDeveloper(selectedDeveloperId);
                      }
                      setShowDeleteModal(false);
                      setSelectedDeveloperId(null);
                    }}
                  />
                  {/* Empty State */}
                  {!loading && developers.length === 0 && !isAddingNew && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-lg font-medium mb-2">No developers found</div>
                          <div className="text-sm">Start by adding your first developer to the team.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
            )
          }

          {/* Developers Table */}


          {/* Footer Stats */}
          </div>
        </div>
    </div>
  );
};

export default ManageDevelopers;
