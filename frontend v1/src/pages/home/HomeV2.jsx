// src/pages/home/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeService } from '../../services/homeService';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, TruckIcon, ShieldCheckIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Full width with animated gradient */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="md:flex md:items-center md:justify-between gap-16">
            <div className="md:w-1/2 space-y-8 relative z-10">
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                {homeData.hero_banner?.badge || "Limited Time Offer"}
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {homeData.hero_banner?.title || "Elevate Your Style"}
              </h1>
              <p className="max-w-xl text-xl text-gray-600">
                {homeData.hero_banner?.subtitle || "Discover our curated collection of premium products with exclusive discounts."}
              </p>
              <div className="flex space-x-4 pt-2">
                <Link
                  to={homeData.hero_banner?.target_url || "/products"}
                  className="inline-flex items-center px-8 py-3 rounded-lg text-base font-medium shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105"
                >
                  {homeData.hero_banner?.button_text || "Shop Now"}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/categories"
                  className="inline-flex items-center px-8 py-3 rounded-lg text-base font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  Explore
                </Link>
              </div>
            </div>
            <div className="mt-10 md:mt-0 md:w-1/2 relative">
              <div className="absolute -right-6 -bottom-6 w-3/4 h-3/4 bg-indigo-100 rounded-lg transform rotate-6"></div>
              <img 
                src={homeData.hero_banner?.image || "/api/placeholder/600/400"} 
                alt={homeData.hero_banner?.title || "Hero banner"} 
                className="relative rounded-lg shadow-2xl object-cover w-full h-auto transform transition-transform duration-500 hover:scale-105" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white shadow-sm border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <TruckIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Free Shipping</p>
                <p className="text-sm text-gray-500">On orders over $50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Easy Returns</p>
                <p className="text-sm text-gray-500">30-day return policy</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Secure Payment</p>
                <p className="text-sm text-gray-500">100% protected</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">24/7 Support</p>
                <p className="text-sm text-gray-500">Always available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Card-Based Layout */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="block text-sm font-semibold uppercase tracking-wider text-indigo-600">Collections</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Shop by Category</h2>
            </div>
            <Link to="/categories" className="text-indigo-600 hover:text-indigo-500 flex items-center font-medium">
              View all <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {homeData.categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className="w-full h-full object-center object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors duration-300">
                      <span className="text-3xl text-gray-400">🛍️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900 text-center group-hover:text-indigo-600 transition-colors duration-200">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - With Stylish Heading */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold uppercase tracking-wide">Handpicked</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Featured Products</h2>
            <div className="mt-3 w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {homeData.featured_products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.featured_products.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No featured products available.</p>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/products?featured=true" 
              className="inline-flex items-center px-6 py-3 border border-indigo-600 rounded-lg text-indigo-600 font-medium hover:bg-indigo-50 transition-colors duration-300"
            >
              Browse All Featured <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Discount Banner - Modern Split Design */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 md:p-16 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4">
                  Special Offer
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  <span className="block">{homeData.middle_banner?.title || "Save 15% on your first order"}</span>
                </h2>
                <p className="mt-4 text-lg text-indigo-100">
                  {homeData.middle_banner?.subtitle || "Use coupon code WELCOME15 at checkout and get 15% off on your first purchase."}
                </p>
                <Link
                  to={homeData.middle_banner?.target_url || "/products"}
                  className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-300"
                >
                  {homeData.middle_banner?.button_text || "Shop Now"}
                </Link>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-indigo-900/10 z-10"></div>
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

      {/* New Arrivals - With Badge */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wide">Fresh</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">New Arrivals</h2>
            </div>
            <Link to="/products?sort=newest" className="text-indigo-600 hover:text-indigo-500 flex items-center font-medium">
              View all <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {homeData.new_arrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.new_arrivals.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No new arrivals available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Special Offers / Discounted Products - Carousel-Like Styling */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold uppercase tracking-wide">Hot Deals</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">Special Offers</h2>
            <div className="mt-3 w-24 h-1 bg-red-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {homeData.discounted_products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {homeData.discounted_products.length === 0 && (
              <p className="col-span-full text-center text-gray-500 py-10">No special offers available right now.</p>
            )}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/products?discount=true" 
              className="inline-flex items-center px-6 py-3 border border-red-500 rounded-lg text-red-500 font-medium hover:bg-red-50 transition-colors duration-300"
            >
              View All Offers <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Join Our Newsletter</h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <form className="sm:flex">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-5 py-3 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white focus:border-white sm:max-w-xs rounded-lg"
                  placeholder="Enter your email"
                />
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="mt-3 text-sm text-indigo-200">
                We care about your data. Read our{' '}
                <Link to="/privacy-policy" className="font-medium text-white underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;