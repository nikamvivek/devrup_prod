// src/pages/cart/Checkout.jsx - PART 1
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, UserCheck, Truck, ChevronRight, ChevronDown, ChevronUp, ShoppingBag, 
         CheckCircle, XCircle, Package, MapPin, Shield, Calendar, CreditCard as CardIcon, 
         DollarSign, CheckSquare, Plus as PlusIcon } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { motion, AnimatePresence } from 'framer-motion'; // Assuming framer-motion is installed

const Checkout = () => {
  const { cartItems, cartTotal, coupon, discount, finalTotal, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for checkout steps
  const [activeStep, setActiveStep] = useState(1);
  const [stepsCompleted, setStepsCompleted] = useState({ 1: false, 2: false, 3: false });
  
  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // State for payment
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  // State for order
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  
  // Animation properties
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4 }
  };
  
  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    } else if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [isAuthenticated, cartItems, navigate, orderSuccess]);
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = await authService.getAddresses();
        
        // Make sure we're correctly accessing the addresses data
        const addressesData = Array.isArray(response) ? response : 
                             (response.results || response.addresses || []);
        
        setAddresses(addressesData);
        
        // Select default address
        const defaultAddress = addressesData.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressesData.length > 0) {
          setSelectedAddressId(addressesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setAddresses([]);  // Ensure addresses is always an array
      } finally {
        setLoadingAddresses(false);
      }
    };
      
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);
  
  const toggleStep = (step) => {
    if (step === activeStep) {
      return;
    }
    
    if (stepsCompleted[step - 1] || step === 1) {
      setActiveStep(step);
    }
  };
  
  const completeAddressStep = () => {
    if (!selectedAddressId) {
      return false;
    }
    
    setStepsCompleted({ ...stepsCompleted, 1: true });
    setActiveStep(2);
    return true;
  };
  
  const completePaymentStep = () => {
    if (!paymentMethod) {
      return false;
    }
    
    setStepsCompleted({ ...stepsCompleted, 2: true });
    setActiveStep(3);
    return true;
  };

  const placeOrder = async () => {
    if (!selectedAddressId || !paymentMethod) {
      setOrderError('Please complete all the required steps before placing your order.');
      return;
    }
    
    try {
      setPlacingOrder(true);
      setOrderError('');
      
      // Prepare order data
      const orderData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      };
      
      // Add coupon if available
      if (coupon) {
        orderData.coupon_code = coupon.code;
      }
      
      // Create order
      const response = await orderService.createOrder(orderData);
      
      // Process payment (placeholder for now)
      if (paymentMethod === 'credit_card' || paymentMethod === 'paypal' || paymentMethod === 'stripe') {
        // Here you would normally redirect to a payment gateway
        // For now, we'll just simulate a successful payment
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Save cart data before clearing
      const orderSummary = {
        items: [...cartItems],
        subtotal: cartTotal,
        discount: discount,
        finalTotal: finalTotal,
        coupon: coupon
      };
      
      // Clear cart and show success
      clearCart();
      
      // Set order successful state with saved data
      setOrderSuccess(true);
      setOrderId(response.id);
      
      // Store order summary in state
      setOrderSummary(orderSummary);
      
    } catch (err) {
      console.error('Error placing order:', err);
      setOrderError(err.response?.data?.error || 'Failed to place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

// src/pages/cart/Checkout.jsx - PART 2

  // Order success screen rendering
  if (orderSuccess) {
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
                Order Placed Successfully!
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-2 text-lg text-gray-600"
              >
                Thank you for your purchase.
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-1 text-gray-500 font-medium"
              >
                Order #{orderId}
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
                {/* Product Subtotal */}
                <div className="flex justify-between">
                  <p className="text-gray-600">Product Subtotal</p>
                  <p className="font-medium text-gray-900">${orderSummary?.subtotal.toFixed(2) || '0.00'}</p>
                </div>
                
                {/* Product Discounts (if any) */}
                {orderSummary?.items.some(item => item.product_variant.is_discount_active) && (
                  <div className="flex justify-between pt-4">
                    <p className="text-gray-600">Product Discounts</p>
                    <p className="font-medium text-green-600">
                      -${orderSummary.items.reduce((total, item) => {
                        const variant = item.product_variant;
                        if (variant.is_discount_active && variant.discount_price) {
                          return total + ((variant.price - variant.discount_price) * item.quantity);
                        }
                        return total;
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                )}
                
                {/* Coupon Discount */}
                {orderSummary?.coupon && (
                  <div className="flex justify-between pt-4">
                    <div className="flex items-center">
                      <p className="text-gray-600">Coupon Discount</p>
                      <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {orderSummary.coupon.code}
                      </span>
                    </div>
                    <p className="font-medium text-green-600">-${orderSummary.discount.toFixed(2)}</p>
                  </div>
                )}
                
                {/* Total Amount */}
                <div className="flex justify-between pt-4">
                  <p className="font-bold text-gray-900">Total Amount</p>
                  <p className="font-bold text-indigo-700">${orderSummary?.finalTotal.toFixed(2) || '0.00'}</p>
                </div>
                
                <div className="pt-6">
                  <p className="font-medium text-gray-900 flex items-center">
                    <MapPin size={16} className="mr-2 text-indigo-600" />
                    Shipping Information
                  </p>
                  {selectedAddressId && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                      {addresses.find(a => a.id === selectedAddressId)?.address_line1}, {addresses.find(a => a.id === selectedAddressId)?.city}, {addresses.find(a => a.id === selectedAddressId)?.country}
                    </div>
                  )}
                </div>
                
                <div className="pt-6">
                  <p className="font-medium text-gray-900 flex items-center">
                    <CreditCard size={16} className="mr-2 text-indigo-600" />
                    Payment Method
                  </p>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                    {paymentMethod === 'credit_card' && <>
                      <CardIcon size={16} className="mr-2 text-gray-400" /> Credit Card
                    </>}
                    {paymentMethod === 'paypal' && <>
                      <DollarSign size={16} className="mr-2 text-gray-400" /> PayPal
                    </>}
                    {paymentMethod === 'stripe' && <>
                      <CreditCard size={16} className="mr-2 text-gray-400" /> Stripe
                    </>}
                    {paymentMethod === 'cash_on_delivery' && <>
                      <DollarSign size={16} className="mr-2 text-gray-400" /> Cash on Delivery
                    </>}
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
                <CheckSquare size={16} className="mr-2 text-green-500" />
                We've sent a confirmation email to {user?.email}
              </p>
              
              <div className="mt-8 flex justify-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    Continue Shopping
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/orders/${orderId}`}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
                  >
                    View Order Details
                    <ChevronRight size={18} className="ml-2" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
        >
          Checkout
        </motion.h1>
        
        {/* Order error message */}
        <AnimatePresence>
          {orderError && (
            <motion.div 
              {...fadeIn}
              className="mt-6 rounded-md bg-red-50 p-4 border border-red-100 shadow-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {orderError}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout steps */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            {/* Step 1: Shipping Address */}
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white overflow-hidden">
              <div className="p-6">
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleStep(1)}
                  className="flex w-full items-center justify-between focus:outline-none"
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                        stepsCompleted[1] ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      }`}
                    >
                      <UserCheck size={22} />
                    </motion.div>
                    <div className="ml-4">
                      <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                      {stepsCompleted[1] && selectedAddressId && (
                        <p className="mt-1 text-sm text-gray-500">
                          {addresses.find(a => a.id === selectedAddressId)?.address_line1}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeStep === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.button>
                
                <AnimatePresence>
                  {activeStep === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      {loadingAddresses ? (
                        <div className="py-12 flex justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="h-12 w-12 rounded-full border-t-4 border-b-4 border-indigo-600"
                          />
                        </div>
                      ) : addresses.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-gray-900">Select a shipping address</h3>
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {addresses.map((address) => (
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={address.id} 
                                className="relative"
                              >
                                <div 
                                  className={`border rounded-lg p-4 shadow-sm transition-all duration-200 ${
                                    selectedAddressId === address.id
                                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                      : 'border-gray-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <label className="flex items-start cursor-pointer">
                                    <input
                                      type="radio"
                                      name="shipping-address"
                                      checked={selectedAddressId === address.id}
                                      onChange={() => setSelectedAddressId(address.id)}
                                      className="h-5 w-5 mt-1 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <div className="ml-3 text-sm">
                                      <p className="font-medium text-gray-900 flex items-center">
                                        {address.address_line1}
                                        {address.is_default && (
                                          <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                            Default
                                          </span>
                                        )}
                                      </p>
                                      <p className="mt-1 text-gray-500">
                                        {address.address_line2 && `${address.address_line2}, `}
                                        {address.city}, {address.state}, {address.zip_code}, {address.country}
                                      </p>
                                    </div>
                                  </label>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center mt-8">
                            <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                              <Link
                                to="/profile/addresses/new"
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                              >
                                <PlusIcon size={16} className="mr-1" /> Add new address
                              </Link>
                            </motion.div>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={completeAddressStep}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border border-transparent rounded-full shadow-sm py-2 px-6 text-sm font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Continue to Payment <ChevronRight size={16} className="ml-1 inline" />
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                          </motion.div>
                          <p className="text-gray-500">You don't have any saved addresses.</p>
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6"
                          >
                            <Link
                              to="/profile/addresses/new"
                              className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                            >
                              <PlusIcon size={16} className="mr-2" /> Add a new address
                            </Link>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              // src/pages/cart/Checkout.jsx - PART 3
              
              {/* Step 2: Payment Method */}
              <div className="p-6">
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleStep(2)}
                  className="flex w-full items-center justify-between focus:outline-none"
                  disabled={!stepsCompleted[1]}
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={stepsCompleted[1] ? { scale: 1.1 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                        stepsCompleted[2] 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : stepsCompleted[1] 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <CreditCard size={22} />
                    </motion.div>
                    <div className="ml-4">
                      <h2 className={`text-lg font-bold ${stepsCompleted[1] ? 'text-gray-900' : 'text-gray-400'}`}>
                        Payment Method
                      </h2>
                      {stepsCompleted[2] && (
                        <p className="mt-1 text-sm text-gray-500">
                          {paymentMethod === 'credit_card' && 'Credit Card'}
                          {paymentMethod === 'paypal' && 'PayPal'}
                          {paymentMethod === 'stripe' && 'Stripe'}
                          {paymentMethod === 'cash_on_delivery' && 'Cash on Delivery'}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeStep === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.button>
                
                <AnimatePresence>
                  {activeStep === 2 && stepsCompleted[1] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      <h3 className="text-sm font-medium text-gray-900">Select a payment method</h3>
                      
                      <div className="mt-4 space-y-4">
                        {/* Credit Card */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative"
                        >
                          <div 
                            className={`border rounded-lg p-4 shadow-sm transition-all duration-200 ${
                              paymentMethod === 'credit_card'
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <label className="flex items-start cursor-pointer">
                              <input
                                type="radio"
                                name="payment-method"
                                value="credit_card"
                                checked={paymentMethod === 'credit_card'}
                                onChange={() => setPaymentMethod('credit_card')}
                                className="h-5 w-5 mt-1 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <div className="ml-3">
                                <p className="font-medium text-gray-900 flex items-center">
                                  <CardIcon size={18} className="mr-2 text-indigo-600" /> Credit Card
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Pay with your credit card securely.</p>
                                
                                <AnimatePresence>
                                  {paymentMethod === 'credit_card' && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-4 grid grid-cols-4 gap-4"
                                    >
                                      {/* In a real app, you would include credit card form fields here */}
                                      <div className="col-span-4">
                                        <div className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-100">
                                          <Shield size={16} className="text-blue-500 mr-2" />
                                          <p className="text-xs text-blue-700">This is a demo checkout page. No actual payment will be processed.</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </label>
                          </div>
                        </motion.div>
                        
                        {/* PayPal */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative"
                        >
                          <div 
                            className={`border rounded-lg p-4 shadow-sm transition-all duration-200 ${
                              paymentMethod === 'paypal'
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="payment-method"
                                value="paypal"
                                checked={paymentMethod === 'paypal'}
                                onChange={() => setPaymentMethod('paypal')}
                                className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <div className="ml-3">
                                <p className="font-medium text-gray-900 flex items-center">
                                  <DollarSign size={18} className="mr-2 text-blue-600" /> PayPal
                                </p>
                                <p className="text-sm text-gray-500">Pay with your PayPal account.</p>
                              </div>
                            </label>
                          </div>
                        </motion.div>
                        
                        {/* Cash on Delivery */}
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative"
                        >
                          <div 
                            className={`border rounded-lg p-4 shadow-sm transition-all duration-200 ${
                              paymentMethod === 'cash_on_delivery'
                                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="payment-method"
                                value="cash_on_delivery"
                                checked={paymentMethod === 'cash_on_delivery'}
                                onChange={() => setPaymentMethod('cash_on_delivery')}
                                className="h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                              />
                              <div className="ml-3">
                                <p className="font-medium text-gray-900 flex items-center">
                                  <Package size={18} className="mr-2 text-green-600" /> Cash on Delivery
                                </p>
                                <p className="text-sm text-gray-500">Pay when you receive your order.</p>
                              </div>
                            </label>
                          </div>
                        </motion.div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-8">
                        <motion.button
                          whileHover={{ x: -3 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setActiveStep(1)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                        >
                          <ChevronRight size={16} className="mr-1 transform rotate-180" />
                          Back to Shipping
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={completePaymentStep}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border border-transparent rounded-full shadow-sm py-2 px-6 text-sm font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Continue to Review <ChevronRight size={16} className="ml-1 inline" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Step 3: Review and Confirm */}
              <div className="p-6">
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleStep(3)}
                  className="flex w-full items-center justify-between focus:outline-none"
                  disabled={!stepsCompleted[2]}
                >
                  <div className="flex items-center">
                    <motion.div 
                      whileHover={stepsCompleted[2] ? { scale: 1.1 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                        stepsCompleted[3] 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                          : stepsCompleted[2] 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Truck size={22} />
                    </motion.div>
                    <div className="ml-4">
                      <h2 className={`text-lg font-bold ${stepsCompleted[2] ? 'text-gray-900' : 'text-gray-400'}`}>
                        Review and Confirm
                      </h2>
                    </div>
                  </div>
                  {activeStep === 3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.button>
                
                <AnimatePresence>
                  {activeStep === 3 && stepsCompleted[2] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <CheckSquare size={16} className="mr-2 text-indigo-600" />
                        Review your order
                      </h3>
                      
                      <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
                        {/* Order items - updated with animations and better styling */}
                        {cartItems.map((item, index) => {
                          // Get variant data
                          const variant = item.product_variant || {};
                          
                          // Try to get product info if available
                          const product = item.product || {};
                          
                          // For display purposes
                          const productName = product.name || variant.product_name || 
                                          `Product (${variant.size})`;
                          
                          // Use dummy image if not available
                          const productImage = product.main_image || product.image || '/api/placeholder/150/150';
                          
                          // Ensure price is a number
                          const isDiscounted = variant.is_discount_active && variant.discount_price;
                          let priceValue = isDiscounted ? variant.discount_price : variant.price;
                          
                          // Convert price to number if it's a string
                          if (typeof priceValue === 'string') {
                            priceValue = parseFloat(priceValue);
                          }
                          
                          // Default to 0 if price is not a valid number
                          const price = !isNaN(priceValue) ? priceValue : 0;
                          
                          return (
                            <motion.div 
                              key={item.id} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="py-4 flex border-b border-gray-100 last:border-0"
                            >
                              <div className="relative flex-shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-full h-full object-center object-cover"
                                />
                                {variant.is_discount_active && variant.discount_percentage && (
                                  <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-1 py-0.5 rounded-br">
                                    {variant.discount_percentage}% OFF
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3 className="font-medium">{productName}</h3>
                                    <p className="ml-4 font-bold">${(price * item.quantity).toFixed(2)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">
                                    Size: <span className="font-medium">{variant.size}</span> | Qty: <span className="font-medium">{item.quantity}</span>
                                  </p>
                                  {isDiscounted && variant.price && (
                                    <p className="mt-1 text-xs text-gray-400">
                                      <s>${parseFloat(variant.price).toFixed(2)}</s>
                                      <span className="ml-2 text-green-500 font-medium">
                                        {variant.discount_percentage}% off
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Order button */}
                      <div className="mt-8">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={placeOrder}
                          disabled={placingOrder}
                          className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border border-transparent rounded-full shadow-md py-4 px-6 text-base font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center
                            ${placingOrder ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                          {placingOrder ? (
                            <>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                              />
                              Processing Order...
                            </>
                          ) : (
                            <>
                              Complete Purchase
                              <CheckSquare size={20} className="ml-2" />
                            </>
                          )}
                        </motion.button>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500 flex items-center justify-center">
                          <Shield size={14} className="mr-1 text-gray-400" />
                          By placing your order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          
          {/* Order summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 lg:mt-0 lg:col-span-5"
          >
            <div className="bg-white rounded-lg px-4 py-6 sm:p-6 lg:p-8 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Package size={18} className="mr-2 text-indigo-600" />
                Order Summary
              </h2>
              
              <div className="mt-6 space-y-4">
                {/* Product Subtotal */}
                <div className="flex items-center justify-between">
                  <div className="text-base text-gray-600">Product Subtotal</div>
                  <div className="text-base font-medium text-gray-900">${cartTotal.toFixed(2)}</div>
                </div>
                
                {/* Product Discounts (if any) */}
                {cartItems.some(item => item.product_variant.is_discount_active) && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Product Discounts</div>
                    <div className="text-sm font-medium text-green-600">
                      -${cartItems.reduce((total, item) => {
                        const variant = item.product_variant;
                        if (variant.is_discount_active && variant.discount_price) {
                          return total + ((variant.price - variant.discount_price) * item.quantity);
                        }
                        return total;
                      }, 0).toFixed(2)}
                    </div>
                  </div>
                )}
                
                {/* Shipping info with a nice badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600">Shipping</div>
                  </div>
                  <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Free</div>
                </div>
                
                {/* Coupon Discount */}
                <AnimatePresence>
                  {coupon && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div className="text-sm text-gray-600">Coupon Discount</div>
                        <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {coupon.code}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-green-600">-${discount.toFixed(2)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Tax info */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Estimated Tax</div>
                  <div className="text-sm font-medium text-gray-600">Calculated at checkout</div>
                </div>
                
                {/* Total line */}
                <motion.div 
                  className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2"
                  animate={{ 
                    scale: [1, 1.02, 1],
                    transition: { duration: 0.5, delay: 0.2 }
                  }}
                >
                  <div className="text-lg font-bold text-gray-900">Total</div>
                  <div className="text-xl font-bold text-indigo-600">${finalTotal.toFixed(2)}</div>
                </motion.div>
              </div>
              
              {/* Payment and Security Features */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Shield size={16} className="mr-2 text-indigo-600" />
                  Payment & Security
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    <span>Secure checkout</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    <span>Privacy protected</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <CheckCircle size={16} className="text-green-500 mr-2" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center space-x-3">
                  <motion.img 
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    src="/api/placeholder/40/24" 
                    alt="Visa" 
                    className="h-6 rounded shadow-sm" 
                  />
                  <motion.img 
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    src="/api/placeholder/40/24" 
                    alt="Mastercard" 
                    className="h-6 rounded shadow-sm" 
                  />
                  <motion.img 
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    src="/api/placeholder/40/24" 
                    alt="PayPal" 
                    className="h-6 rounded shadow-sm" 
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;