import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Home, MapPin, Trash2, Edit, Check, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import siteConfig from '../../config/siteConfig';

const AddressBook = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    is_default: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [notification, setNotification] = useState(null);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.getAddresses();

        if (!response || (Array.isArray(response) && response.length === 0)) {
          setAddresses([]);
          setSelectedAddressId(null);
          return;
        }

        const addressesArray = Array.isArray(response) ? response : [];
        setAddresses(addressesArray);

        const defaultAddress = addressesArray.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressesArray.length > 0) {
          setSelectedAddressId(addressesArray[0].id);
        }
      } catch (err) {
        setAddresses([]);
        setError('Failed to load addresses. Please try again. Error: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      is_default: false
    });
    setFormErrors({});
    setGeneralError('');
  };

  const handleShowAddForm = () => {
    resetForm();
    setEditingAddressId(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address) => {
    setFormData({
      name: address.name || '',
      phone: address.phone || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default
    });
    setEditingAddressId(address.id);
    setShowAddForm(true);
    setFormErrors({});
    setGeneralError('');
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingAddressId(null);
    resetForm();
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

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});
      setGeneralError('');

      if (editingAddressId) {
        await authService.updateAddress(editingAddressId, formData);
        showNotification('success', 'Address updated successfully');
      } else {
        await authService.addAddress(formData);
        showNotification('success', 'Address added successfully');
      }

      const newAddresses = await authService.getAddresses();
      setAddresses(newAddresses);

      setShowAddForm(false);
      setEditingAddressId(null);
      resetForm();
    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          setFormErrors(error.response.data);
        } else {
          setGeneralError(typeof error.response.data === 'string' ? error.response.data : 'Failed to save address. Please try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }

      showNotification('error', 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await authService.deleteAddress(addressId);

      const newAddresses = await authService.getAddresses();
      setAddresses(newAddresses);

      setShowDeleteConfirm(null);
      showNotification('success', 'Address deleted successfully');
    } catch (error) {
      setError('Failed to delete address. Please try again.');
      showNotification('error', 'Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen bg-gradient-to-r ${t.background.gradient}`}>
        <div className="flex flex-col items-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${tc.primary.main}`}></div>
          <p className={`${tc.primary.text} font-medium mt-4`}>Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} py-8`}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border flex items-center animate-fadeInDown ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={16} className="text-green-500 mr-2" />
          ) : (
            <AlertCircle size={16} className="text-red-500 mr-2" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`${tc.primary.text} inline-flex items-center text-sm font-medium hover:${tc.primary.hover} transition-colors duration-200 group`}
            >
              <span className="inline-flex items-center transform group-hover:-translate-x-1 transition-transform duration-200">
                <ChevronLeft size={16} className="mr-1" />
                Back to profile
              </span>
            </button>
          </div>

          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient} sm:text-4xl`}>
                My Addresses
              </h1>
              <p className="mt-2 text-sm text-gray-500">Manage your shipping addresses</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              {!showAddForm && (
                <button
                  type="button"
                  onClick={handleShowAddForm}
                  className={`${tc.button.primary} inline-flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-medium hover:shadow-md`}
                >
                  <Plus size={16} className="mr-2" />
                  Add Address
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 shadow-sm animate-fadeIn">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {showAddForm && (
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden mb-8 animate-fadeIn">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                <h2 className="text-lg leading-6 font-bold text-gray-900">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h2>
              </div>

              {generalError && (
                <div className="mx-6 mt-4 rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{generalError}</h3>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    {/* Name */}
                    <div className="col-span-6">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.name ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.name && <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div className="col-span-6">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        placeholder="10-digit phone number"
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.phone ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.phone && <p className="mt-2 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>

                    {/* Address Line 1 */}
                    <div className="col-span-6">
                      <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        name="address_line1"
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.address_line1 ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.address_line1 && <p className="mt-2 text-sm text-red-600">{formErrors.address_line1}</p>}
                    </div>

                    {/* Address Line 2 */}
                    <div className="col-span-6">
                      <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="address_line2"
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={handleChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg"
                      />
                    </div>

                    {/* City */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.city ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.city && <p className="mt-2 text-sm text-red-600">{formErrors.city}</p>}
                    </div>

                    {/* State/Province */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        id="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.state ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.state && <p className="mt-2 text-sm text-red-600">{formErrors.state}</p>}
                    </div>

                    {/* ZIP/Postal Code */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                        ZIP / Postal code
                      </label>
                      <input
                        type="text"
                        name="zip_code"
                        id="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.zip_code ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.zip_code && <p className="mt-2 text-sm text-red-600">{formErrors.zip_code}</p>}
                    </div>

                    {/* Country */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        id="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-${t.primary.main.replace('#', '')} focus:border-${t.primary.main.replace('#', '')} block w-full shadow-sm sm:text-sm border-gray-300 rounded-lg
                          ${formErrors.country ? 'border-red-300 bg-red-50' : ''}`}
                        style={{
                          '--tw-ring-color': t.primary.main,
                          '--tw-border-color': t.primary.main,
                        }}
                      />
                      {formErrors.country && <p className="mt-2 text-sm text-red-600">{formErrors.country}</p>}
                    </div>

                    {/* Default Address Checkbox */}
                    <div className="col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="is_default"
                            name="is_default"
                            type="checkbox"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className={`focus:ring-${t.primary.main.replace('#', '')} h-4 w-4 text-${t.primary.main.replace('#', '')} border-gray-300 rounded`}
                            style={{ '--tw-ring-color': t.primary.main }}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="is_default" className="font-medium text-gray-700">
                            Set as default address
                          </label>
                          <p className="text-gray-500">
                            This address will be used as the default shipping address.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${tc.button.primary} ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white transition-all duration-200
                      ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center">
                        <Loader size={16} className="animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      'Save Address'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-white shadow-lg rounded-xl border border-gray-100 animate-fadeIn">
              <MapPin className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-xl font-medium text-gray-900">No addresses yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Add your first address to make checkout easier.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleShowAddForm}
                  className={`${tc.button.primary} inline-flex items-center px-5 py-2.5 rounded-full text-white shadow-sm text-sm font-medium transition-all duration-200 hover:shadow-md`}
                >
                  <Plus size={16} className="mr-2" />
                  Add Address
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden animate-fadeIn">
              <ul className="divide-y divide-gray-100">
                {addresses.map((address) => (
                  <li key={address.id} className="p-5 sm:p-6 transition-all duration-200 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              address.is_default
                                ? `bg-gradient-to-r from-green-400 to-green-500 text-white`
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Home size={20} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">{address.name}</h3>
                            {address.is_default && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <Check size={12} className="mr-1" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            <div>{address.phone}</div>
                            <div className="mt-1">{address.address_line1}</div>
                            {address.address_line2 && <div>{address.address_line2}</div>}
                            <div>
                              {address.city}, {address.state} {address.zip_code}
                            </div>
                            <div>{address.country}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditAddress(address)}
                          className={`${tc.primary.text} p-2 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-all duration-200`}
                          title="Edit Address"
                        >
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(address.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Delete Address"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>

                    {showDeleteConfirm === address.id && (
                      <div className="mt-4 bg-red-50 rounded-lg p-4 border border-red-200 animate-fadeIn">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Are you sure you want to delete this address?</h3>
                            <div className="mt-2 flex">
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(null)}
                                className="mr-3 bg-white py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(address.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 py-2 px-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:from-red-600 hover:to-red-700 transition-all duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

export default AddressBook;
