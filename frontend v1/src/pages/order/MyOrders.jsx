// src/pages/order/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Search, Clock, Package, XCircle, CheckCircle, TruckIcon, Loader, ChevronLeft } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import siteConfig from "../../config/siteConfig";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  // Get theme classes from siteConfig with fallback
  const themeClasses = siteConfig?.tailwindClasses || {
    primary: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-600',
      hover: 'hover:text-indigo-600',
      bgHover: 'hover:bg-indigo-600',
      gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      gradientHover: 'hover:from-indigo-700 hover:to-purple-700',
      ring: 'ring-indigo-500',
    },
    button: {
      primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white',
    },
    badge: {
      notification: 'bg-red-500 text-white',
      cart: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
    }
  };
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrders();
        const ordersData = Array.isArray(response) ? response : 
                          (response.data || response.results || []);
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  useEffect(() => {
    let result = orders;
    
    if (searchQuery) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(order => order.status === selectedStatus);
    }
    
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, orders]);
  
  // Calculate pagination values
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { 
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          icon: <Clock size={14} className="mr-1 text-amber-500" />,
          label: 'Pending'
        };
      case 'processing':
        return { 
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          text: 'text-blue-800',
          border: 'border-blue-200',
          icon: <Loader size={14} className="mr-1 text-blue-500" />,
          label: 'Processing'
        };
      case 'shipped':
        return { 
          bg: 'bg-gradient-to-r from-indigo-50 to-purple-50',
          text: 'text-indigo-800',
          border: 'border-indigo-200',
          icon: <TruckIcon size={14} className="mr-1 text-indigo-500" />,
          label: 'Shipped'
        };
      case 'delivered':
        return { 
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          text: 'text-green-800',
          border: 'border-green-200',
          icon: <CheckCircle size={14} className="mr-1 text-green-500" />,
          label: 'Delivered'
        };
      case 'cancelled':
        return { 
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          text: 'text-red-800',
          border: 'border-red-200',
          icon: <XCircle size={14} className="mr-1 text-red-500" />,
          label: 'Cancelled'
        };
      default:
        return { 
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          border: 'border-gray-200',
          icon: <Package size={14} className="mr-1 text-gray-500" />,
          label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
        };
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16 relative"
        >
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-gray-300 opacity-25"></div>
          <div className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 ${themeClasses.primary.text}`} style={{ borderColor: `${themeClasses.primary.bg}` }}></div>
        </motion.div>
      </div>
    );
  }
  
  const ordersToDisplay = Array.isArray(currentOrders) ? currentOrders : [];
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent ${themeClasses.primary.gradient}`}
          >
            My Orders
          </motion.h1>
          
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6 rounded-lg bg-red-50 p-4 border border-red-100 shadow-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {orders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 text-center"
            >
              <div className={`rounded-full bg-opacity-10 ${themeClasses.primary.bg} p-6 w-24 h-24 flex items-center justify-center mx-auto`}>
                <ShoppingBag className={`h-12 w-12 ${themeClasses.primary.text}`} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">No orders yet</h3>
              <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                You haven't placed any orders yet. Browse our products and find something you'll love!
              </p>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8"
              >
                <Link
                  to="/products"
                  className={`inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium ${themeClasses.button.primary} transition-all duration-300`}
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Start Shopping
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="mt-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="w-full sm:w-auto">
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1 sm:sr-only">
                    Filter by Status
                  </label>
                  <select
                    id="status-filter"
                    name="status-filter"
                    className={`block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent sm:text-sm rounded-full shadow-sm transition-colors duration-200`}
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="w-full sm:w-64 relative">
                  <label htmlFor="order-search" className="block text-sm font-medium text-gray-700 mb-1 sm:sr-only">
                    Search orders
                  </label>
                  <div className="relative rounded-full shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="order-search"
                      id="order-search"
                      className={`focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent block w-full pl-10 pr-4 py-2 sm:text-sm border-gray-300 rounded-full transition-all duration-200`}
                      placeholder="Search by order ID"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="mt-4 bg-white shadow-md overflow-hidden rounded-xl border border-gray-100"
              >
                <ul className="divide-y divide-gray-100">
                  {ordersToDisplay.length === 0 ? (
                    <motion.li 
                      variants={item}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center">
                        <Search size={24} className="text-gray-300 mb-2" />
                        <p className="font-medium">No orders match your search criteria</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter</p>
                      </div>
                    </motion.li>
                  ) : (
                    ordersToDisplay.map((order, index) => {
                      const statusInfo = getStatusInfo(order.status);
                      
                      return (
                        <motion.li 
                          key={order.id}
                          variants={item}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <Link 
                            to={`/orders/${order.id}`} 
                            className="block hover:bg-gray-50 transition-colors duration-150"
                          >
                            <div className="px-6 py-5">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <p className={`text-base font-bold ${themeClasses.primary.text} truncate`}>
                                    Order #{order.id}
                                  </p>
                                  <div className="mt-2 sm:mt-0 sm:ml-6 flex items-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border} border`}>
                                      <div className="flex items-center">
                                        {statusInfo.icon}
                                        {statusInfo.label}
                                      </div>
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <ChevronRight size={20} className={themeClasses.primary.text} />
                                </div>
                              </div>
                              <div className="mt-3 sm:flex sm:justify-between">
                                <div className="sm:flex items-center">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <Clock size={14} className="mr-1 text-gray-400" />
                                    {new Date(order.created_at).toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <Package size={14} className="mr-1 text-gray-400" />
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm sm:mt-0">
                                  <p className={`font-bold text-lg ${themeClasses.primary.text}`}>
                                    {siteConfig.currency.symbol}{order.total_price 
                                      ? (typeof order.total_price === 'number' 
                                          ? order.total_price.toFixed(2) 
                                          : parseFloat(order.total_price).toFixed(2)) 
                                      : '0.00'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.li>
                      );
                    })
                  )}
                </ul>
              </motion.div>
              
              {/* Pagination */}
              {filteredOrders.length > ordersPerPage && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm"
                >
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300 transition-colors duration-200`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      } border border-gray-300 transition-colors duration-200`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastOrder, filteredOrders.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredOrders.length}</span> orders
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                            currentPage === 1
                              ? 'cursor-not-allowed bg-gray-100'
                              : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          } transition-colors duration-200`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {getPageNumbers().map((pageNum, idx) => (
                          pageNum === '...' ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === pageNum
                                  ? `z-10 ${themeClasses.primary.bg} text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              } transition-all duration-200`}
                              style={currentPage === pageNum ? { backgroundColor: `${themeClasses.primary.bg}` } : {}}
                            >
                              {pageNum}
                            </button>
                          )
                        ))}
                        
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                            currentPage === totalPages
                              ? 'cursor-not-allowed bg-gray-100'
                              : 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          } transition-colors duration-200`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
