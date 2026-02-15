// src/pages/product/ProductDetail.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingCart, Share2, ChevronRight, Check, ArrowLeft,
  TruckIcon, ShieldCheck, RotateCcw, ChevronDown, ChevronUp, Info,
  Sparkles
} from 'lucide-react';
import { productService } from '../../services/productService';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
import { AuthContext } from '../../contexts/AuthContext';
import siteConfig from '../../config/siteConfig';


const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [openTab, setOpenTab] = useState('details');
  // Animation states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageLoaded(false);
        setContentVisible(false);

        // Fetch product data
        
        const productData = await productService.getProductBySlug(slug);
        
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setVariants(productData.variants);
          setSelectedVariant(productData.variants[0]);
        } else {
          // If no variants in product data, try to fetch them separately
          try {
            const variantsData = await productService.getProductVariants(slug);
            
            if (variantsData && variantsData.length > 0) {
              setVariants(variantsData);
              setSelectedVariant(variantsData[0]);
            }
          } catch (variantErr) {
            
          }
        }

        // Fetch reviews - use try/catch to prevent it from breaking the whole component
        try {
          const reviewsData = await productService.getProductReviews(slug);
          setReviews(reviewsData);
        } catch (reviewErr) {
          
          setReviews([]);
        }

        // Fetch related products - use try/catch to prevent it from breaking the whole component
        if (productData.category) {
          try {
            const relatedData = await productService.getProductsByCategory(productData.category.slug, { limit: 4 });
            // Filter out the current product
            setRelatedProducts(
              relatedData.results.filter((p) => p.id !== productData.id)
            );
          } catch (relatedErr) {
            
            setRelatedProducts([]);
          }
        }

        // Trigger animations after loading data
        setTimeout(() => {
          setContentVisible(true);
        }, 300);
      } catch (err) {
        
        setError(`Failed to load product details: ${err.response?.data?.detail || 'Please try again later.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();

    // Reset state when slug changes
    return () => {
      setProduct(null);
      setVariants([]);
      setSelectedVariant(null);
      setQuantity(1);
      setActiveImage(0);
      setReviews([]);
      setAddedToCart(false);
      setRelatedProducts([]);
      setImageLoaded(false);
      setContentVisible(false);
    };
  }, [slug]);

  const handleVariantChange = (variantId) => {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= (selectedVariant?.stock || 10)) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < (selectedVariant?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      
      return;
    }

    try {
      console.log('Adding to cart:', {
        product_variant_id: selectedVariant.id,
        quantity: quantity
      });

      await addToCart({
        product_variant_id: selectedVariant.id,
        quantity: quantity
      });

      // Show success message
      setAddedToCart(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (err) {
      
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${slug}` } });
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      
    }
  };

  const getDiscountPercentage = () => {
    if (!selectedVariant || !selectedVariant.is_discount_active || !selectedVariant.discount_price) return null;
    return selectedVariant.discount_percentage || Math.round(
      ((selectedVariant.price - selectedVariant.discount_price) / selectedVariant.price) * 100
    );
  };

  const getAverageRating = () => {
    return product?.average_rating || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-gray-300 animate-spin opacity-25"></div>
          <div className={`absolute inset-0 h-16 w-16 rounded-full border-t-2 ${themeClasses.primary.text}`} style={{ borderColor: 'currentColor' }}></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-10 bg-gradient-to-r from-red-50 to-pink-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md animate-fade-in duration-500">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-100">
              <Info size={24} className="text-red-500" />
            </div>
          </div>
          <p className="text-red-500 font-medium">{error || 'Product not found'}</p>
          <Link
            to="/products"
            className={`mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium ${themeClasses.button.primary} transition-all duration-300`}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 min-h-screen transition-all duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className={`py-4 transform transition-all duration-700 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 text-sm text-gray-500">
            <li>
              <Link to="/" className={`${themeClasses.primary.hover} transition-colors duration-200`}>Home</Link>
            </li>
            <ChevronRight size={14} className="flex-shrink-0" />
            <li>
              <Link to="/products" className={`${themeClasses.primary.hover} transition-colors duration-200`}>Products</Link>
            </li>
            {product.category && (
              <>
                <ChevronRight size={14} className="flex-shrink-0" />
                <li>
                  <Link
                    to={`/products?category=${product.category.slug}`}
                    className={`${themeClasses.primary.hover} transition-colors duration-200`}
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight size={14} className="flex-shrink-0" />
            <li className="text-gray-800 font-medium truncate">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Success message */}
        {addedToCart && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-6 py-3 rounded-lg flex items-center shadow-lg animate-bounce-once text-white">
              <Check size={18} className="mr-2" />
              <span className="font-medium">Added to cart successfully!</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="lg:grid lg:grid-cols-2 lg:items-start">
            {/* Image gallery */}
          {/* Image gallery */}
<div className="p-4 lg:border-r lg:border-gray-100">
  <div className="w-full overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center" style={{ height: '500px' }}>
    <img
      src={product.images && product.images.length > 0
        ? product.images[activeImage].image
        : product.main_image || '/api/placeholder/600/400'}
      alt={product.name}
      className="max-w-full max-h-full object-contain p-4"
    />
  </div>

  {/* Thumbnail images */}
  {product.images && product.images.length > 1 && (
    <div className="mt-4 grid grid-cols-5 gap-3">
      {product.images.map((image, idx) => (
        <button
          key={image.id}
          onClick={() => setActiveImage(idx)}
          className={`relative rounded-md overflow-hidden transition-all duration-200 transform bg-gray-50 flex items-center justify-center ${activeImage === idx
              ? `ring-2 ${themeClasses.primary.ring} scale-105`
              : 'ring-1 ring-gray-200 hover:ring-gray-300'
            }`}
          style={activeImage === idx ? { ringColor: 'currentColor', height: '80px' } : { height: '80px' }}
        >
          <img
            src={image.image}
            alt={`${product.name} view ${idx + 1}`}
            className="max-w-full max-h-full object-contain p-2"
          />
        </button>
      ))}
    </div>
  )}
</div>

            {/* Product info */}
            <div className="p-6">
              {/* Brand */}
              {product.brand && (
                <div className="mb-2">
                  <Link
                    to={`/products?brand=${product.brand.id}`}
                    className="inline-block px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-102"
                  >
                    {product.brand.name}
                  </Link>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="mt-3 flex items-center">
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <Star
                      key={rating}
                      size={18}
                      className={`${getAverageRating() > rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                        } transition-all duration-300 hover:scale-110`}
                    />
                  ))}
                </div>
                <Link to="#reviews" className={`ml-2 text-sm font-medium ${themeClasses.primary.text} ${themeClasses.primary.hover} transition-colors duration-200`}>
                  {product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'}
                </Link>

                {getDiscountPercentage() && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800">
                    {getDiscountPercentage()}% OFF
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mt-4">
                {selectedVariant?.is_discount_active && selectedVariant?.discount_price ? (
                  <div className="flex items-center">
                    <p className="text-3xl text-gray-900 font-bold">{siteConfig.currency.symbol}{selectedVariant.discount_price}</p>
                    <p className="ml-2 text-lg text-gray-500 line-through">{siteConfig.currency.symbol}{selectedVariant.price}</p>
                  </div>
                ) : (
                  <p className="text-3xl text-gray-900 font-bold">
                    {siteConfig.currency.symbol}{selectedVariant?.price || 'N/A'}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div className="mt-4 text-gray-600">
                <p>
                  {(() => {
                    // Create temporary DOM element to extract plain text
                    const tmp = document.createElement("DIV");
                    tmp.innerHTML = product.description;
                    const plainText = tmp.textContent || tmp.innerText || "";

                    // Truncate to 150 characters safely
                    return plainText.length > 150 ? plainText.substring(0, 150) + "..." : plainText;
                  })()}
                </p>
              </div>


              <div className="my-6 border-t border-b border-gray-100 py-6">
                {/* Variants */}
                {variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Select Size</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => handleVariantChange(variant.id)}
                          className={`
                            group relative border rounded-lg py-3 px-3 flex items-center justify-center text-sm font-medium uppercase transition-all duration-300 transform hover:scale-105
                            ${selectedVariant?.id === variant.id
                              ? `${themeClasses.primary.gradient} border-transparent text-white shadow-md`
                              : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-sm'}
                            ${variant.stock <= 0 ? 'cursor-not-allowed opacity-50' : ''}
                          `}
                          disabled={variant.stock <= 0}
                        >
                          {variant.size}
                          {variant.stock <= 0 && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full animate-pulse">
                              Out
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock status */}
                <div className="mb-6">
                  {selectedVariant?.stock > 0 ? (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="font-medium text-green-600">
                        In stock
                      </span>
                      <span className="ml-1 text-gray-500">
                        ({selectedVariant.stock} available)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-medium text-red-600">Out of stock</span>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                {selectedVariant?.stock > 0 && (
                  <div className="mb-6">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        className="inline-flex items-center justify-center p-2 rounded-l-lg border border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
                      >
                        <span className="sr-only">Decrease</span>
                        <span className="text-lg font-medium">−</span>
                      </button>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className={`block w-16 text-center border-t border-b border-gray-300 py-2 focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent`}
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1"
                        max={selectedVariant.stock}
                      />
                      <button
                        type="button"
                        onClick={increaseQuantity}
                        className="inline-flex items-center justify-center p-2 rounded-r-lg border border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
                      >
                        <span className="sr-only">Increase</span>
                        <span className="text-lg font-medium">+</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add to cart and wishlist buttons */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className={`flex-1 ${themeClasses.button.primary} border border-transparent rounded-lg py-3 px-8 flex items-center justify-center text-base font-medium transition-all duration-300 transform hover:scale-102 shadow-md ${(!selectedVariant || selectedVariant.stock <= 0) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`flex-1 bg-white border rounded-lg py-3 px-8 flex items-center justify-center text-base font-medium transition-all duration-300 transform hover:scale-102 shadow-sm ${isInWishlist(product.id)
                      ? 'border-red-200 text-red-600 hover:bg-red-50 bg-gradient-to-r from-red-50 to-pink-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Heart
                    size={20}
                    className={`mr-2 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500 animate-pulse' : ''}`}
                  />
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Shipping & Returns */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center text-sm text-gray-500 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <TruckIcon size={18} className={`${themeClasses.primary.text} mr-2`} />
                  <span>{siteConfig.ShippingAndReturns.freeShippingThreshold}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <ShieldCheck size={18} className={`${themeClasses.primary.text} mr-2`} />
                  <span>{siteConfig.ShippingAndReturns.standardwarrenty}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                  <RotateCcw size={18} className={`${themeClasses.primary.text} mr-2`} />
                  <span>{siteConfig.ShippingAndReturns.returnPolicyDuration}</span>
                </div>
              </div>

              {/* Share button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 transform hover:scale-105`}
                >
                  <Share2 size={16} className="mr-2" />
                  Share Product
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product details and reviews */}
        <div className={`mt-8 bg-white rounded-2xl shadow-md overflow-hidden backdrop-blur-sm bg-opacity-80 border border-gray-50 transform transition-all duration-700 delay-100 ${contentVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setOpenTab('details')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300 ${openTab === 'details'
                    ? `border-current ${themeClasses.primary.text} bg-gradient-to-t from-gray-50 to-white`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                style={openTab === 'details' ? { borderColor: 'currentColor' } : {}}
              >
                Product Details
              </button>
              <button
                onClick={() => setOpenTab('reviews')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300 ${openTab === 'reviews'
                    ? `border-current ${themeClasses.primary.text} bg-gradient-to-t from-gray-50 to-white`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                style={openTab === 'reviews' ? { borderColor: 'currentColor' } : {}}
              >
                Reviews ({product.reviews_count})
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {openTab === 'details' && (
              <div className="animate-fade-in duration-300">
                <div className="prose prose-gray max-w-none">
                  <div
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />

                  {/* Product attributes */}
                  {product.attributes && product.attributes.length > 0 && (
                    <div className="mt-8">
                      <h4 className={`text-lg font-semibold ${themeClasses.primary.text} mb-4 flex items-center`}>
                        <Sparkles size={18} className={`mr-2 ${themeClasses.primary.text}`} /> Features
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {product.attributes.map((attr) => (
                          <div key={attr.id} className="flex items-start bg-gray-50 p-3 rounded-lg transform hover:scale-102 transition-all duration-300 shadow-sm hover:shadow-md">
                            <div className="flex-shrink-0">
                              <Check size={16} className={`h-5 w-5 ${themeClasses.primary.text}`} />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-800">{attr.attribute_type}</p>
                              <p className="text-sm text-gray-600">{attr.attribute_value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {openTab === 'reviews' && (
              <div id="reviews" className="animate-fade-in duration-300">
                {/* Average rating */}
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`text-5xl font-bold ${themeClasses.primary.text}`}>{getAverageRating().toFixed(1)}</div>
                    <div className="flex mt-1">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <Star
                          key={rating}
                          size={16}
                          className={`${getAverageRating() > rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                            } transition-all duration-300 hover:scale-110`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {product.reviews_count} {product.reviews_count === 1 ? 'review' : 'reviews'}
                    </div>
                  </div>

                  <div className="flex-1 max-w-md">
                    {/* Rating bars */}
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = product.reviews_count ? (count / product.reviews_count) * 100 : 0;

                        return (
                          <div key={rating} className="flex items-center text-sm">
                            <span className="w-2">{rating}</span>
                            <div className="ml-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-gray-500 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Write a review button */}
                  <div>
                    <Link
                      to={isAuthenticated ? `/products/${product.slug}/review` : '/login'}
                      state={!isAuthenticated ? { from: `/products/${product.slug}/review` } : undefined}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm ${themeClasses.button.primary} transition-all duration-300 transform hover:scale-105`}
                    >
                      Write a Review
                    </Link>
                  </div>
                </div>

                {/* Review list */}
                <div className="mt-8 space-y-6 divide-y divide-gray-100">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    reviews.map((review, index) => (
                      <div key={review.id} className={`pt-6 transform transition-all duration-500 hover:bg-gray-50 p-3 rounded-lg hover:shadow-sm`} style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`inline-block h-8 w-8 rounded-full ${themeClasses.primary.gradient} text-white flex items-center justify-center font-medium`}>
                              {review.user.first_name.charAt(0)}{review.user.last_name.charAt(0)}
                            </div>
                            <h4 className="ml-2 text-sm font-medium text-gray-900">
                              {review.user.first_name} {review.user.last_name.charAt(0)}.
                            </h4>
                            <div className="hidden sm:block mx-2 text-gray-300">·</div>
                            <div className="hidden sm:flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <Star
                                  key={rating}
                                  size={14}
                                  className={`${review.rating > rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="sm:hidden flex items-center mt-1">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <Star
                              key={rating}
                              size={14}
                              className={`${review.rating > rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>

                        <div className="mt-3">
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className={`mt-12 transform transition-all duration-700 delay-200 ${contentVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className={`text-xl font-bold ${themeClasses.primary.text} mb-6 flex items-center`}>
              <Sparkles size={20} className={`mr-2 ${themeClasses.primary.text}`} /> You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-500 hover:shadow-lg group transform hover:scale-102 border border-gray-50"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-50 relative">
                    <img
                      src={relatedProduct.main_image || '/api/placeholder/300/300'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/30 to-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <Link
                        to={`/products/${relatedProduct.slug}`}
                        className={`bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium ${themeClasses.primary.bgHover} hover:text-white transition-colors duration-300 transform group-hover:scale-105 shadow-lg`}
                      >
                        Quick View
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      <Link to={`/products/${relatedProduct.slug}`} className={`${themeClasses.primary.hover} transition-colors duration-200`}>
                        {relatedProduct.name}
                      </Link>
                    </h3>
                    {relatedProduct.brand_name && (
                      <p className="mt-1 text-xs text-gray-500">{relatedProduct.brand_name}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <p className={`text-sm font-medium ${themeClasses.primary.text}`}>
                        {siteConfig.currency.symbol}{relatedProduct.price || 'N/A'}
                      </p>
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="ml-1 text-xs text-gray-500">
                          {relatedProduct.average_rating ? relatedProduct.average_rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom keyframes for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes bounceOnce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0) translateX(-50%);
    }
    40% {
      transform: translateY(-20px) translateX(-50%);
    }
    60% {
      transform: translateY(-10px) translateX(-50%);
    }
  }
  
  .animate-bounce-once {
    animation: bounceOnce 2s ease forwards;
  }
  
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
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }
  
  .hover\\:scale-105:hover {
    transform: scale(1.05);
  }
  
  .scale-102 {
    transform: scale(1.02);
  }
  
  .scale-105 {
    transform: scale(1.05);
  }
`;
document.head.appendChild(style);

export default ProductDetail;
