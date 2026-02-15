// // src/pages/product/ProductList.jsx
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { productService } from '../../services/productService';
// import ProductCard from '../../components/product/ProductCard';
// import { Filter, ChevronDown, ChevronUp, X, Search, ChevronRight, Sliders, Tag, DollarSign, Grid, List, RefreshCcw, ArrowRight, IndianRupee } from 'lucide-react';
// import siteConfig from '../../config/siteConfig';

// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalItems, setTotalItems] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [priceRangeOpen, setPriceRangeOpen] = useState(true);
//   const [categoryFiltersOpen, setCategoryFiltersOpen] = useState(true);
//   const [brandFiltersOpen, setBrandFiltersOpen] = useState(true);
//   const [isFiltering, setIsFiltering] = useState(false);
  
//   // Filter and sort states
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedBrand, setSelectedBrand] = useState('');
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [sortOption, setSortOption] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const location = useLocation();
//   const navigate = useNavigate();
//   const itemsPerPage = 12;
  
//   // Parse query parameters on mount and when URL changes
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
    
//     const category = params.get('category') || '';
//     const brand = params.get('brand') || '';
//     const min = params.get('min_price') || '';
//     const max = params.get('max_price') || '';
//     const sort = params.get('sort') || '';
//     const search = params.get('search') || '';
//     const page = parseInt(params.get('page') || '1', 10);
    
//     setSelectedCategory(category);
//     setSelectedBrand(brand);
//     setMinPrice(min);
//     setMaxPrice(max);
//     setSortOption(sort);
//     setSearchQuery(search);
//     setCurrentPage(page);
    
//     // Fetch data with these filters
//     fetchProducts({
//       category,
//       brand,
//       min_price: min,
//       max_price: max,
//       sort,
//       search,
//       page
//     });
//   }, [location.search]);
  
//   // Initial data fetch for categories and brands
//   useEffect(() => {
//     const fetchFilterData = async () => {
//       try {
//         const [categoriesData, brandsData] = await Promise.all([
//           productService.getCategories(),
//           productService.getBrands()
//         ]);
        
//         // Handle categories data format
//         if (Array.isArray(categoriesData)) {
//           setCategories(categoriesData);
//         } else if (categoriesData && categoriesData.results && Array.isArray(categoriesData.results)) {
//           setCategories(categoriesData.results);
//         } else {
//           console.error('Unexpected categories data format:', categoriesData);
//           setCategories([]);
//         }
        
//         // Handle brands data format
//         if (Array.isArray(brandsData)) {
//           setBrands(brandsData);
//         } else if (brandsData && brandsData.results && Array.isArray(brandsData.results)) {
//           setBrands(brandsData.results);
//         } else {
//           console.error('Unexpected brands data format:', brandsData);
//           setBrands([]);
//         }
//       } catch (err) {
//         console.error('Error fetching filter data:', err);
//         setError('Failed to load filter options.');
//       }
//     };
    
//     fetchFilterData();
//   }, []);
  
//   const fetchProducts = async (params) => {
//     try {
//       setLoading(true);
//       setIsFiltering(true);
      
//       // Create a new object to avoid modifying the input params
//       const queryParams = { ...params };
      
//       // Set pagination parameters
//       queryParams.page = params.page || 1;
//       queryParams.limit = itemsPerPage;
      
//       // Convert category slug to proper parameter format
//       if (params.category) {
//         queryParams.category__slug = params.category;
//         delete queryParams.category;
//       }
      
//       // Handle price range parameters - ensure they're numbers
//       if (params.min_price && !isNaN(parseFloat(params.min_price))) {
//         queryParams.min_price = parseFloat(params.min_price);
//       }
      
//       if (params.max_price && !isNaN(parseFloat(params.max_price))) {
//         queryParams.max_price = parseFloat(params.max_price);
//       }
      
//       // Convert sort parameter to API expected format
//       if (params.sort) {
//         switch (params.sort) {
//           case 'price_low':
//             queryParams.ordering = 'variants__price';
//             break;
//           case 'price_high':
//             queryParams.ordering = '-variants__price';
//             break;
//           case 'newest':
//             queryParams.ordering = '-created_at';
//             break;
//           case 'oldest':
//             queryParams.ordering = 'created_at';
//             break;
//           case 'popular':
//             queryParams.ordering = '-reviews_count';
//             break;
//           default:
//             break;
//         }
        
//         delete queryParams.sort;
//       }
      
//       console.log('Fetching products with params:', queryParams); // Debug log
      
//       // Fetch products with filters
//       const response = await productService.getProducts(queryParams);
      
//       setProducts(response.results || []);
//       setTotalItems(response.count || 0);
//       setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching products:', err);
//       setError('Failed to load products. Please try again.');
//       setProducts([]);
//     } finally {
//       setLoading(false);
//       // Add a small delay to make the animation noticeable
//       setTimeout(() => {
//         setIsFiltering(false);
//       }, 300);
//     }
//   };
  
//   // Apply filters and update URL
//   const applyFilters = () => {
//     const params = new URLSearchParams();
    
//     if (selectedCategory) params.set('category', selectedCategory);
//     if (selectedBrand) params.set('brand', selectedBrand);
//     if (minPrice) params.set('min_price', minPrice);
//     if (maxPrice) params.set('max_price', maxPrice);
//     if (sortOption) params.set('sort', sortOption);
//     if (searchQuery) params.set('search', searchQuery);
    
//     // Reset to first page when applying new filters
//     params.set('page', '1');
    
//     // Update URL with new filters
//     navigate(`/products?${params.toString()}`);
    
//     // Close mobile filters if open
//     setFiltersOpen(false);
//   };
  
//   // Clear all filters
//   const clearFilters = () => {
//     setSelectedCategory('');
//     setSelectedBrand('');
//     setMinPrice('');
//     setMaxPrice('');
//     setSortOption('');
//     setSearchQuery('');
    
//     navigate('/products');
//   };
  
//   // Handle page change
//   const handlePageChange = (page) => {
//     const params = new URLSearchParams(location.search);
//     params.set('page', page.toString());
//     navigate(`/products?${params.toString()}`);
//   };
  
//   // Handle search form submission
//   const handleSearch = (e) => {
//     e.preventDefault();
//     applyFilters();
//   };

//   // Check if filters are applied
//   const hasFilters = () => {
//     return selectedCategory || selectedBrand || minPrice || maxPrice || searchQuery || sortOption;
//   };
  
//   return (
//     <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="pt-8 pb-24">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
//               Product Catalog
//             </h1>
//             <p className="mt-4 max-w-3xl mx-auto text-base text-gray-500">
//               Browse our collection of high-quality products
//             </p>
//           </div>
          
//           {/* Search and Sort Bar */}
//           <div className="mt-8 bg-white p-4 rounded-xl shadow-sm flex flex-col lg:flex-row justify-between gap-4 border border-gray-100">
//             <form onSubmit={handleSearch} className="flex-1">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Search size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 <button
//                   type="submit"
//                   className="absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
//                 >
//                   <ArrowRight size={18} />
//                 </button>
//               </div>
//             </form>
            
//             <div className="flex gap-4 items-center">
            
              
//               <div className="flex items-center space-x-2">
//                 <span className="text-sm font-medium text-gray-700 hidden md:inline">
//                   Sort by:
//                 </span>
//                 <select
//                   value={sortOption}
//                   onChange={(e) => {
//                     setSortOption(e.target.value);
//                     // Apply immediately when sort changes
//                     const params = new URLSearchParams(location.search);
//                     if (e.target.value) {
//                       params.set('sort', e.target.value);
//                     } else {
//                       params.delete('sort');
//                     }
//                     params.set('page', '1');
//                     navigate(`/products?${params.toString()}`);
//                   }}
//                   className="block pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-gray-50 transition-colors duration-200"
//                 >
//                   <option value="">Relevance</option>
//                   <option value="price_low">Price: Low to High</option>
//                   <option value="price_high">Price: High to Low</option>
//                   <option value="newest">Newest First</option>
//                   <option value="popular">Most Popular</option>
//                 </select>
//               </div>
              
//               {/* Mobile filter button */}
//               <button
//                 type="button"
//                 className="lg:hidden px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center"
//                 onClick={() => setFiltersOpen(!filtersOpen)}
//               >
//                 <Filter size={16} className="mr-2" />
//                 Filters
//               </button>
//             </div>
//           </div>
          
//           {/* Active filters display */}
//           {hasFilters() && (
//             <div className="mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 animate-fade-in">
//               <div className="flex flex-wrap gap-2 items-center">
//                 <span className="text-sm font-medium text-indigo-800">Active Filters:</span>
                
//                 {selectedCategory && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                     Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
//                     <button 
//                       onClick={() => {
//                         setSelectedCategory('');
//                         applyFilters();
//                       }}
//                       className="ml-1 text-indigo-600 hover:text-indigo-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 )}
                
//                 {selectedBrand && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                     Brand: {brands.find(b => b.id === selectedBrand)?.name || selectedBrand}
//                     <button 
//                       onClick={() => {
//                         setSelectedBrand('');
//                         applyFilters();
//                       }}
//                       className="ml-1 text-indigo-600 hover:text-indigo-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 )}
                
//                 {(minPrice || maxPrice) && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                     Price: {minPrice ? `${siteConfig.currency.symbol}${minPrice}` : `${siteConfig.currency.symbol}0`} - {maxPrice ? `${siteConfig.currency.symbol}${maxPrice}` : 'Any'}
//                     <button 
//                       onClick={() => {
//                         setMinPrice('');
//                         setMaxPrice('');
//                         applyFilters();
//                       }}
//                       className="ml-1 text-indigo-600 hover:text-indigo-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 )}
                
//                 {searchQuery && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                     Search: "{searchQuery}"
//                     <button 
//                       onClick={() => {
//                         setSearchQuery('');
//                         applyFilters();
//                       }}
//                       className="ml-1 text-indigo-600 hover:text-indigo-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 )}
                
//                 {sortOption && (
//                   <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                     Sort: {
//                       sortOption === 'price_low' ? 'Price: Low to High' :
//                       sortOption === 'price_high' ? 'Price: High to Low' :
//                       sortOption === 'newest' ? 'Newest First' :
//                       sortOption === 'popular' ? 'Most Popular' : sortOption
//                     }
//                     <button 
//                       onClick={() => {
//                         setSortOption('');
//                         applyFilters();
//                       }}
//                       className="ml-1 text-indigo-600 hover:text-indigo-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 )}
                
//                 <button
//                   type="button"
//                   onClick={clearFilters}
//                   className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 transition-colors duration-200 bg-red-50 hover:bg-red-100 rounded-full flex items-center"
//                 >
//                   <RefreshCcw size={12} className="mr-1" />
//                   Clear All
//                 </button>
//               </div>
//             </div>
//           )}
          
//           <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
//             {/* Mobile filter dialog */}
//             {filtersOpen && (
//               <div className="fixed inset-0 flex z-40 lg:hidden">
//                 <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}></div>
//                 <div className="relative max-w-xs w-full bg-white shadow-xl pb-12 flex flex-col overflow-y-auto transition-transform duration-300 transform translate-x-0 animate-slide-in">
//                   <div className="px-4 py-5 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600">
//                     <h2 className="text-lg font-medium text-white flex items-center">
//                       <Sliders size={18} className="mr-2" />
//                       Filter Products
//                     </h2>
//                     <button
//                       type="button"
//                       className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
//                       onClick={() => setFiltersOpen(false)}
//                     >
//                       <X size={20} />
//                     </button>
//                   </div>
                  
//                   {/* Mobile filter options */}
//                   <div className="px-4 py-4 border-b border-gray-200">
//                     <h3 className="flow-root -my-1">
//                       <button
//                         type="button"
//                         className="py-3 w-full flex items-center justify-between text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
//                         onClick={() => setCategoryFiltersOpen(!categoryFiltersOpen)}
//                       >
//                         <span className="font-medium text-gray-900 flex items-center">
//                           <Tag size={16} className="mr-2 text-indigo-500" />
//                           Categories
//                         </span>
//                         <span className="ml-6 flex items-center">
//                           {categoryFiltersOpen ? 
//                             <ChevronUp size={16} className="text-indigo-500" /> : 
//                             <ChevronDown size={16} className="text-gray-400" />
//                           }
//                         </span>
//                       </button>
//                     </h3>
//                     {categoryFiltersOpen && (
//                       <div className="pt-4 pl-6 space-y-4 animate-fade-in">
//                         {Array.isArray(categories) && categories.map((category) => (
//                           <div key={category.id} className="flex items-center space-x-3">
//                             <input
//                               id={`mobile-category-${category.id}`}
//                               name="category"
//                               type="radio"
//                               checked={selectedCategory === category.slug}
//                               onChange={() => setSelectedCategory(category.slug)}
//                               className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <label 
//                               htmlFor={`mobile-category-${category.id}`} 
//                               className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors duration-200"
//                             >
//                               {category.name}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Brands filter for mobile */}
//                   <div className="px-4 py-4 border-b border-gray-200">
//                     <h3 className="flow-root -my-1">
//                       <button
//                         type="button"
//                         className="py-3 w-full flex items-center justify-between text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
//                         onClick={() => setBrandFiltersOpen(!brandFiltersOpen)}
//                       >
//                         <span className="font-medium text-gray-900 flex items-center">
//                           <Tag size={16} className="mr-2 text-indigo-500" />
//                           Brands
//                         </span>
//                         <span className="ml-6 flex items-center">
//                           {brandFiltersOpen ? 
//                             <ChevronUp size={16} className="text-indigo-500" /> : 
//                             <ChevronDown size={16} className="text-gray-400" />
//                           }
//                         </span>
//                       </button>
//                     </h3>
//                     {brandFiltersOpen && (
//                       <div className="pt-4 pl-6 space-y-4 animate-fade-in">
//                         {Array.isArray(brands) && brands.map((brand) => (
//                           <div key={brand.id} className="flex items-center space-x-3">
//                             <input
//                               id={`mobile-brand-${brand.id}`}
//                               name="brand"
//                               type="radio"
//                               checked={selectedBrand === brand.id}
//                               onChange={() => setSelectedBrand(brand.id)}
//                               className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <label 
//                               htmlFor={`mobile-brand-${brand.id}`} 
//                               className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors duration-200"
//                             >
//                               {brand.name}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Price range filter for mobile */}
//                   <div className="px-4 py-4 border-b border-gray-200">
//                     <h3 className="flow-root -my-1">
//                       <button
//                         type="button"
//                         className="py-3 w-full flex items-center justify-between text-sm text-gray-700 hover:text-indigo-600 transition-colors duration-200"
//                         onClick={() => setPriceRangeOpen(!priceRangeOpen)}
//                       >
//                         <span className="font-medium text-gray-900 flex items-center">
//                           <IndianRupee size={16} className="mr-2 text-indigo-500" />
//                           Price Range
//                         </span>
//                         <span className="ml-6 flex items-center">
//                           {priceRangeOpen ? 
//                             <ChevronUp size={16} className="text-indigo-500" /> : 
//                             <ChevronDown size={16} className="text-gray-400" />
//                           }
//                         </span>
//                       </button>
//                     </h3>
//                     {priceRangeOpen && (
//                       <div className="pt-4 px-2 animate-fade-in">
//                         <div className="grid grid-cols-2 gap-2">
//                           <div>
//                             <label htmlFor="mobile-min-price" className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
//                             <div className="relative rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
//                               </div>
//                               <input
//                                 type="number"
//                                 id="mobile-min-price"
//                                 placeholder="Min"
//                                 value={minPrice}
//                                 onChange={(e) => setMinPrice(e.target.value)}
//                                 className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <label htmlFor="mobile-max-price" className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
//                             <div className="relative rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
//                               </div>
//                               <input
//                                 type="number"
//                                 id="mobile-max-price"
//                                 placeholder="Max"
//                                 value={maxPrice}
//                                 onChange={(e) => setMaxPrice(e.target.value)}
//                                 className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Mobile filter buttons */}
//                   <div className="p-4 sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
//                     <div className="grid grid-cols-2 gap-3">
//                       <button
//                         type="button"
//                         onClick={clearFilters}
//                         className="bg-white border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                       >
//                         <RefreshCcw size={14} className="mr-2" />
//                         Clear All
//                       </button>
//                       <button
//                         type="button"
//                         onClick={applyFilters}
//                         className="bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
//                       >
//                         Apply Filters
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Desktop filter sidebar */}
//             <div className="hidden lg:block">
//               <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
//                 <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
//                   <h2 className="text-lg font-medium text-white flex items-center">
//                     <Filter size={18} className="mr-2" />
//                     Filter Products
//                   </h2>
//                 </div>
                
//                 <div className="divide-y divide-gray-200">
//                   {/* Categories filter */}
//                   <div className="p-4">
//                     <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setCategoryFiltersOpen(!categoryFiltersOpen)}>
//                       <div className="flex items-center">
//                         <Tag size={16} className="mr-2 text-indigo-500" />
//                         Categories
//                       </div>
//                       {categoryFiltersOpen ? 
//                         <ChevronUp size={16} className="text-indigo-500" /> : 
//                         <ChevronDown size={16} className="text-gray-400" />
//                       }
//                     </h3>
                    
//                     {categoryFiltersOpen && (
//                       <div className="mt-4 space-y-2 pl-2 animate-fade-in">
//                         <div className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
//                           <input
//                             id="category-all"
//                             name="category"
//                             type="radio"
//                             checked={selectedCategory === ''}
//                             onChange={() => setSelectedCategory('')}
//                             className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                           />
//                           <label htmlFor="category-all" className="ml-3 text-sm text-gray-600 cursor-pointer">
//                             All Categories
//                           </label>
//                         </div>
//                         {Array.isArray(categories) && categories.map((category) => (
//                           <div key={category.id} className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
//                             <input
//                               id={`category-${category.id}`}
//                               name="category"
//                               type="radio"
//                               checked={selectedCategory === category.slug}
//                               onChange={() => setSelectedCategory(category.slug)}
//                               className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-200">
//                               {category.name}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Brands filter */}
//                   <div className="p-4">
//                     <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setBrandFiltersOpen(!brandFiltersOpen)}>
//                       <div className="flex items-center">
//                         <Tag size={16} className="mr-2 text-indigo-500" />
//                         Brands
//                       </div>
//                       {brandFiltersOpen ? 
//                         <ChevronUp size={16} className="text-indigo-500" /> : 
//                         <ChevronDown size={16} className="text-gray-400" />
//                       }
//                     </h3>
                    
//                     {brandFiltersOpen && (
//                       <div className="mt-4 space-y-2 pl-2 animate-fade-in">
//                         <div className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
//                           <input
//                             id="brand-all"
//                             name="brand"
//                             type="radio"
//                             checked={selectedBrand === ''}
//                             onChange={() => setSelectedBrand('')}
//                             className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                           />
//                           <label htmlFor="brand-all" className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-200">
//                             All Brands
//                           </label>
//                         </div>
//                         {brands.map((brand) => (
//                           <div key={brand.id} className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
//                             <input
//                               id={`brand-${brand.id}`}
//                               name="brand"
//                               type="radio"
//                               checked={selectedBrand === brand.id}
//                               onChange={() => setSelectedBrand(brand.id)}
//                               className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                             />
//                             <label htmlFor={`brand-${brand.id}`} className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors duration-200">
//                               {brand.name}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Price range filter */}
//                   <div className="p-4">
//                     <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setPriceRangeOpen(!priceRangeOpen)}>
//                       <div className="flex items-center">
//                         <rupp size={16} className="mr-2 text-indigo-500" />
//                         Price Range
//                       </div>
//                       {priceRangeOpen ? 
//                         <ChevronUp size={16} className="text-indigo-500" /> : 
//                         <ChevronDown size={16} className="text-gray-400" />
//                       }
//                     </h3>
                    
//                     {priceRangeOpen && (
//                       <div className="mt-4 space-y-3 pl-2 animate-fade-in">
//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label htmlFor="desktop-min-price" className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
//                             <div className="relative rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
//                               </div>
//                               <input
//                                 type="number"
//                                 id="desktop-min-price"
//                                 placeholder="Min"
//                                 value={minPrice}
//                                 onChange={(e) => setMinPrice(e.target.value)}
//                                 className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                               />
//                             </div>
//                           </div>
//                           <div>
//                             <label htmlFor="desktop-max-price" className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
//                             <div className="relative rounded-md shadow-sm">
//                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
//                               </div>
//                               <input
//                                 type="number"
//                                 id="desktop-max-price"
//                                 placeholder="Max"
//                                 value={maxPrice}
//                                 onChange={(e) => setMaxPrice(e.target.value)}
//                                 className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                               />
//                             </div>
//                           </div>
//                         </div>
                        
//                         {/* Price range slider placeholder - you could add a real slider here */}
//                         <div className="px-2 py-4">
//                           <div className="h-2 bg-gray-200 rounded-full relative">
//                             <div className="absolute h-full bg-indigo-500 rounded-full" style={{ 
//                               left: minPrice ? `${Math.min(100, (minPrice / 1000) * 100)}%` : '0%', 
//                               right: maxPrice ? `${100 - Math.min(100, (maxPrice / 1000) * 100)}%` : '0%' 
//                             }}></div>
//                             <div className="absolute h-4 w-4 bg-white border-2 border-indigo-600 rounded-full top-1/2 transform -translate-y-1/2 shadow-md hover:cursor-pointer" style={{ 
//                               left: minPrice ? `${Math.min(100, (minPrice / 1000) * 100)}%` : '0%',
//                               marginLeft: '-6px'
//                             }}></div>
//                             <div className="absolute h-4 w-4 bg-white border-2 border-indigo-600 rounded-full top-1/2 transform -translate-y-1/2 shadow-md hover:cursor-pointer" style={{ 
//                               left: maxPrice ? `${Math.min(100, (maxPrice / 1000) * 100)}%` : '100%',
//                               marginLeft: '-6px'
//                             }}></div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   {/* Desktop filter buttons */}
//                   <div className="p-4 space-y-3">
//                     <button
//                       type="button"
//                       onClick={applyFilters}
//                       className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm transform hover:translate-y-[-2px]"
//                     >
//                       Apply Filters
//                     </button>
//                     <button
//                       type="button"
//                       onClick={clearFilters}
//                       className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//                     >
//                       <RefreshCcw size={14} className="mr-2" />
//                       Clear All
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Product grid */}
//             <div className="mt-6 lg:mt-0 lg:col-span-3">
//               {loading ? (
//                 <div className="flex justify-center items-center h-64">
//                   <div className="relative animate-spin">
//                     <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-l-2 border-r-2 border-indigo-600 opacity-25"></div>
//                     <div className="absolute inset-0 h-16 w-16 rounded-full border-t-2 border-indigo-600"></div>
//                   </div>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-10 bg-white rounded-xl shadow-sm p-8 border border-red-100">
//                   <div className="inline-flex h-14 w-14 rounded-full bg-red-100 items-center justify-center mb-4">
//                     <X size={24} className="text-red-600" />
//                   </div>
//                   <p className="text-red-600 font-medium mb-4">{error}</p>
//                   <button 
//                     onClick={() => applyFilters()} 
//                     className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               ) : products.length === 0 ? (
//                 <div className="text-center py-10 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
//                   <div className="inline-flex h-14 w-14 rounded-full bg-indigo-100 items-center justify-center mb-4">
//                     <Search size={24} className="text-indigo-600" />
//                   </div>
//                   <p className="text-gray-600 font-medium mb-4">No products found with the current filters.</p>
//                   <button 
//                     onClick={clearFilters} 
//                     className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               ) : (
//                 <div className={`transition-opacity duration-500 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
//                   {/* Products count */}
//                   <div className="mb-6 flex items-center justify-between">
//                     <p className="text-sm text-gray-500">
//                       Showing <span className="font-medium text-gray-900">{products.length}</span> of <span className="font-medium text-gray-900">{totalItems}</span> products
//                     </p>
//                     {totalPages > 1 && (
//                       <p className="text-sm text-gray-500">
//                         Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
//                       </p>
//                     )}
//                   </div>
                  
             
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//                       {products.map((product, index) => (
//                         <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
//                           <ProductCard product={product} />
//                         </div>
//                       ))}
//                     </div>
                 
                  
//                   {/* Pagination */}
//                   {totalPages > 1 && (
//                     <div className="mt-12 flex justify-center">
//                       <nav className="relative z-0 inline-flex rounded-md shadow-sm space-x-1" aria-label="Pagination">
//                         <button
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           disabled={currentPage === 1}
//                           className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
//                             currentPage === 1 
//                               ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
//                               : 'text-gray-700 bg-white hover:bg-indigo-50 transition-colors duration-200 border border-gray-300'
//                           }`}
//                         >
//                           <span className="sr-only">Previous</span>
//                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                             <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                           </svg>
//                         </button>
                        
//                         {/* Page numbers */}
//                         {[...Array(totalPages).keys()].map((page) => {
//                           const pageNumber = page + 1;
//                           // Only show limited page numbers around current page
//                           if (
//                             pageNumber === 1 ||
//                             pageNumber === totalPages ||
//                             (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                           ) {
//                             return (
//                               <button
//                                 key={pageNumber}
//                                 onClick={() => handlePageChange(pageNumber)}
//                                 className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
//                                   currentPage === pageNumber
//                                     ? 'z-10 bg-indigo-600 text-white'
//                                     : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-50 transition-colors duration-200'
//                                 }`}
//                               >
//                                 {pageNumber}
//                               </button>
//                             );
//                           }
                          
//                           // Show ellipsis
//                           if (
//                             pageNumber === 2 ||
//                             pageNumber === totalPages - 1
//                           ) {
//                             return (
//                               <span
//                                 key={`ellipsis-${pageNumber}`}
//                                 className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
//                               >
//                                 ...
//                               </span>
//                             );
//                           }
                          
//                           return null;
//                         })}
                        
//                         <button
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           disabled={currentPage === totalPages}
//                           className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
//                             currentPage === totalPages 
//                               ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
//                               : 'text-gray-700 bg-white hover:bg-indigo-50 transition-colors duration-200 border border-gray-300'
//                           }`}
//                         >
//                           <span className="sr-only">Next</span>
//                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                       </nav>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Add custom keyframes and animations
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes slideIn {
//     0% {
//       transform: translateX(-100%);
//     }
//     100% {
//       transform: translateX(0);
//     }
//   }
  
//   .animate-slide-in {
//     animation: slideIn 0.3s ease-out forwards;
//   }
  
//   @keyframes fadeIn {
//     from {
//       opacity: 0;
//     }
//     to {
//       opacity: 1;
//     }
//   }
  
//   .animate-fade-in {
//     animation: fadeIn 0.3s ease-out forwards;
//   }
  
//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(20px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
  
//   .animate-fade-in-up {
//     animation: fadeInUp 0.5s ease-out forwards;
//   }
  
//   /* Line clamp for text truncation */
//   .line-clamp-2 {
//     display: -webkit-box;
//     -webkit-line-clamp: 2;
//     -webkit-box-orient: vertical;
//     overflow: hidden;
//   }
// `;
// document.head.appendChild(style);

// export default ProductList;


// src/pages/product/ProductList.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductCard from '../../components/product/ProductCard';
import { Filter, ChevronDown, ChevronUp, X, Search, ChevronRight, Sliders, Tag, DollarSign, Grid, List, RefreshCcw, ArrowRight, IndianRupee } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRangeOpen, setPriceRangeOpen] = useState(true);
  const [categoryFiltersOpen, setCategoryFiltersOpen] = useState(true);
  const [brandFiltersOpen, setBrandFiltersOpen] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Filter and sort states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const itemsPerPage = 12;

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
  
  // Parse query parameters on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const category = params.get('category') || '';
    const brand = params.get('brand') || '';
    const min = params.get('min_price') || '';
    const max = params.get('max_price') || '';
    const sort = params.get('sort') || '';
    const search = params.get('search') || '';
    const page = parseInt(params.get('page') || '1', 10);
    
    setSelectedCategory(category);
    setSelectedBrand(brand);
    setMinPrice(min);
    setMaxPrice(max);
    setSortOption(sort);
    setSearchQuery(search);
    setCurrentPage(page);
    
    // Fetch data with these filters
    fetchProducts({
      category,
      brand,
      min_price: min,
      max_price: max,
      sort,
      search,
      page
    });
  }, [location.search]);
  
  // Initial data fetch for categories and brands
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        
        // Handle categories data format
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else if (categoriesData && categoriesData.results && Array.isArray(categoriesData.results)) {
          setCategories(categoriesData.results);
        } else {
          console.error('Unexpected categories data format:', categoriesData);
          setCategories([]);
        }
        
        // Handle brands data format
        if (Array.isArray(brandsData)) {
          setBrands(brandsData);
        } else if (brandsData && brandsData.results && Array.isArray(brandsData.results)) {
          setBrands(brandsData.results);
        } else {
          console.error('Unexpected brands data format:', brandsData);
          setBrands([]);
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError('Failed to load filter options.');
      }
    };
    
    fetchFilterData();
  }, []);
  
  const fetchProducts = async (params) => {
    try {
      setLoading(true);
      setIsFiltering(true);
      
      // Create a new object to avoid modifying the input params
      const queryParams = { ...params };
      
      // Set pagination parameters
      queryParams.page = params.page || 1;
      queryParams.limit = itemsPerPage;
      
      // Convert category slug to proper parameter format
      if (params.category) {
        queryParams.category__slug = params.category;
        delete queryParams.category;
      }
      
      // Handle price range parameters - ensure they're numbers
      if (params.min_price && !isNaN(parseFloat(params.min_price))) {
        queryParams.min_price = parseFloat(params.min_price);
      }
      
      if (params.max_price && !isNaN(parseFloat(params.max_price))) {
        queryParams.max_price = parseFloat(params.max_price);
      }
      
      // Convert sort parameter to API expected format
      if (params.sort) {
        switch (params.sort) {
          case 'price_low':
            queryParams.ordering = 'variants__price';
            break;
          case 'price_high':
            queryParams.ordering = '-variants__price';
            break;
          case 'newest':
            queryParams.ordering = '-created_at';
            break;
          case 'oldest':
            queryParams.ordering = 'created_at';
            break;
          case 'popular':
            queryParams.ordering = '-reviews_count';
            break;
          default:
            break;
        }
        
        delete queryParams.sort;
      }
      
      console.log('Fetching products with params:', queryParams);
      
      // Fetch products with filters
      const response = await productService.getProducts(queryParams);
      
      setProducts(response.results || []);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / itemsPerPage));
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsFiltering(false);
      }, 300);
    }
  };
  
  // Apply filters and update URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (sortOption) params.set('sort', sortOption);
    if (searchQuery) params.set('search', searchQuery);
    
    params.set('page', '1');
    navigate(`/products?${params.toString()}`);
    setFiltersOpen(false);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('');
    setSearchQuery('');
    
    navigate('/products');
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page.toString());
    navigate(`/products?${params.toString()}`);
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Check if filters are applied
  const hasFilters = () => {
    return selectedCategory || selectedBrand || minPrice || maxPrice || searchQuery || sortOption;
  };
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 pb-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Product Catalog
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-base text-gray-500">
              Browse our collection of high-quality products
            </p>
          </div>
          
          {/* Search and Sort Bar */}
          <div className="mt-8 bg-white p-4 rounded-xl shadow-sm flex flex-col lg:flex-row justify-between gap-4 border border-gray-100">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 focus:outline-none focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent transition-all duration-200`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className={`absolute inset-y-0 right-0 flex items-center px-4 ${themeClasses.primary.text} ${themeClasses.primary.hover} transition-colors duration-200`}
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
            
            <div className="flex gap-4 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  Sort by:
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    const params = new URLSearchParams(location.search);
                    if (e.target.value) {
                      params.set('sort', e.target.value);
                    } else {
                      params.delete('sort');
                    }
                    params.set('page', '1');
                    navigate(`/products?${params.toString()}`);
                  }}
                  className={`block pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent rounded-lg bg-gray-50 transition-colors duration-200`}
                >
                  <option value="">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              
              {/* Mobile filter button */}
              <button
                type="button"
                className={`lg:hidden px-4 py-2 ${themeClasses.button.primary} rounded-lg shadow-sm text-sm font-medium transition-colors duration-200 flex items-center`}
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Active filters display */}
          {hasFilters() && (
            <div className={`mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fade-in`}>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-sm font-medium ${themeClasses.primary.text}`}>Active Filters:</span>
                
                {selectedCategory && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${themeClasses.primary.text}`}>
                    Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button 
                      onClick={() => {
                        setSelectedCategory('');
                        applyFilters();
                      }}
                      className={`ml-1 ${themeClasses.primary.hover}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {selectedBrand && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${themeClasses.primary.text}`}>
                    Brand: {brands.find(b => b.id === selectedBrand)?.name || selectedBrand}
                    <button 
                      onClick={() => {
                        setSelectedBrand('');
                        applyFilters();
                      }}
                      className={`ml-1 ${themeClasses.primary.hover}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {(minPrice || maxPrice) && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${themeClasses.primary.text}`}>
                    Price: {minPrice ? `${siteConfig.currency.symbol}${minPrice}` : `${siteConfig.currency.symbol}0`} - {maxPrice ? `${siteConfig.currency.symbol}${maxPrice}` : 'Any'}
                    <button 
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        applyFilters();
                      }}
                      className={`ml-1 ${themeClasses.primary.hover}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {searchQuery && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${themeClasses.primary.text}`}>
                    Search: "{searchQuery}"
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        applyFilters();
                      }}
                      className={`ml-1 ${themeClasses.primary.hover}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {sortOption && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${themeClasses.primary.text}`}>
                    Sort: {
                      sortOption === 'price_low' ? 'Price: Low to High' :
                      sortOption === 'price_high' ? 'Price: High to Low' :
                      sortOption === 'newest' ? 'Newest First' :
                      sortOption === 'popular' ? 'Most Popular' : sortOption
                    }
                    <button 
                      onClick={() => {
                        setSortOption('');
                        applyFilters();
                      }}
                      className={`ml-1 ${themeClasses.primary.hover}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 transition-colors duration-200 bg-red-50 hover:bg-red-100 rounded-full flex items-center"
                >
                  <RefreshCcw size={12} className="mr-1" />
                  Clear All
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
            {/* Mobile filter dialog */}
            {filtersOpen && (
              <div className="fixed inset-0 flex z-40 lg:hidden">
                <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}></div>
                <div className="relative max-w-xs w-full bg-white shadow-xl pb-12 flex flex-col overflow-y-auto transition-transform duration-300 transform translate-x-0 animate-slide-in">
                  <div className={`px-4 py-5 flex items-center justify-between ${themeClasses.primary.gradient}`}>
                    <h2 className="text-lg font-medium text-white flex items-center">
                      <Sliders size={18} className="mr-2" />
                      Filter Products
                    </h2>
                    <button
                      type="button"
                      className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
                      onClick={() => setFiltersOpen(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Mobile filter options */}
                  <div className="px-4 py-4 border-b border-gray-200">
                    <h3 className="flow-root -my-1">
                      <button
                        type="button"
                        className={`py-3 w-full flex items-center justify-between text-sm text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200`}
                        onClick={() => setCategoryFiltersOpen(!categoryFiltersOpen)}
                      >
                        <span className="font-medium text-gray-900 flex items-center">
                          <Tag size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                          Categories
                        </span>
                        <span className="ml-6 flex items-center">
                          {categoryFiltersOpen ? 
                            <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                            <ChevronDown size={16} className="text-gray-400" />
                          }
                        </span>
                      </button>
                    </h3>
                    {categoryFiltersOpen && (
                      <div className="pt-4 pl-6 space-y-4 animate-fade-in">
                        {Array.isArray(categories) && categories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-3">
                            <input
                              id={`mobile-category-${category.id}`}
                              name="category"
                              type="radio"
                              checked={selectedCategory === category.slug}
                              onChange={() => setSelectedCategory(category.slug)}
                              className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                            />
                            <label 
                              htmlFor={`mobile-category-${category.id}`} 
                              className={`text-sm text-gray-600 ${themeClasses.primary.hover} cursor-pointer transition-colors duration-200`}
                            >
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Brands filter for mobile */}
                  <div className="px-4 py-4 border-b border-gray-200">
                    <h3 className="flow-root -my-1">
                      <button
                        type="button"
                        className={`py-3 w-full flex items-center justify-between text-sm text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200`}
                        onClick={() => setBrandFiltersOpen(!brandFiltersOpen)}
                      >
                        <span className="font-medium text-gray-900 flex items-center">
                          <Tag size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                          Brands
                        </span>
                        <span className="ml-6 flex items-center">
                          {brandFiltersOpen ? 
                            <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                            <ChevronDown size={16} className="text-gray-400" />
                          }
                        </span>
                      </button>
                    </h3>
                    {brandFiltersOpen && (
                      <div className="pt-4 pl-6 space-y-4 animate-fade-in">
                        {Array.isArray(brands) && brands.map((brand) => (
                          <div key={brand.id} className="flex items-center space-x-3">
                            <input
                              id={`mobile-brand-${brand.id}`}
                              name="brand"
                              type="radio"
                              checked={selectedBrand === brand.id}
                              onChange={() => setSelectedBrand(brand.id)}
                              className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                            />
                            <label 
                              htmlFor={`mobile-brand-${brand.id}`} 
                              className={`text-sm text-gray-600 ${themeClasses.primary.hover} cursor-pointer transition-colors duration-200`}
                            >
                              {brand.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Price range filter for mobile */}
                  <div className="px-4 py-4 border-b border-gray-200">
                    <h3 className="flow-root -my-1">
                      <button
                        type="button"
                        className={`py-3 w-full flex items-center justify-between text-sm text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200`}
                        onClick={() => setPriceRangeOpen(!priceRangeOpen)}
                      >
                        <span className="font-medium text-gray-900 flex items-center">
                          <IndianRupee size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                          Price Range
                        </span>
                        <span className="ml-6 flex items-center">
                          {priceRangeOpen ? 
                            <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                            <ChevronDown size={16} className="text-gray-400" />
                          }
                        </span>
                      </button>
                    </h3>
                    {priceRangeOpen && (
                      <div className="pt-4 px-2 animate-fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label htmlFor="mobile-min-price" className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
                              </div>
                              <input
                                type="number"
                                id="mobile-min-price"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none ${themeClasses.primary.ring} focus:border-transparent text-sm`}
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="mobile-max-price" className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
                              </div>
                              <input
                                type="number"
                                id="mobile-max-price"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none ${themeClasses.primary.ring} focus:border-transparent text-sm`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile filter buttons */}
                  <div className="p-4 sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="bg-white border border-gray-300 rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <RefreshCcw size={14} className="mr-2" />
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={applyFilters}
                        className={`${themeClasses.button.primary} border border-transparent rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-sm`}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Desktop filter sidebar */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className={`p-4 ${themeClasses.primary.gradient}`}>
                  <h2 className="text-lg font-medium text-white flex items-center">
                    <Filter size={18} className="mr-2" />
                    Filter Products
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {/* Categories filter */}
                  <div className="p-4">
                    <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setCategoryFiltersOpen(!categoryFiltersOpen)}>
                      <div className="flex items-center">
                        <Tag size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                        Categories
                      </div>
                      {categoryFiltersOpen ? 
                        <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                        <ChevronDown size={16} className="text-gray-400" />
                      }
                    </h3>
                    
                    {categoryFiltersOpen && (
                      <div className="mt-4 space-y-2 pl-2 animate-fade-in">
                        <div className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <input
                            id="category-all"
                            name="category"
                            type="radio"
                            checked={selectedCategory === ''}
                            onChange={() => setSelectedCategory('')}
                            className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                          />
                          <label htmlFor="category-all" className="ml-3 text-sm text-gray-600 cursor-pointer">
                            All Categories
                          </label>
                        </div>
                        {Array.isArray(categories) && categories.map((category) => (
                          <div key={category.id} className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <input
                              id={`category-${category.id}`}
                              name="category"
                              type="radio"
                              checked={selectedCategory === category.slug}
                              onChange={() => setSelectedCategory(category.slug)}
                              className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                            />
                            <label htmlFor={`category-${category.id}`} className={`ml-3 text-sm text-gray-600 cursor-pointer ${themeClasses.primary.hover} transition-colors duration-200`}>
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Brands filter */}
                  <div className="p-4">
                    <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setBrandFiltersOpen(!brandFiltersOpen)}>
                      <div className="flex items-center">
                        <Tag size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                        Brands
                      </div>
                      {brandFiltersOpen ? 
                        <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                        <ChevronDown size={16} className="text-gray-400" />
                      }
                    </h3>
                    
                    {brandFiltersOpen && (
                      <div className="mt-4 space-y-2 pl-2 animate-fade-in">
                        <div className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                          <input
                            id="brand-all"
                            name="brand"
                            type="radio"
                            checked={selectedBrand === ''}
                            onChange={() => setSelectedBrand('')}
                            className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                          />
                          <label htmlFor="brand-all" className={`ml-3 text-sm text-gray-600 cursor-pointer ${themeClasses.primary.hover} transition-colors duration-200`}>
                            All Brands
                          </label>
                        </div>
                        {brands.map((brand) => (
                          <div key={brand.id} className="flex items-center pl-2 py-1 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <input
                              id={`brand-${brand.id}`}
                              name="brand"
                              type="radio"
                              checked={selectedBrand === brand.id}
                              onChange={() => setSelectedBrand(brand.id)}
                              className={`h-4 w-4 border-gray-300 ${themeClasses.primary.text} ${themeClasses.primary.ring}`}
                            />
                            <label htmlFor={`brand-${brand.id}`} className={`ml-3 text-sm text-gray-600 cursor-pointer ${themeClasses.primary.hover} transition-colors duration-200`}>
                              {brand.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Price range filter */}
                  <div className="p-4">
                    <h3 className="flex items-center justify-between text-md font-medium text-gray-900 cursor-pointer" onClick={() => setPriceRangeOpen(!priceRangeOpen)}>
                      <div className="flex items-center">
                        <IndianRupee size={16} className={`mr-2 ${themeClasses.primary.text}`} />
                        Price Range
                      </div>
                      {priceRangeOpen ? 
                        <ChevronUp size={16} className={themeClasses.primary.text} /> : 
                        <ChevronDown size={16} className="text-gray-400" />
                      }
                    </h3>
                    
                    {priceRangeOpen && (
                      <div className="mt-4 space-y-3 pl-2 animate-fade-in">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="desktop-min-price" className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
                              </div>
                              <input
                                type="number"
                                id="desktop-min-price"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none ${themeClasses.primary.ring} focus:border-transparent text-sm`}
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="desktop-max-price" className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">{siteConfig.currency.symbol}</span>
                              </div>
                              <input
                                type="number"
                                id="desktop-max-price"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={`block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none ${themeClasses.primary.ring} focus:border-transparent text-sm`}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Price range slider placeholder */}
                        <div className="px-2 py-4">
                          <div className="h-2 bg-gray-200 rounded-full relative">
                            <div className={`absolute h-full ${themeClasses.primary.bg} rounded-full`} style={{ 
                              left: minPrice ? `${Math.min(100, (minPrice / 1000) * 100)}%` : '0%', 
                              right: maxPrice ? `${100 - Math.min(100, (maxPrice / 1000) * 100)}%` : '0%' 
                            }}></div>
                            <div className={`absolute h-4 w-4 bg-white border-2 ${themeClasses.primary.text} rounded-full top-1/2 transform -translate-y-1/2 shadow-md hover:cursor-pointer`} style={{ 
                              left: minPrice ? `${Math.min(100, (minPrice / 1000) * 100)}%` : '0%',
                              marginLeft: '-6px',
                              borderColor: 'currentColor'
                            }}></div>
                            <div className={`absolute h-4 w-4 bg-white border-2 ${themeClasses.primary.text} rounded-full top-1/2 transform -translate-y-1/2 shadow-md hover:cursor-pointer`} style={{ 
                              left: maxPrice ? `${Math.min(100, (maxPrice / 1000) * 100)}%` : '100%',
                              marginLeft: '-6px',
                              borderColor: 'currentColor'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop filter buttons */}
                  <div className="p-4 space-y-3">
                    <button
                      type="button"
                      onClick={applyFilters}
                      className={`w-full ${themeClasses.button.primary} border border-transparent rounded-lg py-2.5 px-4 flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-sm transform hover:translate-y-[-2px]`}
                    >
                      Apply Filters
                    </button>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <RefreshCcw size={14} className="mr-2" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Product grid */}
            <div className="mt-6 lg:mt-0 lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="relative animate-spin">
                    <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-l-2 border-r-2 border-gray-300 opacity-25"></div>
                    <div className={`absolute inset-0 h-16 w-16 rounded-full border-t-2 ${themeClasses.primary.text}`} style={{ borderColor: 'currentColor' }}></div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm p-8 border border-red-100">
                  <div className="inline-flex h-14 w-14 rounded-full bg-red-100 items-center justify-center mb-4">
                    <X size={24} className="text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <button 
                    onClick={() => applyFilters()}
                    className={`px-6 py-2.5 ${themeClasses.button.primary} rounded-lg transition-colors duration-200 shadow-sm`}
                  >
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                  <div className={`inline-flex h-14 w-14 rounded-full bg-gray-100 items-center justify-center mb-4`}>
                    <Search size={24} className={themeClasses.primary.text} />
                  </div>
                  <p className="text-gray-600 font-medium mb-4">No products found with the current filters.</p>
                  <button 
                    onClick={clearFilters} 
                    className={`px-6 py-2.5 ${themeClasses.button.primary} rounded-lg transition-colors duration-200 shadow-sm`}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className={`transition-opacity duration-500 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
                  {/* Products count */}
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing <span className="font-medium text-gray-900">{products.length}</span> of <span className="font-medium text-gray-900">{totalItems}</span> products
                    </p>
                    {totalPages > 1 && (
                      <p className="text-sm text-gray-500">
                        Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm space-x-1" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === 1 
                              ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                              : `text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 border border-gray-300`
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(totalPages).keys()].map((page) => {
                          const pageNumber = page + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                                  currentPage === pageNumber
                                    ? `z-10 ${themeClasses.primary.bg} text-white`
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          
                          if (pageNumber === 2 || pageNumber === totalPages - 1) {
                            return (
                              <span
                                key={`ellipsis-${pageNumber}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === totalPages 
                              ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                              : 'text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 border border-gray-300'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add custom keyframes and animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

export default ProductList;
