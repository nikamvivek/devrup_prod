import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from "react-spinners"; // ✅ Compact spinner
import { generateReceipt } from '../../utils/ReceiptGenerator';



const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const { getToken } = useAuth();
  const [statusUpdating, setStatusUpdating] = useState(false);


  // Shipping modal and form states
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    delivery_partner: '',
    tracking_number: '',
    tracking_url: '',
    expected_delivery_date: ''
  });
  const [shippingErrors, setShippingErrors] = useState({});
  const [submittingShipping, setSubmittingShipping] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await adminService.getOrder(id);
        setOrder(orderData);
        setNewStatus(orderData.status);

        // Pre-fill shipping details if available
        setShippingDetails({
          delivery_partner: orderData.delivery_partner || '',
          tracking_number: orderData.tracking_number || '',
          tracking_url: orderData.tracking_url || '',
          expected_delivery_date: orderData.expected_delivery_date || ''
        });

      } catch (err) {
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateShippingDetails = () => {
    const errors = {};
    if (!(shippingDetails.delivery_partner || '').trim()) {
      errors.delivery_partner = 'Delivery partner is required';
    }
    if (!(shippingDetails.tracking_number || '').trim()) {
      errors.tracking_number = 'Tracking number is required';
    }
    const trackingUrl = (shippingDetails.tracking_url || '').trim();
    if (trackingUrl && !isValidUrl(trackingUrl)) {
      errors.tracking_url = 'Please enter a valid URL';
    }
    if (!shippingDetails.expected_delivery_date) {
      errors.expected_delivery_date = 'Expected delivery date is required';
    }
    return errors;
  };

  const onStatusChange = (status) => {
    if (status === 'shipped') {
      setShowShippingModal(true);
      setShippingDetails({
        delivery_partner: order.delivery_partner || '',
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
        expected_delivery_date: order.expected_delivery_date || ''
      });
      setShippingErrors({});
      setFormTouched(false);
    }
    setNewStatus(status);
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    const errors = validateShippingDetails();
    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      return;
    }

    setSubmittingShipping(true);
    setShippingErrors({});

    try {
      await adminService.updateOrderStatus(id, 'shipped', shippingDetails);
      setOrder(prev => ({
        ...prev,
        status: 'shipped',
        ...shippingDetails
      }));
      setNewStatus('shipped');
      setShowShippingModal(false);
      toast.success('Order shipped successfully!');
    } catch (err) {
      if (err.response && err.response.data) {
        const backendErrors = err.response.data;
        if (backendErrors.details) {
          setShippingErrors(backendErrors.details);
          toast.error('Please fix the validation errors and try again.');
        } else if (backendErrors.error) {
          toast.error(`Error: ${backendErrors.error}`);
        } else {
          toast.error('Failed to update shipping details. Please try again.');
        }
      } else {
        toast.error('Failed to update shipping details. Network error occurred.');
      }
    } finally {
      setSubmittingShipping(false);
    }
  };

  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
    if (shippingErrors[name]) {
      setShippingErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const closeShippingModal = () => {
    setShowShippingModal(false);
    setShippingErrors({});
    setFormTouched(false);
  };

const handleStatusUpdate = async () => {
  if (!order || !id || !newStatus) return;

  if (newStatus === 'shipped') {
    setShowShippingModal(true);
    return;
  }

  try {
    setStatusUpdating(true);
    setError(null);
    await adminService.updateOrderStatus(id, newStatus);
    setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
    toast.success('Order status updated successfully!');
  } catch (err) {
    setError('Failed to update order status. Please try again.');
    toast.error('Failed to update order status. Please try again.');
  } finally {
    setStatusUpdating(false);
  }
};

// Handler for download receipt
  const handleDownloadReceipt = async () => {
    try {
      await generateReceipt(order);
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Order data not available.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
          <p className="text-gray-600">
            Order ID: #{typeof order.id === 'string' ? order.id.slice(-6) : order.id}
          </p>
        </div>
        <div className="flex space-x-3">
          {/* Show Download Receipt button only for processing, shipped, or delivered orders */}
          {order.status && ['processing', 'shipped', 'delivered'].includes(order.status) && (
            <button
              onClick={handleDownloadReceipt}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Receipt</span>
            </button>
          )}
          <Link
            to="/admin/orders"
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow col-span-2">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="flex justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="text-gray-900">
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="text-gray-900">
                {order.payment_method === 'credit_card' ? 'Credit Card' :
                  order.payment_method === 'paypal' ? 'PayPal' :
                    order.payment_method === 'stripe' ? 'Stripe' :
                      order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' :
                        order.payment_method || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-md font-medium mb-2">Update Status</h3>
            <div className="flex space-x-2">
              <select
                value={newStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* ✅ Updated smaller inline spinner */}
              <button
  type="button"
  onClick={handleStatusUpdate}
  disabled={statusUpdating}
  className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    statusUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  {statusUpdating ? (
    <>
      <ClipLoader size={14} color="#fff" />
      <span className="ml-2">Updating...</span>
    </>
  ) : (
    'Update Status'
  )}
</button>

            </div>
          </div>

          {/* Order Items Table */}
          <h3 className="text-md font-medium mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product_name || (item.product_variant?.product?.name) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.product_variant?.size || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${parseFloat(item.price || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(parseFloat(item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                {order.coupon && (
                  <tr>
                    <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                      Coupon ({order.coupon.code})
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      -{order.coupon.discount_type === 'percent'
                        ? `${order.coupon.discount_value}%`
                        : `$${parseFloat(order.coupon.discount_value || 0).toFixed(2)}`}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Discount
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    ${parseFloat(order.discount_amount || 0).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="4" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    ${parseFloat(order.total_price || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            {order.user ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900">
                    {(order.user.first_name || '') + ' ' + (order.user.last_name || '')}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.user.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined Date</p>
                  <p className="text-gray-900">
                    {order.user.date_joined ? new Date(order.user.date_joined).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No customer information available.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            {order.address ? (
              <>
                <p className="text-gray-900 mb-1">{order.address.address_line1 || ''}</p>
                {order.address.address_line2 && (
                  <p className="text-gray-900 mb-1">{order.address.address_line2}</p>
                )}
                <p className="text-gray-900 mb-1">
                  {(order.address.city || '') + ', ' +
                    (order.address.state || '') + ' ' +
                    (order.address.zip_code || '')}
                </p>
                <p className="text-gray-900">{order.address.country || ''}</p>
              </>
            ) : (
              <p className="text-gray-500">No address information available.</p>
            )}
          </div>
        </div>
      </div>

      {showShippingModal && (
  <div
    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    onClick={closeShippingModal}
  >
    <div
      className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-2">Shipping Details</h3>
      <p className="text-sm text-gray-600 mb-4">
        Order <span className="font-medium">#{order?.order_number}</span> is ready to be shipped.  
        Please fill out the details below.
      </p>

      <form onSubmit={handleShippingSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery Partner
          </label>
          <input
            type="text"
            name="delivery_partner"
            value={shippingDetails.delivery_partner}
            onChange={handleShippingInputChange}
            className={`mt-1 block w-full border ${
              shippingErrors.delivery_partner ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {shippingErrors.delivery_partner && (
            <p className="text-red-500 text-xs mt-1">
              {shippingErrors.delivery_partner}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tracking Number
          </label>
          <input
            type="text"
            name="tracking_number"
            value={shippingDetails.tracking_number}
            onChange={handleShippingInputChange}
            className={`mt-1 block w-full border ${
              shippingErrors.tracking_number ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {shippingErrors.tracking_number && (
            <p className="text-red-500 text-xs mt-1">
              {shippingErrors.tracking_number}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tracking URL
          </label>
          <input
            type="url"
            name="tracking_url"
            value={shippingDetails.tracking_url}
            onChange={handleShippingInputChange}
            className={`mt-1 block w-full border ${
              shippingErrors.tracking_url ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {shippingErrors.tracking_url && (
            <p className="text-red-500 text-xs mt-1">
              {shippingErrors.tracking_url}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Expected Delivery Date
          </label>
          <input
            type="date"
            name="expected_delivery_date"
            value={shippingDetails.expected_delivery_date}
            onChange={handleShippingInputChange}
            className={`mt-1 block w-full border ${
              shippingErrors.expected_delivery_date ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {shippingErrors.expected_delivery_date && (
            <p className="text-red-500 text-xs mt-1">
              {shippingErrors.expected_delivery_date}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={closeShippingModal}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submittingShipping}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              submittingShipping
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submittingShipping ? (
              <>
                <ClipLoader size={14} color="#fff" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

<ToastContainer position="top-right" autoClose={2000} />
</AdminLayout>
);
};

export default AdminOrderDetail;
