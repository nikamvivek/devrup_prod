// // src/pages/wishlist/Wishlist.jsx
// import React, { useContext, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { ShoppingCart, Heart, Trash2, ChevronLeft, AlertCircle, Check, Loader } from 'lucide-react';
// import { WishlistContext } from '../../contexts/WishlistContext';
// import { CartContext } from '../../contexts/CartContext';
// import { motion, AnimatePresence } from 'framer-motion';

// const Wishlist = () => {
//   const { wishlistItems, loading, error, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);
//   const { addToCart } = useContext(CartContext);
//   const [notification, setNotification] = useState(null);
//   const [itemToRemove, setItemToRemove] = useState(null);
  
//   // Fetch wishlist on component mount
//   useEffect(() => {
//     fetchWishlist();
//   }, [fetchWishlist]);
  
//   const handleRemoveFromWishlist = async (productId) => {
//     try {
//       setItemToRemove(productId);
//       await removeFromWishlist(productId);
//       setNotification({
//         type: 'success',
//         message: 'Item removed from wishlist'
//       });
//       setTimeout(() => setNotification(null), 3000);
//     } catch (err) {
//       console.error('Error removing item from wishlist:', err);
//       setNotification({
//         type: 'error',
//         message: 'Failed to remove item from wishlist'
//       });
//       setTimeout(() => setNotification(null), 3000);
//     } finally {
//       setItemToRemove(null);
//     }
//   };
  
//   const handleAddToCart = async (product) => {
//     try {
//       // Get the first variant if there are any
//       if (product.variants && product.variants.length > 0) {
//         const variant = product.variants[0];
//         await addToCart({
//           product_variant_id: variant.id,
//           quantity: 1
//         });
        
//         setNotification({
//           type: 'success',
//           message: `${product.name} added to cart`
//         });
//         setTimeout(() => setNotification(null), 3000);
//       }
//     } catch (err) {
//       console.error('Error adding item to cart:', err);
//       setNotification({
//         type: 'error',
//         message: 'Failed to add item to cart'
//       });
//       setTimeout(() => setNotification(null), 3000);
//     }
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         staggerChildren: 0.1 
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: { duration: 0.3 }
//     },
//     exit: {
//       opacity: 0,
//       x: -300,
//       transition: { duration: 0.3 }
//     }
//   };

//   const notificationVariants = {
//     initial: { opacity: 0, y: -50 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -50 }
//   };
  
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
//           <p className="mt-4 text-indigo-600 font-medium">Loading your wishlist...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
//       {/* Notification */}
//       <AnimatePresence>
//         {notification && (
//           <motion.div 
//             className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${
//               notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
//             }`}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             variants={notificationVariants}
//           >
//             {notification.type === 'success' ? (
//               <Check className="h-5 w-5 text-green-500 mr-2" />
//             ) : (
//               <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//             )}
//             <p className={`text-sm font-medium ${
//               notification.type === 'success' ? 'text-green-800' : 'text-red-800'
//             }`}>
//               {notification.message}
//             </p>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           {/* Back link */}
//           <motion.div 
//             className="mb-8"
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Link
//               to="/"
//               className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 group"
//             >
//               <motion.span 
//                 whileHover={{ x: -5 }}
//                 className="inline-flex items-center"
//               >
//                 <ChevronLeft size={16} className="mr-1 group-hover:mr-2 transition-all duration-200" />
//                 Continue Shopping
//               </motion.span>
//             </Link>
//           </motion.div>
          
//           <motion.div 
//             className="md:flex md:items-center md:justify-between mb-8"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3, delay: 0.1 }}
//           >
//             <div className="flex-1 min-w-0">
//               <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-4xl">
//                 My Wishlist
//               </h1>
//               <p className="mt-2 text-sm text-gray-500">
//                 {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
//               </p>
//             </div>
//           </motion.div>
          
//           {/* Error message */}
//           <AnimatePresence>
//             {error && (
//               <motion.div 
//                 className="rounded-md bg-red-50 p-4 mb-6 border border-red-200 shadow-sm"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//               >
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <AlertCircle className="h-5 w-5 text-red-400" />
//                   </div>
//                   <div className="ml-3">
//                     <h3 className="text-sm font-medium text-red-800">
//                       {error}
//                     </h3>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
          
//           {wishlistItems.length === 0 ? (
//             <motion.div 
//               className="text-center py-16 bg-white shadow-lg rounded-xl border border-gray-100"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.4 }}
//             >
//               <motion.div
//                 initial={{ scale: 0.8, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//               >
//                 <Heart className="mx-auto h-16 w-16 text-gray-400" />
//               </motion.div>
//               <h3 className="mt-4 text-xl font-medium text-gray-900">Your wishlist is empty</h3>
//               <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
//                 Save your favorite items to keep track of products you love.
//               </p>
//               <motion.div 
//                 className="mt-8"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Link
//                   to="/products"
//                   className="inline-flex items-center px-5 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
//                 >
//                   Discover Products
//                 </Link>
//               </motion.div>
//             </motion.div>
//           ) : (
//             <motion.div 
//               className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <ul className="divide-y divide-gray-100">
//                 <AnimatePresence>
//                   {wishlistItems.map((item) => {
//                     const product = item.product;
                    
//                     return (
//                       <motion.li 
//                         key={product.id} 
//                         className="p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-150"
//                         variants={itemVariants}
//                         layout
//                         exit="exit"
//                       >
//                         <div className="flex flex-col sm:flex-row">
//                           {/* Product image */}
//                           <div className="flex-shrink-0 sm:w-48 sm:h-48 mb-4 sm:mb-0">
//                             <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 group relative">
//                               <img
//                                 src={product.main_image || '/api/placeholder/192/192'}
//                                 alt={product.name}
//                                 className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
//                               />
//                               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
//                             </div>
//                           </div>
                          
//                           {/* Product details */}
//                           <div className="flex-1 sm:ml-6">
//                             <div className="flex flex-col sm:flex-row justify-between">
//                               <div>
//                                 <h3 className="text-lg font-medium text-gray-900">
//                                   <Link 
//                                     to={`/products/${product.slug}`} 
//                                     className="hover:text-indigo-600 transition-colors duration-200"
//                                   >
//                                     {product.name}
//                                   </Link>
//                                 </h3>
//                                 <p className="mt-1 text-sm text-gray-500">{product.brand_name}</p>
                                
//                                 {/* Variants */}
//                                 {product.variants && product.variants.length > 0 && (
//                                   <div className="mt-2">
//                                     <p className="text-sm text-gray-500">
//                                       Available sizes:
//                                       <span className="ml-2">
//                                         {product.variants.map((variant, index) => (
//                                           <span 
//                                             key={variant.id || index}
//                                             className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-medium text-gray-700 mr-1"
//                                           >
//                                             {variant.size}
//                                           </span>
//                                         ))}
//                                       </span>
//                                     </p>
//                                   </div>
//                                 )}
                                
//                                 {/* Price */}
//                                 <div className="mt-3">
//                                   {product.variants && product.variants.length > 0 && (
//                                     <div className="flex items-center">
//                                       {product.variants[0].is_discount_active && product.variants[0].discount_price ? (
//                                         <>
//                                           <p className="text-lg font-semibold text-gray-900">
//                                             ${product.variants[0].discount_price}
//                                           </p>
//                                           <p className="ml-2 text-sm text-gray-500 line-through">
//                                             ${product.variants[0].price}
//                                           </p>
//                                           {product.variants[0].discount_percentage && (
//                                             <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                                               {product.variants[0].discount_percentage}% off
//                                             </span>
//                                           )}
//                                         </>
//                                       ) : (
//                                         <p className="text-lg font-semibold text-gray-900">
//                                           ${product.variants[0].price}
//                                         </p>
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>

//                                 {/* Stock */}
//                                 <div className="mt-2">
//                                   {product.variants && product.variants.length > 0 && (
//                                     <p className={`text-sm ${product.variants[0].stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                       {product.variants[0].stock > 0 
//                                         ? `In Stock (${product.variants[0].stock})` 
//                                         : 'Out of Stock'}
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
                              
//                               {/* Actions */}
//                               <div className="flex flex-row sm:flex-col space-y-0 space-x-2 sm:space-x-0 sm:space-y-3 mt-4 sm:mt-0">
//                                 <motion.button
//                                   type="button"
//                                   onClick={() => handleRemoveFromWishlist(product.id)}
//                                   className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
//                                   whileHover={{ scale: 1.03 }}
//                                   whileTap={{ scale: 0.97 }}
//                                   disabled={itemToRemove === product.id}
//                                 >
//                                   {itemToRemove === product.id ? (
//                                     <Loader size={16} className="mr-2 text-gray-500 animate-spin" />
//                                   ) : (
//                                     <Trash2 size={16} className="mr-2 text-gray-500" />
//                                   )}
//                                   Remove
//                                 </motion.button>
                                
//                                 <motion.button
//                                   type="button"
//                                   onClick={() => handleAddToCart(product)}
//                                   disabled={!product.variants || product.variants.length === 0 || product.variants[0].stock <= 0}
//                                   className={`inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200
//                                     ${(!product.variants || product.variants.length === 0 || product.variants[0].stock <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
//                                   whileHover={product.variants && product.variants.length > 0 && product.variants[0].stock > 0 ? { scale: 1.03 } : {}}
//                                   whileTap={product.variants && product.variants.length > 0 && product.variants[0].stock > 0 ? { scale: 0.97 } : {}}
//                                 >
//                                   <ShoppingCart size={16} className="mr-2" />
//                                   Add to Cart
//                                 </motion.button>
                                
//                                 <motion.div
//                                   whileHover={{ scale: 1.03 }}
//                                   whileTap={{ scale: 0.97 }}
//                                 >
//                                   <Link
//                                     to={`/products/${product.slug}`}
//                                     className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
//                                   >
//                                     View Details
//                                   </Link>
//                                 </motion.div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.li>
//                     );
//                   })}
//                 </AnimatePresence>
//               </ul>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Wishlist;

import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Trash2, ChevronLeft, AlertCircle, Check, Loader } from 'lucide-react';
import { WishlistContext } from '../../contexts/WishlistContext';
import { CartContext } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import siteConfig from '../../config/siteConfig';

const Wishlist = () => {
  const { wishlistItems, loading, error, removeFromWishlist, fetchWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [notification, setNotification] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setItemToRemove(productId);
      await removeFromWishlist(productId);
      setNotification({
        type: 'success',
        message: 'Item removed from wishlist'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error removing item from wishlist:', err);
      setNotification({
        type: 'error',
        message: 'Failed to remove item from wishlist'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setItemToRemove(null);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        await addToCart({
          product_variant_id: variant.id,
          quantity: 1
        });

        setNotification({
          type: 'success',
          message: `${product.name} added to cart`
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setNotification({
        type: 'error',
        message: 'Failed to add item to cart'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: -300,
      transition: { duration: 0.3 }
    }
  };

  const notificationVariants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen bg-gradient-to-r ${t.background.gradient}`}>
        <div className="flex flex-col items-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${tc.primary.main} border-indigo-600`}></div>
          <p className={`${tc.primary.text} font-medium mt-4`}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${t.background.gradient} min-h-screen`}>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center ${
              notification.type === 'success'
                ? `bg-green-50 border border-green-200`
                : `bg-red-50 border border-red-200`
            }`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={notificationVariants}
          >
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <p
              className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back link */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className={`${tc.primary.text} inline-flex items-center text-sm font-medium hover:${tc.primary.hover} transition-colors duration-200 group`}
            >
              <motion.span
                whileHover={{ x: -5 }}
                className="inline-flex items-center"
              >
                <ChevronLeft
                  size={16}
                  className={`mr-1 group-hover:mr-2 transition-all duration-200`}
                />
                Continue Shopping
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            className="md:flex md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex-1 min-w-0">
              <h1
                className={`text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient} sm:text-4xl`}
              >
                My Wishlist
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="rounded-md bg-red-50 p-4 mb-6 border border-red-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {wishlistItems.length === 0 ? (
            <motion.div
              className="text-center py-16 bg-white shadow-lg rounded-xl border border-gray-100"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Heart className="mx-auto h-16 w-16 text-gray-400" />
              </motion.div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">
                Your wishlist is empty
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Save your favorite items to keep track of products you love.
              </p>
              <motion.div
                className="mt-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className={`${tc.button.primary} inline-flex items-center px-5 py-3 border border-transparent rounded-full shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200 hover:from-indigo-700 hover:to-purple-700`}
                >
                  Discover Products
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <ul className="divide-y divide-gray-100">
                <AnimatePresence>
                  {wishlistItems.map((item) => {
                    const product = item.product;

                    return (
                      <motion.li
                        key={product.id}
                        className="p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-150"
                        variants={itemVariants}
                        layout
                        exit="exit"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 sm:w-48 sm:h-48 mb-4 sm:mb-0">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 group relative">
                              <img
                                src={product.main_image || '/api/placeholder/192/192'}
                                alt={product.name}
                                className="h-full w-full object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                            </div>
                          </div>

                          <div className="flex-1 sm:ml-6">
                            <div className="flex flex-col sm:flex-row justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  <Link
                                    to={`/products/${product.slug}`}
                                    className={`${tc.primary.text} hover:${tc.primary.hover} transition-colors duration-200`}
                                  >
                                    {product.name}
                                  </Link>
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">{product.brand_name}</p>

                                {product.variants && product.variants.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                      Available sizes:
                                      <span className="ml-2">
                                        {product.variants.map((variant, index) => (
                                          <span
                                            key={variant.id || index}
                                            className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-medium text-gray-700 mr-1"
                                          >
                                            {variant.size}
                                          </span>
                                        ))}
                                      </span>
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3">
                                  {product.variants && product.variants.length > 0 && (
                                    <div className="flex items-center">
                                      {product.variants[0].is_discount_active && product.variants[0].discount_price ? (
                                        <>
                                          <p className="text-lg font-semibold text-gray-900">
                                            ${product.variants[0].discount_price}
                                          </p>
                                          <p className="ml-2 text-sm text-gray-500 line-through">
                                            ${product.variants[0].price}
                                          </p>
                                          {product.variants[0].discount_percentage && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              {product.variants[0].discount_percentage}% off
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                          ${product.variants[0].price}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="mt-2">
                                  {product.variants && product.variants.length > 0 && (
                                    <p
                                      className={`text-sm ${
                                        product.variants[0].stock > 0 ? 'text-green-600' : 'text-red-600'
                                      }`}
                                    >
                                      {product.variants[0].stock > 0
                                        ? `In Stock (${product.variants[0].stock})`
                                        : 'Out of Stock'}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col space-y-0 space-x-2 sm:space-x-0 sm:space-y-3 mt-4 sm:mt-0">
                                <motion.button
                                  type="button"
                                  onClick={() => handleRemoveFromWishlist(product.id)}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200`}
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  disabled={itemToRemove === product.id}
                                >
                                  {itemToRemove === product.id ? (
                                    <Loader size={16} className="mr-2 text-gray-500 animate-spin" />
                                  ) : (
                                    <Trash2 size={16} className="mr-2 text-gray-500" />
                                  )}
                                  Remove
                                </motion.button>

                                <motion.button
                                  type="button"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={
                                    !product.variants ||
                                    product.variants.length === 0 ||
                                    product.variants[0].stock <= 0
                                  }
                                  className={`inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r ${tc.primary.gradient} hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200
                                    ${
                                      !product.variants ||
                                      product.variants.length === 0 ||
                                      product.variants[0].stock <= 0
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                  whileHover={
                                    product.variants &&
                                    product.variants.length > 0 &&
                                    product.variants[0].stock > 0
                                      ? { scale: 1.03 }
                                      : {}
                                  }
                                  whileTap={
                                    product.variants &&
                                    product.variants.length > 0 &&
                                    product.variants[0].stock > 0
                                      ? { scale: 0.97 }
                                      : {}
                                  }
                                >
                                  <ShoppingCart size={16} className="mr-2" />
                                  Add to Cart
                                </motion.button>

                                <motion.div
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                >
                                  <Link
                                    to={`/products/${product.slug}`}
                                    className={`inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${tc.primary.text} bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.primary.ring} transition-all duration-200`}
                                  >
                                    View Details
                                  </Link>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
