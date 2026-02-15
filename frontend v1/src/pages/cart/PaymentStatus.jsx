// src/pages/payment/PaymentStatus.jsx - Handle PhonePe redirect
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle, ShoppingBag, ChevronRight, Package, MapPin, CreditCard, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';

const PaymentStatus = () => {
  const { merchantOrderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const [status, setStatus] = useState('checking'); // checking, success, failed, pending
  const [orderData, setOrderData] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  const MAX_RETRIES = 3;
  
  useEffect(() => {
    // Get order summary from sessionStorage
    const savedSummary = sessionStorage.getItem('pending_order_summary');
    if (savedSummary) {
      try {
        const parsedSummary = JSON.parse(savedSummary);
        setOrderSummary(parsedSummary);
      } catch (e) {
        
      }
    }
    
    // Check payment status
    checkPaymentStatus();
  }, [merchantOrderId]);
  
  const checkPaymentStatus = async () => {
    if (!merchantOrderId) {
      setStatus('failed');
      setError('Invalid payment reference');
      return;
    }
    
    try {
      setStatus('checking');
      const response = await orderService.checkPaymentStatus(merchantOrderId);
      
      if (response.success) {
        if (response.status === 'SUCCESS') {
          // Payment successful
          setStatus('success');
          setOrderData(response);
          
          // Clear cart
          clearCart();
          
          // Clear stored order summary
          sessionStorage.removeItem('pending_order_summary');
          
        } else if (response.status === 'FAILED') {
          // Payment failed
          setStatus('failed');
          setError(response.message || 'Payment failed');
          
        } else if (response.status === 'PENDING') {
          // Still pending - retry after delay
          if (retryCount < MAX_RETRIES) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              checkPaymentStatus();
            }, 3000); // Retry after 3 seconds
            setStatus('pending');
          } else {
            setStatus('pending');
            setError('Payment verification is taking longer than expected. Please check your order history.');
          }
        }
      } else {
        setStatus('failed');
        setError(response.error || 'Failed to verify payment status');
      }
    } catch (err) {
      
      setStatus('failed');
      setError('Failed to verify payment. Please contact support if amount was deducted.');
    }
  };
  
  const handleRetry = () => {
    setRetryCount(0);
    checkPaymentStatus();
  };
  
  // Checking status
  if (status === 'checking') {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <RefreshCw size={64} className="text-indigo-600" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-2xl font-bold text-gray-900"
          >
            Verifying Payment
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-600"
          >
            Please wait while we confirm your payment...
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex items-center justify-center text-sm text-gray-500"
          >
            <Clock size={16} className="mr-2" />
            This may take a few moments
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Success status
  if (status === 'success') {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
              >
                <CheckCircle size={80} className="mx-auto text-green-500" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6 text-3xl font-extrabold text-gray-900"
              >
                Payment Successful!
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-2 text-lg text-gray-600"
              >
                Your order has been confirmed and payment received.
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-1 text-gray-500 font-medium"
              >
                Order #{orderData?.order_id || orderSummary?.order_id}
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 bg-white rounded-lg p-8 shadow-md border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package size={20} className="mr-2 text-indigo-600" />
                Order Summary
              </h2>
              
              <div className="mt-6 space-y-6 divide-y divide-gray-200">
                {orderSummary && (
                  <>
                    <div className="flex justify-between">
                      <p className="text-gray-600">Product Subtotal</p>
                      <p className="font-medium text-gray-900">₹{orderSummary.subtotal.toFixed(2)}</p>
                    </div>
                    
                    {orderSummary.items.some(item => item.product_variant.is_discount_active) && (
                      <div className="flex justify-between pt-4">
                        <p className="text-gray-600">Product Discounts</p>
                        <p className="font-medium text-green-600">
                          -₹{orderSummary.items.reduce((total, item) => {
                            const variant = item.product_variant;
                            if (variant.is_discount_active && variant.discount_price) {
                              return total + ((variant.price - variant.discount_price) * item.quantity);
                            }
                            return total;
                          }, 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                    
                    {orderSummary.coupon && (
                      <div className="flex justify-between pt-4">
                        <div className="flex items-center">
                          <p className="text-gray-600">Coupon Discount</p>
                          <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            {orderSummary.coupon.code}
                          </span>
                        </div>
                        <p className="font-medium text-green-600">-₹{orderSummary.discount.toFixed(2)}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-4">
                      <p className="font-bold text-gray-900">Amount Paid</p>
                      <p className="font-bold text-indigo-700">₹{orderSummary.finalTotal.toFixed(2)}</p>
                    </div>
                  </>
                )}
                
                <div className="pt-6">
                  <p className="font-medium text-gray-900 flex items-center">
                    <CreditCard size={16} className="mr-2 text-indigo-600" />
                    Payment Method
                  </p>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    Online Payment (PhonePe) - Confirmed
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-gray-600 flex items-center justify-center">
                <CheckCircle size={16} className="mr-2 text-green-500" />
                A confirmation email has been sent to {user?.email}
              </p>
              
              <div className="mt-8 flex justify-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ShoppingBag className="mr-2" size={18} />
                    Continue Shopping
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/orders"
                    className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-700 rounded-full shadow-sm text-base font-medium bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Package className="mr-2" size={18} />
                    View My Orders
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Failed status
  if (status === 'failed') {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <XCircle size={80} className="mx-auto text-red-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-3xl font-extrabold text-gray-900"
          >
            Payment Failed
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-600"
          >
            {error || 'Something went wrong with your payment. Please try again.'}
          </motion.p>

          <div className="mt-8 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none"
            >
              <RefreshCw className="mr-2" size={18} />
              Retry Verification
            </motion.button>

            <Link
              to="/cart"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-700 rounded-full shadow-sm text-base font-medium bg-white hover:bg-indigo-50"
            >
              <ShoppingBag className="mr-2" size={18} />
              Go to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pending status
  if (status === 'pending') {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Clock size={64} className="text-yellow-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-2xl font-bold text-gray-900"
          >
            Payment Pending
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-gray-600"
          >
            {error || 'Your payment is still being verified. Please wait or check your orders later.'}
          </motion.p>

          <div className="mt-8 flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetry}
              className="inline-flex items-center px-6 py-3 rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              <RefreshCw className="mr-2" size={18} />
              Retry Now
            </motion.button>

            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-700 rounded-full shadow-sm text-base font-medium bg-white hover:bg-indigo-50"
            >
              <Package className="mr-2" size={18} />
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return null;
};

export default PaymentStatus;
