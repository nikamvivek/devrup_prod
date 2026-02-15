// src/pages/cart/Checkout.jsx - Complete working version with dynamic theme
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, UserCheck, Truck, ChevronRight, ChevronDown, ChevronUp, ShoppingBag, 
         CheckCircle, XCircle, Package, MapPin, Shield, DollarSign, CheckSquare, Plus as PlusIcon, Instagram } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import siteConfig from '../../config/siteConfig';

const Checkout = () => {
  const { cartItems, cartTotal, coupon, discount, finalTotal, clearCart } = useContext(CartContext);
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
  
  // State for checkout steps
  const [activeStep, setActiveStep] = useState(1);
  const [stepsCompleted, setStepsCompleted] = useState({ 1: false, 2: false, 3: false });
  
  // State for addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // State for payment - DEFAULT TO COD
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
  // State for order
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  
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
        
        const addressesData = Array.isArray(response) ? response : 
                             (response.results || response.addresses || []);
        
        setAddresses(addressesData);
        
        const defaultAddress = addressesData.find((addr) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (addressesData.length > 0) {
          setSelectedAddressId(addressesData[0].id);
        }
      } catch (err) {
        setAddresses([]);
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
      setOrderError('Please select a shipping address');
      return false;
    }
    
    setOrderError('');
    setStepsCompleted({ ...stepsCompleted, 1: true });
    setActiveStep(2);
    return true;
  };
  
  const completePaymentStep = () => {
    if (!paymentMethod) {
      setOrderError('Please select a payment method');
      return false;
    }
    
    setOrderError('');
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
      
      // Calculate product discounts using the same technique as in UI
      const productDiscountTotal = cartItems.reduce((total, item) => {
        const variant = item.product_variant;
        if (variant.is_discount_active && variant.discount_price) {
          return total + ((variant.price - variant.discount_price) * item.quantity);
        }
        return total;
      }, 0);
      
      // Prepare order data with product discount
      const orderData = {
        address_id: selectedAddressId,
        coupon_id: coupon?.id || null,
        discount_value: discount.toString(), // Coupon discount
        product_discount: productDiscountTotal.toFixed(2) // Product discount
      };
      
      // Save cart data before clearing (for success page)
      const orderSummaryData = {
        items: [...cartItems],
        subtotal: cartTotal,
        discount: discount,
        productDiscount: productDiscountTotal,
        finalTotal: finalTotal,
        coupon: coupon
      };
      
      if (paymentMethod === 'cash_on_delivery') {
        // COD Order - Direct creation
        const response = await orderService.createCODOrder(orderData);
        
        // Clear cart
        clearCart();
        
        // Show success
        setOrderSuccess(true);
        setOrderId(response.id);
        setOrderSummary(orderSummaryData);
        
      } else if (paymentMethod === 'online') {
        // Online Payment - Redirect to PhonePe
        const response = await orderService.initiateOnlinePayment(orderData);
        
        if (response.success && response.payment_url) {
          // Store order summary in sessionStorage for payment status page
          sessionStorage.setItem('pending_order_summary', JSON.stringify({
            ...orderSummaryData,
            merchant_order_id: response.merchant_order_id,
            order_id: response.order_id
          }));
          
          // Redirect to PhonePe payment gateway
          window.location.href = response.payment_url;
        } else {
          throw new Error('Failed to initiate payment');
        }
      }
      
    } catch (err) {
      // console.error('Error placing order:', err);
      setOrderError(err.response?.data?.error || 'Failed to place your order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-block animate-bounce">
                <CheckCircle size={80} className="text-green-500" />
              </div>
              
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                Order Placed Successfully!
              </h1>
              
              <p className="mt-2 text-lg text-gray-600">
                Thank you for your purchase.
              </p>
              
              <p className="mt-1 text-gray-500 font-medium">
                Order #{orderId}
              </p>

              <p className="inline-flex items-center mt-4 px-2.5 py-2 rounded-full text-lg font-medium bg-green-100 text-green-800 ">Please message us on WhatsApp at 9765815854 to get payment details and confirm your order.</p>
            </div>

                    <div className="mt-6 flex justify-center">
          <a
            href="https://www.instagram.com/devrup_oraganic_products/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-medium shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Instagram size={20} className="mr-2" />
            Follow us on Instagram
          </a>
        </div>

            
            <div className="mt-6 bg-white rounded-lg p-8 shadow-md border border-gray-100">
              <h2 className={`text-xl font-bold text-gray-900 flex items-center`}>
                <Package size={20} className={`mr-2 ${themeClasses.primary.text}`} />
                Order Summary
              </h2>
              
              <div className="mt-6 space-y-6 divide-y divide-gray-200">
                <div className="flex justify-between">
                  <p className="text-gray-600">Product Subtotal</p>
                  <p className="font-medium text-gray-900">{siteConfig.currency.symbol}{orderSummary?.subtotal.toFixed(2) || '0.00'}</p>
                </div>
                
                {orderSummary?.items.some(item => item.product_variant.is_discount_active) && (
                  <div className="flex justify-between pt-4">
                    <p className="text-gray-600">Product Discounts</p>
                    <p className="font-medium text-green-600">
                      -{siteConfig.currency.symbol}{orderSummary.items.reduce((total, item) => {
                        const variant = item.product_variant;
                        if (variant.is_discount_active && variant.discount_price) {
                          return total + ((variant.price - variant.discount_price) * item.quantity);
                        }
                        return total;
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                )}
                
                {orderSummary?.coupon && (
                  <div className="flex justify-between pt-4">
                    <div className="flex items-center">
                      <p className="text-gray-600">Coupon Discount</p>
                      <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {orderSummary.coupon.code}
                      </span>
                    </div>
                    <p className="font-medium text-green-600">-{siteConfig.currency.symbol}{orderSummary.discount.toFixed(2)}</p>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <p className="font-bold text-gray-900">Total Amount</p>
                  <p className={`font-bold ${themeClasses.primary.text}`}>{siteConfig.currency.symbol}{orderSummary?.finalTotal.toFixed(2) || '0.00'}</p>
                </div>
                
                <div className="pt-6">
                  <p className={`font-medium text-gray-900 flex items-center`}>
                    <MapPin size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                    Shipping Information
                  </p>
                  {selectedAddressId && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
                      {addresses.find(a => a.id === selectedAddressId)?.address_line1}, {addresses.find(a => a.id === selectedAddressId)?.city}, {addresses.find(a => a.id === selectedAddressId)?.country}
                    </div>
                  )}
                </div>
                
                {/* <div className="pt-6">
                  <p className={`font-medium text-gray-900 flex items-center`}>
                    <CreditCard size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                    Payment Method
                  </p>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100 flex items-center">
                    {paymentMethod === 'online' && (
                      <>
                        <CreditCard size={16} className="mr-2 text-gray-400" /> Online Payment (PhonePe)
                      </>
                    )}
                    {paymentMethod === 'cash_on_delivery' && (
                      <>
                        <DollarSign size={16} className="mr-2 text-gray-400" /> Pay Later
                      </>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-600 flex items-center justify-center">
                <CheckSquare size={16} className="mr-2 text-green-500" />
                We've sent a confirmation email to {user?.email}
              </p>
              
              <div className="mt-8 flex justify-center space-x-4">
                <Link
                  to="/"
                  className={`inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium ${themeClasses.button.primary} transition-all duration-300 transform hover:scale-105`}
                >
                  <ShoppingBag size={18} className="mr-2" />
                  Continue Shopping
                </Link>
                
                <Link
                  to="/orders"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
                >
                  View My Orders
                  <ChevronRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Checkout
        </h1>
        
        {orderError && (
          <div className="mt-6 rounded-md bg-red-50 p-4 border border-red-100 shadow-sm animate-fade-in">
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
          </div>
        )}
        
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white overflow-hidden">
              
              {/* Step 1: Shipping Address */}
              <div className="p-6">
                <button
                  onClick={() => toggleStep(1)}
                  className="flex w-full items-center justify-between focus:outline-none hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                      stepsCompleted[1] ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : `${themeClasses.primary.gradient} text-white`
                    }`}>
                      <UserCheck size={22} />
                    </div>
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
                </button>
                
                {activeStep === 1 && (
                  <div className="mt-6">
                    {loadingAddresses ? (
                      <div className="py-12 flex justify-center">
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full border-t-4 border-b-4 border-gray-300 animate-spin opacity-25"></div>
                          <div className={`absolute inset-0 h-12 w-12 rounded-full border-t-4 ${themeClasses.primary.text}`} style={{ borderColor: 'currentColor' }}></div>
                        </div>
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-2 p-1">
                        <h3 className="text-sm font-medium text-gray-900">Select a shipping address</h3>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                          {addresses.map((address) => (
                            <div key={address.id} className="relative">
                              <div 
                                className={`border rounded-lg p-4 shadow-sm transition-all duration-200 cursor-pointer ${
                                  selectedAddressId === address.id
                                    ? `border-current ${themeClasses.primary.text} bg-opacity-5 ring-2 ring-current`
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                style={selectedAddressId === address.id ? { borderColor: 'currentColor', ringColor: 'currentColor' } : {}}
                                onClick={() => setSelectedAddressId(address.id)}
                              >
                                <label className="flex items-start cursor-pointer">
                                  <input
                                    type="radio"
                                    name="shipping-address"
                                    checked={selectedAddressId === address.id}
                                    onChange={() => setSelectedAddressId(address.id)}
                                    className={`h-5 w-5 mt-1 ${themeClasses.primary.text} border-gray-300 focus:ring-2 ${themeClasses.primary.ring}`}
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
                                      {address.name} {address.phone}
                                    </p>
                                    <p className="mt-1 text-gray-500">
                                      {address.address_line2 && `${address.address_line2}, `}
                                      {address.city}, {address.state}, {address.zip_code}, {address.country}
                                    </p>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-8">
                          <Link
                            to="/profile/addresses/new"
                            state={{ returnTo: '/checkout' }}
                            className={`text-sm font-medium ${themeClasses.primary.text} ${themeClasses.primary.hover} flex items-center transition-colors duration-200`}
                          >
                            <PlusIcon size={16} className="mr-1" /> Add new address
                          </Link>
                          
                          <button
                            type="button"
                            onClick={completeAddressStep}
                            disabled={!selectedAddressId}
                            className={`${themeClasses.button.primary} border border-transparent rounded-full shadow-sm py-2 px-6 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring} disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Continue to Payment <ChevronRight size={16} className="ml-1 inline" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin size={40} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">You don't have any saved addresses.</p>
                        <Link
                          to="/profile/addresses/new"
                          className={`mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium ${themeClasses.button.primary} transition-all duration-300 transform hover:scale-105`}
                        >
                          <PlusIcon size={16} className="mr-2" /> Add a new address
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Step 2: Payment Method */}
              <div className="p-6">
                <button
                  onClick={() => toggleStep(2)}
                  className="flex w-full items-center justify-between focus:outline-none hover:opacity-80 transition-opacity"
                  disabled={!stepsCompleted[1]}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                      stepsCompleted[2] 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : stepsCompleted[1] 
                          ? `${themeClasses.primary.gradient} text-white`
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      <CreditCard size={22} />
                    </div>
                    <div className="ml-4">
                      <h2 className={`text-lg font-bold ${stepsCompleted[1] ? 'text-gray-900' : 'text-gray-400'}`}>
                        Payment Method
                      </h2>
                      {/* {stepsCompleted[2] && (
                        <p className="mt-1 text-sm text-gray-500">
                          {paymentMethod === 'online' && 'Online Payment (PhonePe)'}
                          {paymentMethod === 'cash_on_delivery' && 'Cash on Delivery'}
                        </p>
                      )} */}
                    </div>
                  </div>
                  {activeStep === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {activeStep === 2 && stepsCompleted[1] && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900">Select a payment method</h3>
                    
                    <div className="mt-4 space-y-4 p-2">
                      {/* Online Payment - PhonePe */}
                      {/* <div className="relative">
                        <div 
                          className={`border rounded-lg p-4 shadow-sm transition-all duration-200 cursor-pointer ${
                            paymentMethod === 'online'
                              ? `border-current ${themeClasses.primary.text} bg-opacity-5 ring-2 ring-current`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={paymentMethod === 'online' ? { borderColor: 'currentColor', ringColor: 'currentColor' } : {}}
                          onClick={() => setPaymentMethod('online')}
                        >
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="radio"
                              name="payment-method"
                              value="online"
                              checked={paymentMethod === 'online'}
                              onChange={() => setPaymentMethod('online')}
                              className={`h-5 w-5 mt-1 ${themeClasses.primary.text} border-gray-300 focus:ring-2 ${themeClasses.primary.ring}`}
                            />
                            <div className="ml-3 flex-1">
                              <p className={`font-medium text-gray-900 flex items-center`}>
                                <CreditCard size={18} className={`mr-2 ${themeClasses.primary.text}`} /> Online Payment (PhonePe)
                              </p>
                              <p className="text-sm text-gray-500 mt-1">Pay securely using PhonePe payment gateway.</p>
                              
                              {paymentMethod === 'online' && (
                                <div className="mt-4">
                                  <div className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-100">
                                    <Shield size={16} className="text-blue-500 mr-2 flex-shrink-0" />
                                    <p className="text-xs text-blue-700">You will be redirected to PhonePe to complete your payment securely.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </div> */}
                      
                      {/* Cash on Delivery */}
                      <div className="relative">
                        <div 
                          className={`border rounded-lg p-4 shadow-sm transition-all duration-200 cursor-pointer ${
                            paymentMethod === 'cash_on_delivery'
                              ? `border-current ${themeClasses.primary.text} bg-opacity-5 ring-2 ring-current`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={paymentMethod === 'cash_on_delivery' ? { borderColor: 'currentColor', ringColor: 'currentColor' } : {}}
                          onClick={() => setPaymentMethod('cash_on_delivery')}
                        >
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name="payment-method"
                              value="cash_on_delivery"
                              checked={paymentMethod === 'cash_on_delivery'}
                              onChange={() => setPaymentMethod('cash_on_delivery')}
                              className={`h-5 w-5 ${themeClasses.primary.text} border-gray-300 focus:ring-2 ${themeClasses.primary.ring}`}
                            />
                            <div className="ml-3">
                              <p className="font-medium text-gray-900 flex items-center">
                                Confirm and Pay
                              </p>
                              <p className="text-base text-gray-900">Please message us on WhatsApp at 9765815854 to get payment details and confirm your order.</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-8">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className={`text-sm font-medium ${themeClasses.primary.text} ${themeClasses.primary.hover} flex items-center transition-colors duration-200`}
                      >
                        <ChevronRight size={16} className="mr-1 transform rotate-180" />
                        Back to Shipping
                      </button>
                      
                      <button
                        type="button"
                        onClick={completePaymentStep}
                        disabled={!paymentMethod}
                        className={`${themeClasses.button.primary} border border-transparent rounded-full shadow-sm py-2 px-6 text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Continue to Review <ChevronRight size={16} className="ml-1 inline" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Step 3: Review and Confirm */}
              <div className="p-6">
                <button
                  onClick={() => toggleStep(3)}
                  className="flex w-full items-center justify-between focus:outline-none hover:opacity-80 transition-opacity"
                  disabled={!stepsCompleted[2]}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                      stepsCompleted[3] 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                        : stepsCompleted[2] 
                          ? `${themeClasses.primary.gradient} text-white`
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Truck size={22} />
                    </div>
                    <div className="ml-4">
                      <h2 className={`text-lg font-bold ${stepsCompleted[2] ? 'text-gray-900' : 'text-gray-400'}`}>
                        Review and Confirm
                      </h2>
                    </div>
                  </div>
                  {activeStep === 3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {activeStep === 3 && stepsCompleted[2] && (
                  <div className="mt-6">
                    <h3 className={`text-sm font-medium text-gray-900 flex items-center`}>
                      <CheckSquare size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                      Review your order
                    </h3>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4 space-y-4">
                      {cartItems.map((item, index) => {
                        const variant = item.product_variant || {};
                        const product = item.product || {};
                        const productName = product.name || variant.product_name || `Product (${variant.size})`;
                        const productImage = product.main_image || product.image || '/api/placeholder/150/150';
                        const isDiscounted = variant.is_discount_active && variant.discount_price;
                        let priceValue = isDiscounted ? variant.discount_price : variant.price;
                        
                        if (typeof priceValue === 'string') {
                          priceValue = parseFloat(priceValue);
                        }
                        
                        const price = !isNaN(priceValue) ? priceValue : 0;
                        
                        return (
                          <div 
                            key={item.id}
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
                                  <p className="ml-4 font-bold">{siteConfig.currency.symbol}{(price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  Size: <span className="font-medium">{variant.size}</span> | Qty: <span className="font-medium">{item.quantity}</span>
                                </p>
                                {isDiscounted && variant.price && (
                                  <p className="mt-1 text-xs text-gray-400">
                                    <s>{siteConfig.currency.symbol}{parseFloat(variant.price).toFixed(2)}</s>
                                    <span className="ml-2 text-green-500 font-medium">
                                      {variant.discount_percentage}% off
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 p-2">
                      <button
                        type="button"
                        onClick={placeOrder}
                        disabled={placingOrder}
                        className={`w-full ${themeClasses.button.primary} border border-transparent rounded-full shadow-md py-4 px-6 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring} flex items-center justify-center
                          ${placingOrder ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'}`}
                      >
                        {placingOrder ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3 animate-spin" />
                            {paymentMethod === 'online' ? 'Redirecting to Payment...' : 'Processing Order...'}
                          </>
                        ) : (
                          <>
                            {paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
                            <CheckSquare size={20} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500 flex items-center justify-center">
                        <Shield size={14} className="mr-1 text-gray-400" />
                        By placing your order, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white rounded-lg px-4 py-6 sm:p-6 lg:p-8 shadow-md border border-gray-100 sticky top-4">
              <h2 className={`text-xl font-bold text-gray-900 flex items-center`}>
                <Package size={18} className={`mr-2 ${themeClasses.primary.text}`} />
                Order Summary
              </h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-base text-gray-600">Product Subtotal</div>
                  <div className="text-base font-medium text-gray-900">{siteConfig.currency.symbol}{cartTotal.toFixed(2)}</div>
                </div>
                
                {cartItems.some(item => item.product_variant.is_discount_active) && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Product Discounts</div>
                    <div className="text-sm font-medium text-green-600">
                      -{siteConfig.currency.symbol}{cartItems.reduce((total, item) => {
                        const variant = item.product_variant;
                        if (variant.is_discount_active && variant.discount_price) {
                          return total + ((variant.price - variant.discount_price) * item.quantity);
                        }
                        return total;
                      }, 0).toFixed(2)}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-600">Shipping</div>
                  </div>
                  <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Calculate Later</div>
                </div>
                
                {coupon && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-600">Coupon Discount</div>
                      <span className="ml-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {coupon.code}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-green-600">-{siteConfig.currency.symbol}{discount.toFixed(2)}</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
                  <div className="text-lg font-bold text-gray-900">Total</div>
                  <div className={`text-xl font-bold ${themeClasses.primary.text}`}>{siteConfig.currency.symbol}{finalTotal.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className={`text-sm font-medium text-gray-900 mb-4 flex items-center`}>
                  <Shield size={16} className={`mr-2 ${themeClasses.primary.text}`} />
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
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default Checkout;
