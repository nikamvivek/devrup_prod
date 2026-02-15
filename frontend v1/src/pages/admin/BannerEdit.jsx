// src/pages/admin/BannerEdit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import bannerService from '../../services/bannerService';
import { 
  ArrowLeft, 
  Upload, 
  X,
  Save,
  Loader,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : 'bg-blue-500';

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 text-white ${bgColor} rounded-lg shadow-lg transition-all duration-300`}
    >
      {type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
      <div className="text-sm font-medium mr-3">{message}</div>
      <button onClick={onClose} className="ml-auto">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const BannerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false); // Track if original image exists
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: 'Shop Now',
    target_url: '/products',
    position: 'hero',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchBannerDetails();
  }, [id]);

  const fetchBannerDetails = async () => {
    try {
      setFetchLoading(true);
      const data = await bannerService.getBanner(id);
      
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        button_text: data.button_text || 'Shop Now',
        target_url: data.target_url || '/products',
        position: data.position || 'hero',
        is_active: data.is_active !== undefined ? data.is_active : true
      });
      
      // Set existing image preview
      if (data.image) {
        setImagePreview(data.image);
        setHasExistingImage(true); // Mark that we have an existing image
      }
      
      setFetchLoading(false);
    } catch (err) {
      setToast({
        message: 'Failed to load banner details. Please try again.',
        type: 'error'
      });
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should not exceed 5MB' }));
        return;
      }

      setNewImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
    setHasExistingImage(false); // Mark that we no longer have an image
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.button_text.trim()) {
      newErrors.button_text = 'Button text is required';
    }
    
    if (!formData.target_url.trim()) {
      newErrors.target_url = 'Target URL is required';
    }
    
    // Validate image - must have either existing image or new image
    if (!imagePreview && !hasExistingImage && !newImageFile) {
      newErrors.image = 'Banner image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData object for multipart/form-data
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subtitle', formData.subtitle);
      
      // Only append image if a new one was selected
      if (newImageFile) {
        data.append('image', newImageFile);
      }
      
      data.append('button_text', formData.button_text);
      data.append('target_url', formData.target_url);
      data.append('position', formData.position);
      data.append('is_active', formData.is_active);

      await bannerService.updateBanner(id, data);
      
      setToast({
        message: 'Banner updated successfully!',
        type: 'success'
      });
      
      // Navigate back to banner list after a short delay
      setTimeout(() => {
        navigate('/admin/banners');
      }, 1500);
      
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to update banner. Please try again.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-10 w-10 text-blue-500 mr-3" />
          <span className="text-lg font-medium text-gray-700">Loading banner...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/banners')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-150"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Banners
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <ImageIcon className="mr-3 h-8 w-8 text-blue-500" />
          Edit Banner
        </h1>
        <p className="text-gray-600 ml-11">Update banner information</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter banner title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <textarea
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
              placeholder="Enter subtitle (optional)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            
            {!imagePreview ? (
              <div className="flex items-center justify-center w-full">
                <label htmlFor="image-upload" className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                  errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-12 h-12 mb-4 ${errors.image ? 'text-red-400' : 'text-gray-400'}`} />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-150 shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
                {newImageFile && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    New image selected - will replace existing image
                  </div>
                )}
                {!newImageFile && hasExistingImage && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Current image (upload new one to replace)
                  </div>
                )}
              </div>
            )}
            
            {errors.image && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Button Text */}
          <div>
            <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-2">
              Button Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="button_text"
              name="button_text"
              value={formData.button_text}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${
                errors.button_text ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Shop Now, Learn More"
            />
            {errors.button_text && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.button_text}
              </p>
            )}
          </div>

          {/* Target URL */}
          <div>
            <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 mb-2">
              Target URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="target_url"
              name="target_url"
              value={formData.target_url}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150 ${
                errors.target_url ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="/products or https://example.com"
            />
            {errors.target_url && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.target_url}
              </p>
            )}
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              Position <span className="text-red-500">*</span>
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
            >
              <option value="hero">Hero Section</option>
              <option value="middle">Middle Section</option>
              <option value="bottom">Bottom Section</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Set as Active
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/banners')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Banner
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default BannerEdit;