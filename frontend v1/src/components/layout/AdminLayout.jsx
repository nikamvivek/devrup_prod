import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {Globe, User, LogOut, ShoppingCart,ExternalLink  } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4 h-16 flex items-center border-b border-gray-700">
          <Link to="/admin" className="text-2xl font-bold">{siteConfig.shopName}</Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/admin" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-700">Products</Link>
            </li>
            <li>
              <Link to="/admin/categories" className="block py-2 px-4 rounded hover:bg-gray-700">Categories</Link>
            </li>
            <li>
              <Link to="/admin/orders" className="block py-2 px-4 rounded hover:bg-gray-700">Orders</Link>
            </li>
             <li>
              <Link to="/admin/banners" className="block py-2 px-4 rounded hover:bg-gray-700">Banners</Link>
            </li>
            <li>
              <Link to="/admin/coupons" className="block py-2 px-4 rounded hover:bg-gray-700">Coupons</Link>
            </li>
            <li>
              <Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700">Users</Link>
            </li>
            <li>
              <Link to="/admin/sales-report" className="block py-2 px-4 rounded hover:bg-gray-700">Sales Report</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white shadow h-16">
          <div className="flex items-center justify-between px-6 h-full">
          <div>
              <a 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-800 font-medium" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Globe className="w-5 h-5 mr-2" />
                View Site
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <div ref={dropdownRef} className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <User className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <ul className="py-1">
                      <li>
                        <Link 
                          to="/admin/orders" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Orders
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;