// src/pages/profile/AddressForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import siteConfig from '../../config/siteConfig';

const AddressForm = ({ existingAddress = null, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const [formData, setFormData] = useState({
    name: existingAddress?.name || '',
    phone: existingAddress?.phone || '',
    address_line1: existingAddress?.address_line1 || '',
    address_line2: existingAddress?.address_line2 || '',
    city: existingAddress?.city || '',
    state: existingAddress?.state || '',
    zip_code: existingAddress?.zip_code || '',
    country: existingAddress?.country || '',
    is_default: existingAddress?.is_default || false
  });

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.address_line1.trim()) errors.address_line1 = 'Address line 1 is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State/Province is required';
    if (!formData.zip_code.trim()) errors.zip_code = 'ZIP/Postal code is required';
    if (!formData.country.trim()) errors.country = 'Country is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let response;
      if (existingAddress) {
        response = await authService.updateAddress(existingAddress.id, formData);
        showNotification('success', 'Address updated successfully');
      } else {
        response = await authService.addAddress(formData);
        showNotification('success', 'Address added successfully');
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(response), 1000);
      } else {
        // Only redirect if there's a returnTo path (e.g., from checkout)
        const returnTo = location.state?.returnTo;
        if (returnTo) {
          setTimeout(() => {
            navigate(returnTo);
          }, 1000);
        }
        // If no returnTo (coming from /profile/addresses), do nothing
        // The parent component will handle the UI update
      }
    } catch (err) {
      setError(err.message || 'Failed to save address');
      showNotification('error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} py-10`}>
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center animate-fadeInDown ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={16} className="text-green-500 mr-2" />
          ) : (
            <AlertCircle size={16} className="text-red-500 mr-2" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`${tc.primary.text} inline-flex items-center text-sm font-medium hover:${tc.primary.hover} transition-colors duration-200 group`}
            >
              <span className="inline-flex items-center transform group-hover:-translate-x-1 transition-transform duration-200">
                <ArrowLeft size={16} className="mr-1" />
                Back
              </span>
            </button>
            <h1 className={`text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient}`}>
              {existingAddress ? 'Edit Address' : 'Add New Address'}
            </h1>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start animate-fadeIn">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  '--tw-ring-color': t.primary.main,
                  '--tw-border-color': t.primary.main,
                }}
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                placeholder="10-digit phone number"
                className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                  formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  '--tw-ring-color': t.primary.main,
                  '--tw-border-color': t.primary.main,
                }}
              />
              {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
            </div>

            <div>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                Address Line 1 *
              </label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                  formErrors.address_line1 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  '--tw-ring-color': t.primary.main,
                  '--tw-border-color': t.primary.main,
                }}
              />
              {formErrors.address_line1 && <p className="mt-1 text-sm text-red-600">{formErrors.address_line1}</p>}
            </div>

            <div>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                Address Line 2
              </label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                    formErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
                {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State/Province *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                    formErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
                {formErrors.state && <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                    formErrors.zip_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
                {formErrors.zip_code && <p className="mt-1 text-sm text-red-600">{formErrors.zip_code}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} sm:text-sm transition-colors duration-200 ${
                    formErrors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    '--tw-ring-color': t.primary.main,
                    '--tw-border-color': t.primary.main,
                  }}
                />
                {formErrors.country && <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="is_default"
                name="is_default"
                type="checkbox"
                checked={formData.is_default}
                onChange={handleChange}
                className={`h-4 w-4 text-${t.primary.main.replace('#', '')} focus:ring-${t.primary.main.replace('#', '')} border-gray-300 rounded`}
                style={{ '--tw-ring-color': t.primary.main }}
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                Set as default address
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`${tc.button.primary} inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200
                  ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Address
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddressForm;