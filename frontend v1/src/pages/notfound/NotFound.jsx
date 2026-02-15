// src/pages/notfound/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Page not found
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Home size={16} className="mr-2" />
              Back to Home
            </Link>
            
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShoppingBag size={16} className="mr-2" />
              View Products
            </Link>
          </div>
          
          <div className="mt-12 max-w-md mx-auto">
            <form className="mt-2 flex">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search for products..."
              />
              <button
                type="submit"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Search size={16} className="mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-sm font-medium text-gray-500 text-center">Popular Categories</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              to="/products?category=men"
              className="text-center px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Men
            </Link>
            <Link
              to="/products?category=women"
              className="text-center px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Women
            </Link>
            <Link
              to="/products?category=accessories"
              className="text-center px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Accessories
            </Link>
            <Link
              to="/products?category=shoes"
              className="text-center px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Shoes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;