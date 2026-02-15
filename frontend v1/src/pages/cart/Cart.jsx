// src/pages/cart/Cart.jsx
// Modern UI Cart component with gradients, animations and improved UX
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ChevronRight, Tag, X, ShoppingBag, CreditCard, Truck, ArrowRight, Minus, Plus, Lock, LogIn } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import siteConfig from '../../config/siteConfig';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    loading,
    discount,
    finalTotal,
    coupon,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    isAuthenticated,
    getCartItemCount
  } = useContext(CartContext);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isRemoving, setIsRemoving] = useState(null);

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

  // Debug cart items
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      console.log('Cart items:', cartItems);
      console.log('First cart item structure:', JSON.stringify(cartItems[0], null, 2));
    }
  }, [cartItems]);

  // Reset coupon form states when coupon changes
  useEffect(() => {
    if (coupon) {
      setCouponCode('');
      setCouponSuccess(`Coupon "${coupon.code}" applied successfully!`);
      setCouponError('');
    } else {
      setCouponSuccess('');
    }
  }, [coupon]);

  const formatPrice = (price) => {
    if (price == null) return '0.00';
    return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      setIsRemoving(itemId);
      setTimeout(async () => {
        await removeFromCart(itemId);
        setIsRemoving(null);
      }, 300);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (error) {
      setCouponError(error.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/register');
    } else {
      navigate('/checkout');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-gray-300 animate-spin opacity-25"></div>
          <div className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 ${themeClasses.primary.text}`} style={{ borderColor: 'currentColor' }}></div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="text-center">
          <div className="flex justify-center">
            <ShoppingBag size={80} className="text-gray-300" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Your Cart is Empty
          </h1>
          <p className="mt-4 text-gray-500">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className={`mt-6 inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-base font-medium ${themeClasses.button.primary} transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring}`}
          >
            <ShoppingBag size={20} className="mr-2" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Your Shopping Cart
        </h1>

        {/* Guest User Warning */}
        {!isAuthenticated && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start animate-fade-in">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 mb-1">Login Required to Proceed</h3>
              <p className="text-sm text-yellow-700 mb-3">
                You're shopping as a guest. Please log in to proceed to checkout. 
                Don't worry, your cart items will be saved!
              </p>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium transform hover:scale-105 duration-200"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login to Continue
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-b border-gray-200 divide-y divide-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
              {cartItems.map((item) => {
                const variant = item.product_variant || {};
                const product = item.product || {};
                
                const price = variant.is_discount_active && variant.discount_price
                  ? variant.discount_price
                  : variant.price;
                const originalPrice = variant.is_discount_active ? variant.price : null;
                
                let priceValue = typeof price === 'string' ? parseFloat(price) : price || 0;
                let originalPriceValue = originalPrice 
                  ? (typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice)
                  : null;

                return (
                  <div 
                    key={item.id}
                    className={`py-6 px-4 sm:px-6 hover:bg-gray-50 transition-all duration-300 ${
                      isRemoving === item.id ? 'opacity-0 h-0 overflow-hidden' : ''
                    }`}
                  >
                    <div className="sm:flex">
                      {/* Product Image */}
                      <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded-lg border border-gray-200 group">
                        <img
                          src={product.main_image || product.main_img_url || '/api/placeholder/150/150'}
                          alt={product.name || 'Product'}
                          className="w-full h-full object-center object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                        {variant.is_discount_active && variant.discount_percentage && (
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-br shadow-sm">
                            {variant.discount_percentage}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            <Link 
                              to={`/products/${product.slug || product.id}`} 
                              className={`${themeClasses.primary.hover} transition-colors duration-200`}
                            >
                              {product.name || 'Product Name'}
                            </Link>
                          </h3>
                          <p className="ml-4 text-base font-medium text-gray-900">
                            {siteConfig.currency.symbol}{formatPrice(priceValue)}
                          </p>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          Size: <span className="font-medium">{variant.size || 'N/A'}</span>
                        </p>

                        {originalPriceValue && (
                          <p className="mt-1 text-sm text-gray-400">
                            <s>{siteConfig.currency.symbol}{formatPrice(originalPriceValue)}</s>
                            <span className="ml-2 text-green-500 font-medium">
                              {variant.discount_percentage}% off
                            </span>
                          </p>
                        )}

                        <div className="mt-4 flex justify-between items-center">
                          {/* Quantity Controls */}
                          <div className="flex items-center">
                            <span className="mr-2 text-sm text-gray-500">Qty:</span>
                            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                              {item.quantity === 1 ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                                  disabled={loading}
                                >
                                  <Trash2 size={16} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                  disabled={loading}
                                >
                                  <Minus size={16} />
                                </button>
                              )}

                              <span className="px-4 py-1 text-gray-700 bg-gray-50 font-medium">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                disabled={item.quantity >= 10 || loading}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="flex flex-col items-end">
                            <p className="text-sm font-medium text-gray-900">
                              Total: {siteConfig.currency.symbol}{formatPrice(priceValue * item.quantity)}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="mt-1 text-sm font-medium text-red-600 hover:text-red-500 flex items-center transition-all duration-200"
                              disabled={loading}
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className={`text-sm font-medium ${themeClasses.primary.text} ${themeClasses.primary.hover} flex items-center transition-all duration-200 hover:translate-x-[-5px]`}
              >
                <ChevronRight size={16} className="mr-1 transform rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-16 lg:mt-0 lg:col-span-4">
            <div className="bg-white rounded-lg px-4 py-6 sm:p-6 lg:p-8 shadow-md border border-gray-100 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              {/* Coupon Section - Only for authenticated users */}
              {isAuthenticated && (
                <div className="mt-6">
                  <form onSubmit={handleApplyCoupon}>
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700">
                      Apply Coupon
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div className="relative flex items-stretch flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="coupon"
                          name="coupon"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className={`focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent block w-full rounded-l-md pl-10 sm:text-sm border-gray-300 transition-all duration-200`}
                          disabled={coupon || couponLoading}
                        />
                      </div>
                      {coupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="relative -ml-px inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                        >
                          <X size={16} className="mr-1" />
                          Remove
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={couponLoading}
                          className={`relative -ml-px inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${themeClasses.button.primary} transition-all duration-200 shadow-sm ${
                            couponLoading ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      )}
                    </div>

                    {/* Coupon Messages */}
                    {couponError && (
                      <p className="mt-2 text-sm text-red-600 animate-fade-in">{couponError}</p>
                    )}
                    {couponSuccess && (
                      <p className="mt-2 text-sm text-green-600 animate-fade-in">{couponSuccess}</p>
                    )}
                  </form>
                </div>
              )}

              {/* Order Summary Details */}
              <div className="mt-6 space-y-4">
                {/* Item Count */}
                <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                  <p className="text-sm text-gray-600">
                    Items ({getCartItemCount()})
                  </p>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {siteConfig.currency.symbol}{formatPrice(
                      cartItems.reduce((acc, item) => {
                        const variant = item.product_variant || {};
                        const price = typeof variant.price === 'string' 
                          ? parseFloat(variant.price) 
                          : variant.price || 0;
                        return acc + (price * item.quantity);
                      }, 0)
                    )}
                  </p>
                </div>

                {/* Product Discounts */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Product Discounts</p>
                  <p className="text-sm font-medium text-green-600">
                    -{siteConfig.currency.symbol}{formatPrice(
                      cartItems.reduce((acc, item) => {
                        const variant = item.product_variant || {};
                        const original = typeof variant.price === 'string' 
                          ? parseFloat(variant.price) 
                          : variant.price || 0;
                        const discounted = variant.is_discount_active 
                          ? (typeof variant.discount_price === 'string' 
                              ? parseFloat(variant.discount_price) 
                              : variant.discount_price)
                          : original;
                        return acc + ((original - discounted) * item.quantity);
                      }, 0)
                    )}
                  </p>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between border-t pt-2 border-gray-200">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">
                    {siteConfig.currency.symbol}{formatPrice(cartTotal)}
                  </p>
                </div>

                {/* Shipping */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck size={16} className="text-green-500 mr-1" />
                    <p className="text-sm text-gray-600">Shipping</p>
                  </div>
                  <p className="text-sm font-medium text-green-600">Calculate Later</p>
                </div>

                {/* Coupon Discount */}
                {coupon && discount > 0 && (
                  <div className="flex items-center justify-between animate-fade-in">
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">Coupon Discount</p>
                      <span className="ml-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-xs px-2 py-0.5">
                        {coupon.code}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-600">
                      -{siteConfig.currency.symbol}{formatPrice(discount)}
                    </p>
                  </div>
                )}

                {/* Total Savings */}
                <div className="flex items-center justify-between border-t pt-2 border-gray-200">
                  <p className="text-sm text-gray-600">Total Savings</p>
                  <p className="text-sm font-medium text-green-600">
                    -{siteConfig.currency.symbol}{formatPrice(
                      cartItems.reduce((acc, item) => {
                        const variant = item.product_variant || {};
                        const original = typeof variant.price === 'string' 
                          ? parseFloat(variant.price) 
                          : variant.price || 0;
                        const discounted = variant.is_discount_active 
                          ? (typeof variant.discount_price === 'string' 
                              ? parseFloat(variant.discount_price) 
                              : variant.discount_price)
                          : original;
                        return acc + ((original - discounted) * item.quantity);
                      }, 0) + (discount || 0)
                    )}
                  </p>
                </div>
              </div>

              {/* Order Total */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <p className="text-lg font-bold text-gray-900">Order Total</p>
                <p className={`text-xl font-bold ${themeClasses.primary.text}`}>
                  {siteConfig.currency.symbol}{formatPrice(finalTotal)}
                </p>
              </div>

              {/* Checkout Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className={`w-full ${themeClasses.button.primary} border border-transparent rounded-full shadow-md py-3 px-4 text-base font-medium transition-all duration-200 flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring}`}
                >
                  {!isAuthenticated && <Lock size={18} className="mr-2" />}
                  <CreditCard size={20} className="mr-2" />
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Proceed'}
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>

              {/* Free Shipping Info */}
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className="p-2 rounded-full bg-gray-50 mr-1">
                    <Truck size={16} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">{siteConfig.ShippingAndReturns.freeShippingThreshold}</p>
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

export default Cart;
