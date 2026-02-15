// src/components/product/ProductCard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, ChevronDown } from 'lucide-react';
import { CartContext } from '../../contexts/CartContext';
import { WishlistContext } from '../../contexts/WishlistContext';
import siteConfig from '../../config/siteConfig';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, isInWishlist, removeFromWishlist } = useContext(WishlistContext);
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [showAddedPopup, setShowAddedPopup] = useState(false);

  // Extract theme for easier access
  const theme = siteConfig.theme;

  const getProductVariants = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(variant => {
        if (variant.is_discount_active && variant.discount_price && variant.price) {
          const calculatedPercentage = Math.round(
            ((variant.price - variant.discount_price) / variant.price) * 100
          );
          return { 
            ...variant, 
            discount_percentage: variant.discount_percentage || calculatedPercentage 
          };
        }
        return variant;
      });
    }
      
    if (!product.variants_count || product.variants_count === 0) {
      const hasDiscount = product.discount_price !== null && 
                          product.discount_price < product.price;
      
      const discountPercentage = hasDiscount ? 
        Math.round(((product.price - product.discount_price) / product.price) * 100) : null;
          
      return [{
        id: `mock-${product.id}-default`,
        size: 'Standard',
        price: product.price || 0,
        is_discount_active: hasDiscount,
        discount_price: product.discount_price || null,
        discount_percentage: discountPercentage,
        stock: 10
      }];
    }
      
    const sizeOptions = {
      'Sweets': ['100g', '250g', '500g', '1kg'],
      'Masale': ['100g', '200g', '500g', '1kg'],
      'default': ['Small', 'Medium', 'Large', 'XL']
    };
      
    const categoryName = product.category_name || 'default';
    const sizes = sizeOptions[categoryName] || sizeOptions.default;
      
    return Array.from({ length: Math.min(product.variants_count, sizes.length) }, 
      (_, i) => {
        const basePrice = product.price || (80 + (i * 20));
        const hasDiscount = i === 0 && product.discount_price !== null;
        const discountPrice = hasDiscount ? product.discount_price : null;
        const discountPercentage = hasDiscount && discountPrice ? 
          Math.round(((basePrice - discountPrice) / basePrice) * 100) : null;
          
        return {
          id: `mock-${product.id}-${i}`,
          size: sizes[i],
          price: basePrice,
          is_discount_active: hasDiscount,
          discount_price: discountPrice,
          discount_percentage: discountPercentage,
          stock: 10
        };
      }
    );
  };
    
  const variants = getProductVariants();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = variants[selectedVariantIndex];

  const calculateDiscountPercentage = () => {
    if (!selectedVariant || !selectedVariant.is_discount_active || !selectedVariant.discount_price) {
      return null;
    }
      
    if (selectedVariant.discount_percentage) {
      return selectedVariant.discount_percentage;
    }
      
    if (selectedVariant.price && selectedVariant.discount_price) {
      return Math.round(((selectedVariant.price - selectedVariant.discount_price) / selectedVariant.price) * 100);
    }
      
    return null;
  };

  const discountPercentage = calculateDiscountPercentage();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedVariant) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        quantity: quantity,
        product_variant: {
          id: selectedVariant.id,
          size: selectedVariant.size,
          price: selectedVariant.price,
          discount_price: selectedVariant.discount_price,
          is_discount_active: selectedVariant.is_discount_active,
          stock: selectedVariant.stock
        },
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          main_image: product.main_image,
          category_name: product.category_name
        },
        size: selectedVariant.size,
        price: selectedVariant.is_discount_active && selectedVariant.discount_price 
          ? selectedVariant.discount_price 
          : selectedVariant.price,
        discount_price: selectedVariant.discount_price,
        is_discount_active: selectedVariant.is_discount_active,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.main_image,
        category_name: product.category_name
      });
      
      setIsAddingToCart(true);
      setShowAddedPopup(true);
      
      setTimeout(() => {
        setIsAddingToCart(false);
        setShowAddedPopup(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAnimateHeart(true);
    
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    
    setTimeout(() => {
      setAnimateHeart(false);
    }, 500);
  };

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const hasDiscount = selectedVariant && 
                     selectedVariant.is_discount_active && 
                     selectedVariant.discount_price;

  const displayPrice = hasDiscount ? selectedVariant?.discount_price : selectedVariant?.price;
  const originalPrice = hasDiscount ? selectedVariant?.price : null;

  const formatPrice = (price) => {
    if (price == null) return 'N/A';
    return typeof price === 'number' ? price.toFixed(2) : price;
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) setDropdownOpen(false);
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Inline styles for dynamic theming
  const cardStyle = {
    backgroundColor: theme.background.primary,
    borderRadius: '0.5rem',
    boxShadow: isHovered ? theme.shadow.xl : theme.shadow.sm,
    transition: `all ${siteConfig.animations.duration.normal} ${siteConfig.animations.easing}`
  };

  const priceGradientStyle = {
    background: `linear-gradient(to right, ${theme.primary.main}, ${theme.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  return (
    <div 
      style={cardStyle}
      className="group transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with Wishlist Button */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.slug}`} className="block">
          <div className={siteConfig.components.productCard.imageHeight + " w-full overflow-hidden"}>
            <img 
              src={product.main_image || '/api/placeholder/300/300'} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform ${siteConfig.animations.duration.slow} ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity ${siteConfig.animations.duration.normal} ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        </Link>
        
        {/* Wishlist button */}
        <button 
          onClick={toggleWishlist} 
          className={`absolute top-2 right-2 z-10 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all ${animateHeart ? 'scale-125' : 'scale-100'}`}
          style={{ backgroundColor: theme.neutral.white }}
        >
          <Heart 
            size={18} 
            style={{
              fill: isInWishlist(product.id) ? theme.wishlist.active : 'none',
              color: isInWishlist(product.id) ? theme.wishlist.active : theme.wishlist.inactive,
              transition: `all ${siteConfig.animations.duration.normal}`
            }}
          />
        </button>
        
        {/* Discount badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div 
            className={`absolute top-2 left-2 z-10 bg-gradient-to-r ${theme.discountBadge.gradient} text-xs font-medium px-2.5 py-1 rounded-full shadow-md animate-pulse`}
            style={{ color: theme.discountBadge.text }}
          >
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Added to Cart Popup */}
      {showAddedPopup && (
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 bg-gradient-to-r ${theme.success.gradient} px-4 py-2 rounded-full shadow-lg animate-fadeIn`}
          style={{ color: theme.text.white }}
        >
          Added to Cart!
        </div>
      )}

      {/* Product Details */}
      <div className="p-4">
        {/* Product Name & Category */}
        <Link to={`/products/${product.slug}`} className="block">
          <h3 
            className="font-medium text-sm truncate"
            style={{ color: theme.text.primary }}
          >
            {product.name}
          </h3>
          <div className="flex items-center mt-0.5">
            <span 
              className={`inline-block h-2 w-2 rounded-full bg-gradient-to-r ${theme.categoryBadge.gradient} mr-1`}
            />
            <p className="text-xs" style={{ color: theme.text.secondary }}>
              {product.category_name}
            </p>
          </div>
        </Link>
        
        {/* Price */}
        <div className="mt-2">
          <div className="flex items-center">
            <span 
              className="font-bold text-base"
              style={priceGradientStyle}
            >
              {siteConfig.currency.symbol}{formatPrice(displayPrice)}
            </span>
            
            {hasDiscount && originalPrice && (
              <span 
                className="ml-2 text-xs line-through"
                style={{ color: theme.text.secondary }}
              >
                {siteConfig.currency.symbol}{formatPrice(originalPrice)}
              </span>
            )}
            
            {hasDiscount && discountPercentage > 0 && (
              <span 
                className="ml-1 text-xs font-medium"
                style={{ color: theme.error.main }}
              >
                ({discountPercentage}% off)
              </span>
            )}
          </div>
        </div>

        {/* Size and Quantity selectors */}
        <div className="mt-3 flex space-x-2">
          {/* Size selector */}
          <div className="flex-1 relative">
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: theme.text.primary }}
            >
              Sizes
            </label>
            <button
              type="button"
              className={`w-full border ${siteConfig.components.button.borderRadius} py-1.5 pl-3 pr-10 text-sm flex items-center justify-between text-left transition-colors`}
              style={{
                backgroundColor: theme.background.primary,
                borderColor: dropdownOpen ? theme.border.focus : theme.border.main,
                color: theme.text.primary
              }}
              onClick={(e) => {
                e.stopPropagation();
                variants.length > 1 && setDropdownOpen(!dropdownOpen);
              }}
              disabled={variants.length <= 1}
            >
              <span>{selectedVariant ? selectedVariant.size : 'Select'}</span>
              {variants.length > 1 && (
                <ChevronDown 
                  size={16} 
                  style={{ color: theme.text.tertiary }}
                  className={`transition-transform ${siteConfig.animations.duration.normal} ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              )}
            </button>
 
            {dropdownOpen && variants.length > 1 && (
              <div 
                className={`absolute z-30 mt-1 w-full shadow-xl max-h-48 ${siteConfig.components.button.borderRadius} py-1 text-sm focus:outline-none`}
                style={{ backgroundColor: theme.background.primary }}
                onClick={(e) => e.stopPropagation()}
              >
                {variants.map((variant, index) => {
                  const variantDisplayPrice = variant.is_discount_active && variant.discount_price 
                    ? variant.discount_price 
                    : variant.price;
                  
                  const isSelected = selectedVariantIndex === index;
                  
                  return (
                    <div
                      key={variant.id || index}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors ${siteConfig.animations.duration.fast}`}
                      style={{
                        backgroundColor: isSelected 
                          ? `${theme.primary.light}20` 
                          : 'transparent',
                        color: isSelected ? theme.primary.main : theme.text.primary
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = theme.hover.background;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariantIndex(index);
                        setDropdownOpen(false);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="block truncate">{variant.size}</span>
                        <span className="text-xs font-medium">
                          {siteConfig.currency.symbol}{formatPrice(variantDisplayPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}  
          </div>

          {/* Quantity selector */}
          <div className="flex-1">
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: theme.text.primary }}
            >
              Quantity
            </label>
            <div 
              className={`flex items-center border ${siteConfig.components.button.borderRadius} transition-colors`}
              style={{ borderColor: theme.border.main }}
            >
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  decrementQuantity();
                }}
                disabled={quantity <= 1}
                className={`flex-none px-2 py-1 transition-colors ${siteConfig.animations.duration.fast} disabled:opacity-50`}
                style={{ color: theme.text.secondary }}
              >
                <Minus size={14} />
              </button>
              <input 
                type="text" 
                value={quantity}
                readOnly
                className="flex-1 w-full text-center border-0 focus:ring-0 text-sm py-1.5"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme.text.primary 
                }}
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  incrementQuantity();
                }}
                disabled={quantity >= 10}
                className={`flex-none px-2 py-1 transition-colors ${siteConfig.animations.duration.fast} disabled:opacity-50`}
                style={{ color: theme.text.secondary }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link 
            to={`/products/${product.slug}`}
            className={`text-center py-2 px-2 border ${siteConfig.components.button.borderRadius} text-sm font-medium transition-all ${siteConfig.animations.duration.normal}`}
            style={{
              borderColor: theme.border.main,
              color: theme.text.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.primary.main;
              e.currentTarget.style.borderColor = theme.primary.light;
              e.currentTarget.style.backgroundColor = `${theme.primary.main}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.text.primary;
              e.currentTarget.style.borderColor = theme.border.main;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            View Details
          </Link>
          
          <button 
            onClick={handleAddToCart}
            className={`py-2 px-2 ${siteConfig.components.button.borderRadius} text-sm font-medium flex items-center justify-center transition-all ${siteConfig.animations.duration.normal} shadow-md hover:shadow-lg`}
            style={{
              background: isAddingToCart 
                ? `linear-gradient(to right, ${theme.success.main}, ${theme.success.dark})`
                : `linear-gradient(to right, ${theme.primary.main}, ${theme.secondary.main})`,
              color: theme.text.white
            }}
            onMouseEnter={(e) => {
              if (!isAddingToCart) {
                e.currentTarget.style.background = `linear-gradient(to right, ${theme.primary.dark}, ${theme.secondary.dark})`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isAddingToCart) {
                e.currentTarget.style.background = `linear-gradient(to right, ${theme.primary.main}, ${theme.secondary.main})`;
              }
            }}
          >
            {isAddingToCart ? (
              'Added!'
            ) : (
              <>
                <ShoppingCart size={14} className="mr-1" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;