// src/pages/home/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeService } from '../../services/homeService';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight } from 'lucide-react';

const Home = () => {
  const [homeData, setHomeData] = useState({
    hero_banner: null,
    middle_banner: null,
    categories: [],
    featured_products: [],
    new_arrivals: [],
    discounted_products: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const data = await homeService.getHomePageData();
        setHomeData(data);
      } catch (error) {
        
        setError('Failed to load homepage content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                {homeData.hero_banner?.title || "Summer Sale is Here"}
              </h1>
              <p className="max-w-xl text-xl">
                {homeData.hero_banner?.subtitle || "Up to 50% off on selected items. Hurry up, limited time offer!"}
              </p>
              <Link
                to={homeData.hero_banner?.target_url || "/products"}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50"
              >
                {homeData.hero_banner?.button_text || "Shop Now"}
              </Link>
            </div>
            <div className="mt-8 md:mt-0 md:w-1/2">
            <img 
              src={homeData.hero_banner?.image || "/api/placeholder/600/400"} 
              alt={homeData.hero_banner?.title || "Summer sale"} 
              className="rounded-lg shadow-xl w-full h-auto" 
            />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {homeData.categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-gray-200">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors duration-200">
                      <span className="text-2xl text-gray-400">🛍️</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900 text-center group-hover:text-indigo-600 transition-colors duration-200">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products?featured=true" className="text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeData.featured_products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.featured_products.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No featured products available.</p>
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/products?sort=newest" className="text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeData.new_arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.new_arrivals.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No new arrivals available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Discount Banner */}
      <section className="py-12 bg-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">{homeData.middle_banner?.title || "Save 15% on your first order"}</span>
                </h2>
                <p className="mt-4 text-lg text-indigo-100">
                  {homeData.middle_banner?.subtitle || "Use coupon code WELCOME15 at checkout and get 15% off on your first purchase."}
                </p>
                <Link
                  to={homeData.middle_banner?.target_url || "/products"}
                  className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
                >
                  {homeData.middle_banner?.button_text || "Shop Now"}
                </Link>
              </div>
              <div className="md:w-1/2">
              <img 
                className="h-full w-full object-cover" 
                src={homeData.middle_banner?.image || "/api/placeholder/600/400"} 
                alt={homeData.middle_banner?.title || "Discount offer"} 
              />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discounted Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
            <Link to="/products?discount=true" className="text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeData.discounted_products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.discounted_products.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No special offers available right now.</p>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Free Shipping</h3>
              <p className="mt-2 text-sm text-gray-500">On orders over $50</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">24/7 Support</h3>
              <p className="mt-2 text-sm text-gray-500">We're always here to help</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Secure Payment</h3>
              <p className="mt-2 text-sm text-gray-500">100% secure payment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;