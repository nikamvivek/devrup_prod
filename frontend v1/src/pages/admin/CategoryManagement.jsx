// src/pages/admin/CategoryManagement.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import { 
  Folder, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader,
  Save,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' 
    ? 'bg-green-500' 
    : type === 'error' 
      ? 'bg-red-500' 
      : type === 'info' 
        ? 'bg-blue-500' 
        : 'bg-gray-700';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-white ${bgColor} rounded-lg shadow-lg transition-all duration-300 transform translate-x-0`}>
      {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
      {type === 'info' && <Folder className="w-5 h-5 mr-2" />}
      <div className="text-sm font-medium mr-3">{message}</div>
      <button 
        onClick={onClose} 
        className="ml-auto -mx-1.5 -my-1.5 bg-white bg-opacity-10 text-white rounded-lg p-1.5 hover:bg-opacity-20 inline-flex h-6 w-6 items-center justify-center"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

// Custom delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, categoryName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Category</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete "<span className="font-medium text-gray-700">{categoryName}</span>"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DebugModal = ({ isOpen, onClose, apiData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <Folder className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">API Response Debug</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Examine the raw API response data to help troubleshoot issues.
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="ml-auto -mx-1.5 -my-1.5 bg-white bg-opacity-10 text-gray-500 rounded-lg p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-lg overflow-auto max-h-[60vh]">
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-2">Response Type:</div>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {typeof apiData}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-2">Is Array:</div>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                  {Array.isArray(apiData) ? 'true' : 'false'}
                </div>
              </div>
              
              {apiData && typeof apiData === 'object' && !Array.isArray(apiData) && (
                <div className="mb-4">
                  <div className="font-medium text-gray-700 mb-2">Object Keys:</div>
                  <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                    {Object.keys(apiData).join(', ')}
                  </div>
                </div>
              )}
              
              <div>
                <div className="font-medium text-gray-700 mb-2">Response JSON:</div>
                <pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-auto">
                  {JSON.stringify(apiData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    is_active: true,
    image: null,       // for image file
    display_order: 0,  // for display order number
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });
  const [debugModal, setDebugModal] = useState({
    isOpen: false,
    apiData: null
  });
  const { getToken } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getAllCategories();
      setDebugModal(prev => ({ ...prev, apiData: data }));

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && data.results && Array.isArray(data.results)) {
        setCategories(data.results);
      } else {
        setToast({ message: 'Received data in an unexpected format.', type: 'error' });
        setCategories([]);
      }
      setLoading(false);
    } catch (err) {
      setToast({ message: 'Failed to load categories. Please try again.', type: 'error' });
      setLoading(false);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked
             : type === 'file' ? files[0]
             : type === 'number' ? Number(value)
             : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('parent', formData.parent || '');
      payload.append('is_active', formData.is_active);
      payload.append('display_order', formData.display_order);
      if (formData.image) {
        payload.append('image', formData.image);
      }
      if (editingId) {
        response = await adminService.updateCategory(editingId, payload);
        setCategories(categories.map(category => 
          category.id === editingId ? response : category
        ));
        setToast({ message: 'Category updated successfully!', type: 'success' });
      } else {
        response = await adminService.createCategory(payload);
        setCategories([...categories, response]);
        setToast({ message: 'Category created successfully!', type: 'success' });
      }

      resetForm();
    } catch (err) {
      setToast({ message: 'Failed to save category. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      parent: category.parent || '',
      is_active: category.is_active,
      display_order: category.display_order || 0,
      image: null,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: null,
      categoryName: ''
    });
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteCategory(deleteModal.categoryId);
      setCategories(categories.filter(category => category.id !== deleteModal.categoryId));
      setToast({ message: 'Category deleted successfully', type: 'success' });
      closeDeleteModal();
    } catch (err) {
      setToast({ message: 'Failed to delete category. Please try again.', type: 'error' });
      closeDeleteModal();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent: '',
      is_active: true,
      image: null,
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toggleCategoryStatus = async (id, currentStatus) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) {
        return;
      }
      const updateData = new FormData();
      updateData.append('name', category.name);
      updateData.append('parent', category.parent || '');
      updateData.append('is_active', !currentStatus);
      updateData.append('display_order', category.display_order || 0);
      if (category.image) {
        // Note: image object not available here; usually backend keeps previous image on update if not replaced
      }

      const response = await adminService.updateCategory(id, updateData);
      setCategories(categories.map(cat => cat.id === id ? response : cat));
      setToast({ message: `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update category status. Please try again.', type: 'error' });
    }
  };

  const getParentOptions = () => {
    if (!Array.isArray(categories)) return [];
    return categories.filter(category => !editingId || category.id !== editingId);
  };

  const openDebugModal = () => {
    setDebugModal(prev => ({ ...prev, isOpen: true }));
  };

  const closeDebugModal = () => {
    setDebugModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <AdminLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        categoryName={deleteModal.categoryName}
      />
      
      <DebugModal 
        isOpen={debugModal.isOpen}
        onClose={closeDebugModal}
        apiData={debugModal.apiData}
      />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Folder className="mr-3 h-8 w-8 text-blue-500" />
            Category Management
          </h1>
          <p className="text-gray-600 ml-11">Manage product categories</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchCategories();
            }}
            className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-all duration-200 flex items-center"
            title="Refresh Categories"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-sm"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add New Category
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            {editingId ? (
              <>
                <Pencil className="h-5 w-5 mr-2 text-blue-500" />
                Edit Category
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2 text-blue-500" />
                Create New Category
              </>
            )}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name*
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  name="parent"
                  value={formData.parent}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">None (Top Level)</option>
                  {getParentOptions().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full"
                />
                {formData.image && (
                  <img 
                    src={URL.createObjectURL(formData.image)} 
                    alt="Preview" 
                    className="mt-2 max-h-32"
                  />
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center text-gray-700 rounded-lg border border-gray-200 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 flex items-center">
                    {formData.is_active ? (
                      <ToggleRight className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    <span>{formData.is_active ? "Active" : "Inactive"}</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center shadow-sm"
              >
                <Save className="w-5 h-5 mr-2" />
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-10 w-10 text-blue-500 mr-3" />
          <span className="text-lg font-medium text-gray-700">Loading categories...</span>
        </div>
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(categories) || categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Folder className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium mb-2">No categories found</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Category
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const parentCategory = Array.isArray(categories) 
                    ? categories.find(c => c.id === category.parent) 
                    : null;
                  
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Folder className="h-5 w-5 text-blue-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {parentCategory ? parentCategory.name : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{category.display_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-medium rounded-full ${
                          category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.is_active ? 
                            <CheckCircle className="w-3 h-3 mr-1" /> : 
                            <X className="w-3 h-3 mr-1" />
                          }
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(category)}
                            className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 transition-colors duration-150"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                            className={`inline-flex items-center px-2 py-1 ${
                              category.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'
                            } transition-colors duration-150`}
                          >
                            {category.is_active ? 
                              <ToggleRight className="h-4 w-4 mr-1" /> : 
                              <ToggleLeft className="h-4 w-4 mr-1" />
                            }
                            {category.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => openDeleteModal(category.id, category.name)}
                            className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800 transition-colors duration-150"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default CategoryManagement;
