// src/pages/admin/CouponManagement.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import { 
  PlusCircle, Edit2, Trash2, AlertCircle, CheckCircle, XCircle, 
  RefreshCw, AlertTriangle, Info, X, ToggleLeft, ToggleRight, Save,
  Tag, Package
} from 'lucide-react';

// Custom Toast notification component
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
      {type === 'info' && <Info className="w-5 h-5 mr-2" />}
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

// Custom confirmation modal component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-center mb-4">
          <AlertTriangle size={24} className="text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Multi-Select Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder, label, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (optionId) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  const getSelectedNames = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt.id === selected[0]);
      return option ? option.name : '';
    }
    return `${selected.length} items selected`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {Icon && <Icon size={16} />}
        {label}
      </label>
      <div
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer bg-white min-h-[42px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`${selected.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
          {getSelectedNames()}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
            ) : (
              options.map(option => (
                <div
                  key={option.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                    selected.includes(option.id) ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption(option.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    readOnly
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">{option.name}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Select multiple items. Leave empty for all {label.toLowerCase()}.
      </p>
    </div>
  );
};

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    max_discount: '',
    min_purchase_amount: '',
    valid_from: '',
    valid_to: '',
    is_active: true,
    usage_limit: 1,
    applicable_categories: [],
    applicable_products: []
  });
  const [editingId, setEditingId] = useState(null);
  const { getToken } = useAuth();
  
  // Delete confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    coupon: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchCoupons();
    fetchCategoriesAndProducts();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getAllCoupons();
      console.log('Coupons response data:', response);
      
      const couponsData = Array.isArray(response) ? response : 
                         (response && response.results ? response.results : []);
      
      console.log('Processed coupons data:', couponsData);
      setCoupons(couponsData);
      setLoading(false);
      
      if (coupons.length > 0) {
        setToast({
          message: `Refreshed ${couponsData.length} coupons successfully!`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'An unexpected error occurred.';
      
      setError(`Failed to load coupons: ${errorMessage}`);
      setLoading(false);
      setCoupons([]);
      
      setToast({
        message: `Failed to load coupons: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  const fetchCategoriesAndProducts = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await adminService.getAllCategories();
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : 
                           (categoriesResponse?.results || []);
      setCategories(categoriesData);
      console.log('Categories loaded:', categoriesData);
      
      // Fetch products
      const productsResponse = await productService.getProducts();
      const productsData = Array.isArray(productsResponse) ? productsResponse : 
                         (productsResponse?.results || []);
      setProducts(productsData);
      console.log('Products loaded:', productsData);
    } catch (error) {
      console.error('Error fetching categories/products:', error);
      setToast({
        message: 'Failed to load categories and products',
        type: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (selectedCategories) => {
    setFormData({
      ...formData,
      applicable_categories: selectedCategories
    });
  };

  const handleProductChange = (selectedProducts) => {
    setFormData({
      ...formData,
      applicable_products: selectedProducts
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Console log the form data before validation
    console.log('=== COUPON FORM SUBMISSION ===');
    console.log('Form Data:', formData);
    console.log('Selected Categories:', formData.applicable_categories);
    console.log('Selected Products:', formData.applicable_products);
    console.log('Category Names:', formData.applicable_categories.map(id => 
      categories.find(cat => cat.id === id)?.name || `ID: ${id}`
    ));
    console.log('Product Names:', formData.applicable_products.map(id => 
      products.find(prod => prod.id === id)?.name || `ID: ${id}`
    ));
    console.log('===========================');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const completeFormData = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_to: new Date(formData.valid_to).toISOString(),
        is_active: formData.is_active,
        usage_limit: parseInt(formData.usage_limit),
        applicable_categories: formData.applicable_categories,
        applicable_products: formData.applicable_products
      };

      console.log('=== PROCESSED FORM DATA FOR API ===');
      console.log('Complete Form Data:', completeFormData);
      console.log('=================================');

      let response;

      if (editingId) {
        setToast({
          message: `Updating coupon "${formData.code}"...`,
          type: 'info'
        });
        
        response = await adminService.updateCoupon(editingId, completeFormData);
        setCoupons(coupons.map(coupon => 
          coupon.id === editingId ? response : coupon
        ));
        
        setToast({
          message: `Coupon "${formData.code}" updated successfully!`,
          type: 'success'
        });
      } else {
        setToast({
          message: `Creating new coupon "${formData.code}"...`,
          type: 'info'
        });
        
        response = await adminService.createCoupon(completeFormData);
        setCoupons([response, ...coupons]);
        
        setToast({
          message: `Coupon "${formData.code}" created successfully!`,
          type: 'success'
        });
      }

      console.log('=== API RESPONSE ===');
      console.log('Response:', response);
      console.log('==================');

      resetForm();
    } catch (err) {
      console.error('Error saving coupon:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          err.message || 
                          'Failed to save coupon. Please try again.';
      
      setError(`Failed to save coupon: ${errorMessage}`);
      
      setToast({
        message: `Error ${editingId ? 'updating' : 'creating'} coupon: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  const validateForm = () => {
    console.log('=== FORM VALIDATION ===');
    console.log('Validating form data:', formData);
    
    if (!formData.code.trim()) {
      setToast({
        message: 'Coupon code is required',
        type: 'error'
      });
      return false;
    }
    
    if (!formData.discount_value || formData.discount_value <= 0) {
      setToast({
        message: 'Discount value must be greater than zero',
        type: 'error'
      });
      return false;
    }

    if (formData.discount_type === 'percent' && formData.discount_value > 100) {
      setToast({
        message: 'Percentage discount cannot exceed 100%',
        type: 'error'
      });
      return false;
    }
    
    if (!formData.valid_from || !formData.valid_to) {
      setToast({
        message: 'Valid from and Valid to dates are required',
        type: 'error'
      });
      return false;
    }
    
    if (new Date(formData.valid_to) <= new Date(formData.valid_from)) {
      setToast({
        message: 'Valid to date must be after Valid from date',
        type: 'error'
      });
      return false;
    }

    if (!formData.usage_limit || formData.usage_limit < 1) {
      setToast({
        message: 'Usage limit must be at least 1',
        type: 'error'
      });
      return false;
    }
    
    console.log('Form validation passed');
    console.log('=====================');
    return true;
  };

  const handleEdit = (coupon) => {
    console.log('=== EDITING COUPON ===');
    console.log('Coupon to edit:', coupon);
    
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount || '',
      min_purchase_amount: coupon.min_purchase_amount,
      valid_from: new Date(coupon.valid_from).toISOString().slice(0, 16),
      valid_to: new Date(coupon.valid_to).toISOString().slice(0, 16),
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit,
      applicable_categories: coupon.applicable_categories || [],
      applicable_products: coupon.applicable_products || []
    });
    setEditingId(coupon.id);
    setShowForm(true);
    
    console.log('Form data set for editing:', {
      applicable_categories: coupon.applicable_categories || [],
      applicable_products: coupon.applicable_products || []
    });
    console.log('====================');
    
    setToast({
      message: `Editing coupon "${coupon.code}"`,
      type: 'info'
    });
  };

  const openDeleteConfirmation = (coupon) => {
    setConfirmModal({
      isOpen: true,
      coupon: coupon,
      title: "Delete Coupon",
      message: `Are you sure you want to delete the coupon "${coupon.code}"? This action cannot be undone.`
    });
  };

  const handleDelete = async () => {
    const coupon = confirmModal.coupon;
    if (!coupon) return;
    
    try {
      setToast({
        message: `Deleting coupon "${coupon.code}"...`,
        type: 'info'
      });
      
      await adminService.deleteCoupon(coupon.id);
      setCoupons(coupons.filter(item => item.id !== coupon.id));
      
      setConfirmModal({ isOpen: false, coupon: null, title: '', message: '' });
      setToast({
        message: `Coupon "${coupon.code}" deleted successfully!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting coupon:', err);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete coupon. Please try again.';
      setError(`Failed to delete coupon: ${errorMessage}`);
      
      setToast({
        message: `Failed to delete coupon "${coupon.code}": ${errorMessage}`,
        type: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percent',
      discount_value: '',
      max_discount: '',
      min_purchase_amount: '',
      valid_from: '',
      valid_to: '',
      is_active: true,
      usage_limit: 1,
      applicable_categories: [],
      applicable_products: []
    });
    setEditingId(null);
    setShowForm(false);
    console.log('Form reset');
  };

  const toggleCouponStatus = async (id, currentStatus, code) => {
    try {
      console.log(`Attempting to toggle coupon ${id} from ${currentStatus} to ${!currentStatus}`);
      
      const coupon = coupons.find(c => c.id === id);
      if (!coupon) {
        console.error('Coupon not found in local state');
        return;
      }
      
      const updateData = {
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: parseFloat(coupon.discount_value),
        max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
        min_purchase_amount: parseFloat(coupon.min_purchase_amount),
        valid_from: coupon.valid_from,
        valid_to: coupon.valid_to,
        is_active: !currentStatus,
        usage_limit: parseInt(coupon.usage_limit),
        applicable_categories: coupon.applicable_categories || [],
        applicable_products: coupon.applicable_products || []
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await adminService.updateCoupon(id, updateData);
      
      console.log('Toggle response:', response);
      
      setCoupons(coupons.map(c => 
        c.id === id ? response : c
      ));

      setToast({
        message: `Coupon "${code}" ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating coupon status:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response details:', err.response.data);
      }
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'An unexpected error occurred.';
      
      setToast({
        message: `Failed to update coupon status: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  return (
    <AdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleDelete}
        title={confirmModal.title}
        message={confirmModal.message}
      />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Tag className="mr-3 h-8 w-8 text-blue-500" />
          Coupon Management
        </h1>
        <p className="text-gray-600 ml-11">Create and manage discount coupons</p>
      </div>

      <div className="mb-6">
         <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transition-all duration-200 shadow-sm"
        >
          {showForm ? (
            <>
              <XCircle size={20} />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle size={20} />
              Add New Coupon
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-700 hover:text-red-900"
            aria-label="Close error message"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {Array.isArray(coupons) && `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
        <button
          onClick={fetchCoupons}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm transition-colors"
          title="Refresh coupons"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={20} /> : <PlusCircle size={20} />}
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code* <span className="text-xs text-gray-500">(Will be converted to uppercase)</span>
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g. SUMMER30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Summer sale discount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type*
                </label>
                <select
                  name="discount_type"
                  required
                  value={formData.discount_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percent">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value*
                </label>
                <input
                  type="number"
                  name="discount_value"
                  required
                  min="0"
                  max={formData.discount_type === 'percent' ? '100' : undefined}
                  step={formData.discount_type === 'percent' ? '1' : '0.01'}
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.discount_type === 'percent' ? 'e.g. 15' : 'e.g. 10.99'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discount_type === 'percent' ? 'Percentage value (e.g. 15 for 15% off)' : 'Flat dollar amount'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Discount (Optional)
                </label>
                <input
                  type="number"
                  name="max_discount"
                  min="0"
                  step="0.01"
                  value={formData.max_discount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 50.00"
                />
                <p className="text-xs text-gray-500 mt-1">Max amount for percentage discounts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Purchase Amount*
                </label>
                <input
                  type="number"
                  name="min_purchase_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.min_purchase_amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 25.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid From*
                </label>
                <input
                  type="datetime-local"
                  name="valid_from"
                  required
                  value={formData.valid_from}
                  onChange={handleInputChange}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid To*
                </label>
                <input
                  type="datetime-local"
                  name="valid_to"
                  required
                  value={formData.valid_to}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit*
                </label>
                <input
                  type="number"
                  name="usage_limit"
                  required
                  min="1"
                  value={formData.usage_limit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. 100"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of times this coupon can be used</p>
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

              {/* Applicable Categories - Updated Multi-Select */}
              <div className="md:col-span-1">
                <MultiSelectDropdown
                  options={categories}
                  selected={formData.applicable_categories}
                  onChange={handleCategoryChange}
                  placeholder="Select categories"
                  label="Applicable Categories (Optional)"
                  icon={Tag}
                />
              </div>

              {/* Applicable Products - Updated Multi-Select */}
              <div className="md:col-span-1">
                <MultiSelectDropdown
                  options={products}
                  selected={formData.applicable_products}
                  onChange={handleProductChange}
                  placeholder="Select products"
                  label="Applicable Products (Optional)"
                  icon={Package}
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 transition-all duration-200 shadow-sm"
              >
                {editingId ? (
                  <>
                    <Save size={18} />
                    Update Coupon
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} />
                    Create Coupon
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 flex items-center gap-2 transition-colors duration-200"
              >
                <XCircle size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw size={24} className="animate-spin text-blue-600 mr-3" />
          <span className="ml-2 text-gray-700 font-medium">Loading coupons...</span>
        </div>
      ) : (
        <div className="bg-white shadow-lg overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
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
                {Array.isArray(coupons) && coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <Info size={48} className="text-blue-500 mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No coupons found</p>
                        <p className="text-sm mb-4">Create your first coupon to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  Array.isArray(coupons) && coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600 font-mono">{coupon.code}</div>
                        {coupon.description && (
                          <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {coupon.discount_type === 'percent' 
                            ? `${coupon.discount_value}% OFF` 
                            : `$${coupon.discount_value} OFF`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: ${coupon.min_purchase_amount}
                          {coupon.max_discount && ` | Max: $${coupon.max_discount}`}
                        </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-medium">From:</span>
                            <span>{new Date(coupon.valid_from).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium">To:</span>
                            <span>{new Date(coupon.valid_to).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                (coupon.used_count / coupon.usage_limit) * 100 >= 90 
                                  ? 'bg-red-600' 
                                  : (coupon.used_count / coupon.usage_limit) * 100 >= 70 
                                    ? 'bg-yellow-600' 
                                    : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, (coupon.used_count / coupon.usage_limit) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {coupon.used_count} / {coupon.usage_limit} used
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${
                          coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.is_active ? (
                            <>
                              <CheckCircle size={12} />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleEdit(coupon)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                            title="Edit coupon"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => toggleCouponStatus(coupon.id, coupon.is_active, coupon.code)}
                            className={`flex items-center gap-1 transition-colors ${
                              coupon.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                            }`}
                            title={coupon.is_active ? 'Deactivate coupon' : 'Activate coupon'}
                          >
                            {coupon.is_active ? (
                              <>
                                <ToggleRight size={14} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={14} />
                                Activate
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => openDeleteConfirmation(coupon)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors"
                            title="Delete coupon"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default CouponManagement;