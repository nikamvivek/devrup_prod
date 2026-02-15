// src/components/layout/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Menu, 
  X, 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  Package, 
  ShoppingBag, 
  Home, 
  Grid, 
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { productService } from '../../services/productService';
import siteConfig from '../../config/siteConfig';
import logo from '../../assets/Devrup_Organics_PNG.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Get theme classes
  const themeClasses = siteConfig.tailwindClasses;

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData.filter(cat => cat.is_active));
        } else if (categoriesData && categoriesData.results && Array.isArray(categoriesData.results)) {
          setCategories(categoriesData.results.filter(cat => cat.is_active));
        } else {
                    setCategories([]);
        }
      } catch (error) {
                setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const getUserInitials = () => {
    if (!user) return '';
    const firstInitial = user.first_name ? user.first_name.charAt(0) : '';
    const lastInitial = user.last_name ? user.last_name.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Fetch notifications count
  useEffect(() => {
    if (user) {
      const fetchNotificationsCount = async () => {
        try {
          const response = await notificationService.getNotifications();
          
          if (Array.isArray(response)) {
            const unreadCount = response.filter(n => !n.is_read).length;
            setUnreadNotifications(unreadCount);
          } else if (response && response.results && Array.isArray(response.results)) {
            const unreadCount = response.results.filter(n => !n.is_read).length;
            setUnreadNotifications(unreadCount);
          } else {
                        setUnreadNotifications(0);
          }
        } catch (error) {
                    setUnreadNotifications(0);
        }
      };
      
      fetchNotificationsCount();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef, categoryMenuRef]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleCategoryMenu = () => setIsCategoryMenuOpen(!isCategoryMenuOpen);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className={`bg-white ${scrolled ? 'shadow-md' : ''} sticky top-0 z-50 transition-shadow duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center transition-transform duration-200 hover:scale-105">
              <img 
                src={logo} 
                alt={siteConfig.shopName} 
                className="h-10 w-auto sm:h-12 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200 flex items-center group`}>
                <Home size={16} className="mr-1 group-hover:scale-110 transition-transform duration-200" />
                Home
              </Link>
              <Link to="/products" className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200 flex items-center group`}>
                <ShoppingBag size={16} className="mr-1 group-hover:scale-110 transition-transform duration-200" />
                Products
              </Link>
              
              {/* Categories dropdown */}
              <div className="relative" ref={categoryMenuRef}>
                <button 
                  className={`px-3 py-2 rounded-md text-sm font-medium text-gray-700 ${themeClasses.primary.hover} transition-colors duration-200 flex items-center group`}
                  onMouseEnter={() => setIsCategoryMenuOpen(true)}
                  onClick={toggleCategoryMenu}
                >
                  <Grid size={16} className="mr-1 group-hover:scale-110 transition-transform duration-200" />
                  Categories
                  <ChevronDown 
                    size={16} 
                    className={`ml-1 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isCategoryMenuOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100 animate-fadeIn"
                    onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  >
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <Link 
                          key={category.id} 
                          to={`/products?category=${category.slug}`}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${themeClasses.primary.hover} transition-colors duration-200`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))
                    ) : (
                      <div className="block px-4 py-2 text-sm text-gray-500">Loading categories...</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center px-2 lg:px-0">
            <form onSubmit={handleSearch} className="ml-4 flex md:ml-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`bg-gray-100 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 ${themeClasses.primary.ring} focus:bg-white transition-all duration-200 w-full md:w-60 lg:w-80`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={`absolute right-0 top-0 mt-3 mr-4 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200`}>
                  <Search size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center">
            <Link to="/wishlist" className={`p-2 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 relative group`}>
              <Heart size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute inset-0 rounded-full bg-gray-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200 -z-10"></span>
            </Link>
            
            <Link to="/cart" className={`p-2 ml-4 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 relative group`}>
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute inset-0 rounded-full bg-gray-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200 -z-10"></span>
              {cartItems.length > 0 && (
                <span className={`absolute -top-1 -right-1 ${themeClasses.badge.cart} text-xs w-5 h-5 flex items-center justify-center rounded-full animate-bounceIn`}>
                  {cartItems.length}
                </span>
              )}
            </Link>
            
            {user && (
              <Link to="/notifications" className={`p-2 ml-4 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 relative group`}>
                <Bell size={20} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="absolute inset-0 rounded-full bg-gray-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200 -z-10"></span>
                {unreadNotifications > 0 && (
                  <span className={`absolute -top-1 -right-1 ${themeClasses.badge.notification} text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse`}>
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div className="ml-4 relative" ref={userMenuRef}>
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center focus:outline-none group"
                >
                  <div className={`w-8 h-8 rounded-full ${themeClasses.primary.gradient} flex items-center justify-center text-white hover:shadow-md transition-shadow duration-200`}>
                    {getUserInitials()}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`ml-1 text-gray-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link to="/profile" className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${themeClasses.primary.hover} transition-colors duration-200`}>
                      <User size={16} className="mr-2 text-gray-500" />
                      Profile
                    </Link>
                    <Link to="/orders" className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${themeClasses.primary.hover} transition-colors duration-200`}>
                      <Package size={16} className="mr-2 text-gray-500" />
                      Orders
                    </Link>
                    <Link to="/notifications" className={`flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${themeClasses.primary.hover} transition-colors duration-200`}>
                      <span className="flex items-center">
                        <Bell size={16} className="mr-2 text-gray-500" />
                        Notifications
                      </span>
                      {unreadNotifications > 0 && (
                        <span className={`${themeClasses.badge.notification} text-xs px-2 py-0.5 rounded-full`}>
                          {unreadNotifications}
                        </span>
                      )}
                    </Link>
                    <div className="border-t border-gray-100 mt-1"></div>
                    <button 
                      onClick={handleLogout} 
                      className={`w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${themeClasses.primary.hover} transition-colors duration-200`}
                    >
                      <LogOut size={16} className="mr-2 text-gray-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className={`ml-4 px-4 py-2 text-sm font-medium ${themeClasses.button.primary} rounded-full transition-all duration-200 hover:shadow-md`}>
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className={`p-2 mr-2 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 relative`}>
              <ShoppingCart size={20} />
              {cartItems.length > 0 && (
                <span className={`absolute -top-1 -right-1 ${themeClasses.badge.cart} text-xs w-5 h-5 flex items-center justify-center rounded-full`}>
                  {cartItems.length}
                </span>
              )}
            </Link>
            {user && (
              <Link to="/notifications" className={`p-2 mr-2 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 relative`}>
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className={`absolute -top-1 -right-1 ${themeClasses.badge.notification} text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse`}>
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            )}
            <button onClick={toggleMenu} className={`p-2 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200 focus:outline-none`}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t border-gray-100 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <div className="px-4 py-3 border-b border-gray-200 mb-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${themeClasses.primary.gradient} flex items-center justify-center text-white mr-3`}>
                    {getUserInitials()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <Link to="/" onClick={toggleMenu} className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
              <Home size={18} className="mr-2 text-gray-500" />
              Home
            </Link>
            <Link to="/products" onClick={toggleMenu} className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
              <ShoppingBag size={18} className="mr-2 text-gray-500" />
              Products
            </Link>
            
            {/* Mobile Categories Dropdown */}
            <div className="relative">
              <button 
                className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              >
                <span className="flex items-center">
                  <Grid size={18} className="mr-2 text-gray-500" />
                  Categories
                </span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryMenuOpen && (
                <div className="pl-8 mt-1 space-y-1 border-l-2 border-gray-100 ml-3 animate-fadeIn">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link 
                        key={category.id} 
                        to={`/products?category=${category.slug}`}
                        className={`block px-3 py-2 rounded-md text-sm font-medium text-gray-600 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}
                        onClick={toggleMenu}
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">Loading categories...</div>
                  )}
                </div>
              )}
            </div>
            
            <Link to="/wishlist" onClick={toggleMenu} className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
              <Heart size={18} className="mr-2 text-gray-500" />
              Wishlist
            </Link>
            
            {/* Mobile search bar */}
            <form onSubmit={handleSearch} className="mt-3 px-3">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`bg-gray-100 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 ${themeClasses.primary.ring} focus:bg-white transition-all duration-200 w-full`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={`absolute right-0 top-0 mt-3 mr-4 text-gray-600 ${themeClasses.primary.hover} transition-colors duration-200`}>
                  <Search size={16} />
                </button>
              </div>
            </form>          
            
            {user ? (
              <>
                <Link to="/profile" onClick={toggleMenu} className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
                  <User size={18} className="mr-2 text-gray-500" />
                  Profile
                </Link>
                <Link to="/orders" onClick={toggleMenu} className={`flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
                  <Package size={18} className="mr-2 text-gray-500" />
                  Orders
                </Link>
                <Link to="/notifications" onClick={toggleMenu} className={`flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
                  <span className="flex items-center">
                    <Bell size={18} className="mr-2 text-gray-500" />
                    Notifications
                  </span>
                  {unreadNotifications > 0 && (
                    <span className={`${themeClasses.badge.notification} text-xs px-2 py-0.5 rounded-full`}>
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                <div className="border-t border-gray-200 mt-2 pt-2"></div>
                <button onClick={() => { handleLogout(); toggleMenu(); }} className={`w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 ${themeClasses.primary.hover} hover:bg-gray-50 transition-colors duration-200`}>
                  <LogOut size={18} className="mr-2 text-gray-500" />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={toggleMenu} className={`flex items-center justify-center px-3 py-2 mt-2 rounded-full text-base font-medium ${themeClasses.button.primary} transition-all duration-200`}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
