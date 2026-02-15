import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import adminService from '../../services/adminService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ScaleLoader } from 'react-spinners';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10); // Items per page

  // Modal state
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await adminService.getAllOrders(currentPage, pageSize, statusFilter);

      if (ordersData.results && Array.isArray(ordersData.results)) {
        setOrders(ordersData.results);
        setTotalCount(ordersData.count || 0);
        setTotalPages(Math.ceil((ordersData.count || 0) / pageSize));
      } else if (Array.isArray(ordersData)) {
        setOrders(ordersData);
        setTotalCount(ordersData.length);
        setTotalPages(1);
      } else {
        setOrders([]);
        setTotalCount(0);
        setTotalPages(1);
      }
      setLoading(false);
    } catch (err) {
      
      setError('Failed to load orders. Please try again.');
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStatusFilterChange = (newFilter) => {
    setStatusFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
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

  // --- Modify handleStatusChange function like this ---
  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order);
      setShippingDetails({
        delivery_partner: order.delivery_partner || '',
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
        expected_delivery_date: order.expected_delivery_date || ''
      });
      setShippingErrors({});
      setFormTouched(false);
      setShowShippingModal(true);
    } else {
      try {
        setUpdatingStatusId(orderId); // ✅ Start loader
        await adminService.updateOrderStatus(orderId, newStatus);
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Order status updated successfully!');
      } catch (err) {
        
        toast.error('Failed to update order status. Please try again.');
      } finally {
        setUpdatingStatusId(null); // ✅ Stop loader
      }
    }
  };

  const handleShippingInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
    if (shippingErrors[name]) {
      setShippingErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    const errors = validateShippingDetails();
    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      return;
    }
    setShippingErrors({});
    setSubmittingShipping(true);
    try {
      await adminService.updateOrderStatus(
        selectedOrder.id,
        'shipped',
        shippingDetails
      );
      setOrders(orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, status: 'shipped', ...shippingDetails }
          : order
      ));
      setShowShippingModal(false);
      setSelectedOrder(null);
      setShippingDetails({
        delivery_partner: '',
        tracking_number: '',
        tracking_url: '',
        expected_delivery_date: ''
      });
      setFormTouched(false);
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

  const handleCloseModal = () => {
    setShowShippingModal(false);
    setSelectedOrder(null);
    setShippingDetails({
      delivery_partner: '',
      tracking_number: '',
      tracking_url: '',
      expected_delivery_date: ''
    });
    setShippingErrors({});
    setFormTouched(false);
  };

  const getUserInfo = (order) => {
    if (order.userDetails) return order.userDetails;
    if (order.user && typeof order.user === 'object' && order.user.first_name) return order.user;
    return {
      first_name: 'Customer',
      last_name: `#${typeof order.user === 'string' ? order.user.slice(-6) : ''}`,
      email: 'No email available'
    };
  };

  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-medium">{totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <p className="text-gray-600">Manage and process customer orders</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            id="statusFilter"
            className="border border-gray-300 rounded px-3 py-1 w-32 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {showShippingModal && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={handleCloseModal}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Shipping Details</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500" type="button">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleShippingSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Order #{selectedOrder?.id ? String(selectedOrder.id).slice(-6) : ''}
                </p>

                <div className="mb-4">
                  <label htmlFor="delivery_partner" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Partner <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="delivery_partner"
                    name="delivery_partner"
                    value={shippingDetails.delivery_partner}
                    onChange={handleShippingInputChange}
                    placeholder="e.g., FedEx, UPS, DHL"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched && shippingErrors.delivery_partner ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formTouched && shippingErrors.delivery_partner && (
                    <p className="mt-1 text-sm text-red-500">{shippingErrors.delivery_partner}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="tracking_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tracking_number"
                    name="tracking_number"
                    value={shippingDetails.tracking_number}
                    onChange={handleShippingInputChange}
                    placeholder="Enter tracking number"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched && shippingErrors.tracking_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formTouched && shippingErrors.tracking_number && (
                    <p className="mt-1 text-sm text-red-500">{shippingErrors.tracking_number}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="tracking_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking URL
                  </label>
                  <input
                    type="url"
                    id="tracking_url"
                    name="tracking_url"
                    value={shippingDetails.tracking_url}
                    onChange={handleShippingInputChange}
                    placeholder="https://example.com/track"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched && shippingErrors.tracking_url ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formTouched && shippingErrors.tracking_url && (
                    <p className="mt-1 text-sm text-red-500">{shippingErrors.tracking_url}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="expected_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expected_delivery_date"
                    name="expected_delivery_date"
                    value={shippingDetails.expected_delivery_date}
                    onChange={handleShippingInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formTouched && shippingErrors.expected_delivery_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {formTouched && shippingErrors.expected_delivery_date && (
                    <p className="mt-1 text-sm text-red-500">{shippingErrors.expected_delivery_date}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={submittingShipping}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submittingShipping}
                >
                  {submittingShipping ? 'Updating...' : 'Update & Ship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader">Loading...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
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
                {Array.isArray(orders) && orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : Array.isArray(orders) ? (
                  orders.map((order) => {
                    const userInfo = getUserInfo(order);
                    const orderTotal = order.total_price
                      ? (typeof order.total_price === 'string'
                        ? parseFloat(order.total_price)
                        : Number(order.total_price))
                      : 0;
                    const shippingAddress = order.address || {};
                    let addressDisplay = 'No address provided';
                    if (shippingAddress.address_line1) {
                      addressDisplay = `${shippingAddress.address_line1}`;
                      if (shippingAddress.city) addressDisplay += `, ${shippingAddress.city}`;
                      if (shippingAddress.state) addressDisplay += `, ${shippingAddress.state}`;
                    }
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{typeof order.id === 'string' ? order.id.slice(-6) : String(order.id).slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userInfo.first_name} {userInfo.last_name}</div>
                          <div className="text-sm text-gray-500">{userInfo.email}</div>
                          <div className="text-xs text-gray-500 mt-1">{addressDisplay}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${orderTotal.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <div className="relative inline-block">
                              <div
                                className={`inline-flex items-center cursor-pointer px-3 py-1 rounded-full min-w-24 ${order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'shipped'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : order.status === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {/* STATUS TEXT */}
                                <span className="text-xs font-semibold">
                                  {order.status
                                    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                    : 'Unknown'}
                                </span>

                                {/* INLINE LOADER beside text */}
                                {updatingStatusId === order.id && (
                                  <div className="ml-1 flex items-center">
                                    <ScaleLoader color="#2563eb" height={8} width={2} margin={1} />
                                  </div>
                                )}

                                {/* DROPDOWN (invisible overlay) */}
                                <select
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                  value={order.status || ''}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  disabled={updatingStatusId === order.id}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>

                                {/* DROPDOWN ICON */}
                                <svg
                                  className="h-3 w-3 ml-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </div>
                            </div>

                            {/* PAYMENT METHOD */}
                            <div className="text-xs text-gray-500">
                              {order.payment_method
                                ? order.payment_method
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                                : 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Error loading orders. Please try again.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && <PaginationControls />}
        </>
      )}

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick draggable pauseOnHover />
    </AdminLayout>
  );
};

export default OrderManagement;
