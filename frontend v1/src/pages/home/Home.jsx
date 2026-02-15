// src/pages/home/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { homeService } from '../../services/homeService';
import ProductCard from '../../components/product/ProductCard';
import { ChevronRight, TruckIcon, ShieldCheckIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const Home = () => {
  const [homeData, setHomeData] = useState({
    hero_banner: null,
    middle_banner: null,
    // categories: [],
    featured_products: [],
    new_arrivals: [],
    discounted_products: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  
  // Create refs for scroll animations
  const featuredRef = useRef(null);
  const discountBannerRef = useRef(null);
  const newArrivalsRef = useRef(null);
  const specialOffersRef = useRef(null);

  // Extract theme for easier access
  const theme = siteConfig.theme;
  const layout = siteConfig.layout;

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

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    fetchHomeData();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Helper function to check if element is in viewport
  const isInView = (ref) => {
    if (!ref.current) return false;
    const rect = ref.current.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.8 && rect.bottom >= 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div 
          className="animate-spin rounded-full h-14 w-14 border-b-2"
          style={{ borderColor: theme.primary.main }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-lg" style={{ color: theme.error.main }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={`mt-6 ${siteConfig.components.button.paddingLarge} ${siteConfig.components.button.borderRadius} text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{
            backgroundColor: theme.primary.main,
            boxShadow: theme.shadow.md
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary.dark}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary.main}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b ${theme.background.gradient}`}
    >
      {/* Hero Section */}
      <section 
        className={`relative overflow-hidden bg-gradient-to-r ${theme.background.hero}`}
      >
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(to right, ${theme.primary.main}, ${theme.secondary.main})`,
            opacity: 0.2
          }}
        />
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop} py-16 md:py-20`}>
          <div className="md:flex md:items-center md:justify-between gap-16">
            <div className="md:w-1/2 space-y-6 relative z-10 animate-fade-in-up">
              <span 
                className={`inline-block ${siteConfig.components.badge.padding} ${siteConfig.components.badge.borderRadius} ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wide`}
                style={{
                  backgroundColor: theme.sections.hero.badge.background,
                  color: theme.sections.hero.badge.text
                }}
              >
                {homeData.hero_banner?.badge || "Limited Time Offer"}
              </span>
              <h1 
                className="text-4xl md:text-5xl font-bold tracking-tight sm:text-6xl"
                style={{ color: theme.sections.hero.title }}
              >
                {homeData.hero_banner?.title || "Elevate Your Style"}
              </h1>
              <p 
                className="max-w-xl text-lg"
                style={{ color: theme.sections.hero.subtitle }}
              >
                {homeData.hero_banner?.subtitle || "Discover our curated collection of premium products with exclusive discounts."}
              </p>
              <div className="pt-2">
                <Link
                  to={homeData.hero_banner?.target_url || "/products"}
                  className={`inline-flex items-center ${siteConfig.components.button.paddingLarge} ${siteConfig.components.button.borderRadius} text-base font-medium transition-all ${siteConfig.animations.duration.normal} transform group`}
                  style={{
                    backgroundColor: theme.sections.hero.button.background,
                    color: theme.sections.hero.button.text,
                    boxShadow: theme.shadow.lg
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.sections.hero.button.hover;
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = theme.shadow.xl;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.sections.hero.button.background;
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = theme.shadow.lg;
                  }}
                >
                  {homeData.hero_banner?.button_text || "Shop Now"}
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 animate-bounce-x" />
                </Link>
              </div>
            </div>
            <div className="mt-8 md:mt-0 md:w-1/2 relative animate-fade-in-right">
              <div 
                className="absolute -right-6 -bottom-6 w-3/4 h-3/4 rounded-lg transform rotate-6 animate-float"
                style={{ backgroundColor: `${theme.primary.light}50` }}
              />
              <img 
                src={homeData.hero_banner?.image || "/api/placeholder/600/400"} 
                alt={homeData.hero_banner?.title || "Hero banner"} 
                className={`relative ${siteConfig.components.card.borderRadius} object-cover w-full h-auto transform transition-all ${siteConfig.animations.duration.slow}`}
                style={{ boxShadow: theme.shadow['2xl'] }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          </div>
        </div>
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 48" fill={theme.neutral.white} preserveAspectRatio="none">
            <path d="M0,0 C480,40 960,40 1440,0 L1440,48 L0,48 Z"></path>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      {/* <section className={layout.section.paddingY} style={{ backgroundColor: theme.background.primary }}>
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="animate-fade-in-left" style={{ animationDelay: '0.2s' }}>
              <span 
                className={`block ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wider`}
                style={{ color: theme.primary.main }}
              >
                Collections
              </span>
              <h2 
                className="text-3xl font-bold mt-1"
                style={{ color: theme.text.primary }}
              >
                Shop by Category
              </h2>
            </div>
            <Link 
              to="/categories" 
              className="flex items-center font-medium group animate-fade-in-right"
              style={{ 
                color: theme.primary.main,
                animationDelay: '0.4s' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.primary.dark}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.primary.main}
            >
              <span>View all</span> 
              <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {homeData.categories.map((category, index) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                <div 
                  className={`aspect-w-1 aspect-h-1 ${siteConfig.components.card.borderRadius} overflow-hidden transition-shadow ${siteConfig.animations.duration.normal}`}
                  style={{ 
                    backgroundColor: theme.background.secondary,
                    boxShadow: theme.shadow.md
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = theme.shadow.xl}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = theme.shadow.md}
                >
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name} 
                      className={`w-full h-full object-center object-cover group-hover:scale-110 transition-transform ${siteConfig.animations.duration.slow}`}
                    />
                  ) : (
                    <div 
                      className={`w-full h-full flex items-center justify-center transition-colors ${siteConfig.animations.duration.normal}`}
                      style={{ backgroundColor: theme.background.secondary }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary['50']}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.background.secondary}
                    >
                      <span className="text-3xl text-gray-400 transform group-hover:scale-125 transition-transform duration-300">🛍️</span>
                    </div>
                  )}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${siteConfig.animations.duration.normal}`}
                  />
                </div>
                <h3 
                  className={`mt-3 text-sm font-medium text-center transition-colors ${siteConfig.animations.duration.fast}`}
                  style={{ color: theme.text.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.primary.main}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.text.primary}
                >
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      <section 
        ref={featuredRef} 
        className={`${layout.section.paddingY} bg-gradient-to-r ${theme.sections.featured.gradient}`}
      >
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div className={`text-center mb-8 transition-all ${siteConfig.animations.duration.slow} transform ${isInView(featuredRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span 
              className={`inline-block ${siteConfig.components.badge.padding} ${siteConfig.components.badge.borderRadius} ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wide`}
              style={{
                backgroundColor: theme.sections.featured.badge.background,
                color: theme.sections.featured.badge.text
              }}
            >
              Handpicked
            </span>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text.primary }}>
              Featured Products
            </h2>
            <div 
              className="mt-3 w-24 h-1 mx-auto rounded-full"
              style={{ backgroundColor: theme.primary.main }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeData.featured_products.map((product, index) => (
              <div 
                key={product.id} 
                className={`transition-all ${siteConfig.animations.duration.slow} transform ${isInView(featuredRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
            {homeData.featured_products.length === 0 && (
              <p 
                className="col-span-full text-center py-8"
                style={{ color: theme.text.secondary }}
              >
                No featured products available.
              </p>
            )}
          </div>
          
          <div className={`text-center mt-8 transition-all ${siteConfig.animations.duration.slow} transform ${isInView(featuredRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <Link 
              to="/products?featured=true" 
              className={`inline-flex items-center ${siteConfig.components.button.paddingLarge} border ${siteConfig.components.button.borderRadius} font-medium transition-colors ${siteConfig.animations.duration.normal} group`}
              style={{
                borderColor: theme.primary.main,
                color: theme.primary.main
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary['50'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>Browse All Featured</span> 
              <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Discount Banner */}
      <section ref={discountBannerRef} className={layout.section.paddingY} style={{ backgroundColor: theme.background.primary }}>
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div 
            className={`${siteConfig.components.card.borderRadius} overflow-hidden transition-all ${siteConfig.animations.duration.slow} transform ${isInView(discountBannerRef) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ boxShadow: theme.shadow.xl }}
          >
            <div className="md:flex">
              <div 
                className={`md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden`}
                style={{
                  background: `linear-gradient(135deg, ${theme.primary.main}, ${theme.secondary.main}, ${theme.primary.dark})`
                }}
              >
                {/* Animated background elements */}
                <div 
                  className="absolute -top-10 -left-10 w-32 h-32 rounded-full animate-float"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <div 
                  className="absolute bottom-10 right-10 w-24 h-24 rounded-full animate-float"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    animationDelay: '1s' 
                  }}
                />
                
                <span 
                  className={`inline-block ${siteConfig.components.badge.padding} ${siteConfig.components.badge.borderRadius} ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wider mb-4 w-max animate-pulse`}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: theme.text.white
                  }}
                >
                  Special Offer
                </span>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: theme.text.white }}>
                  <span className="block">{homeData.middle_banner?.title || "Save 15% on your first order"}</span>
                </h2>
                <p className="mt-4 text-base" style={{ color: theme.sections.hero.subtitle }}>
                  {homeData.middle_banner?.subtitle || "Use coupon code WELCOME15 at checkout and get 15% off on your first purchase."}
                </p>
                <Link
                  to={homeData.middle_banner?.target_url || "/products"}
                  className={`mt-6 w-full sm:w-auto inline-flex items-center justify-center ${siteConfig.components.button.paddingLarge} border-transparent text-base font-medium ${siteConfig.components.button.borderRadius} transition-all ${siteConfig.animations.duration.normal} transform group`}
                  style={{
                    backgroundColor: theme.text.white,
                    color: theme.primary.main,
                    boxShadow: theme.shadow.sm
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.primary['50'];
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.text.white;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>{homeData.middle_banner?.button_text || "Shop Now"}</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 animate-bounce-x" />
                </Link>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 z-10" style={{ backgroundColor: 'rgba(67, 56, 202, 0.1)' }} />
                <div 
                  className="absolute inset-0 border-4 m-3 pointer-events-none transform transition-transform duration-300 hover:scale-95"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <img 
                  className={`h-full w-full object-cover transition-transform ${siteConfig.animations.duration.slow}`}
                  src={homeData.middle_banner?.image || "/api/placeholder/600/400"} 
                  alt={homeData.middle_banner?.title || "Discount offer"} 
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section 
        ref={newArrivalsRef} 
        className={`${layout.section.paddingY} bg-gradient-to-r ${theme.sections.newArrivals.gradient}`}
      >
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div className="flex justify-between items-center mb-8">
            <div className={`transition-all ${siteConfig.animations.duration.slow} transform ${isInView(newArrivalsRef) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <span 
                className={`inline-block ${siteConfig.components.badge.padding} ${siteConfig.components.badge.borderRadius} ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wide`}
                style={{
                  backgroundColor: theme.sections.newArrivals.badge.background,
                  color: theme.sections.newArrivals.badge.text
                }}
              >
                Fresh
              </span>
              <h2 className="text-3xl font-bold mt-1" style={{ color: theme.text.primary }}>
                New Arrivals
              </h2>
            </div>
            <Link 
              to="/products?sort=newest" 
              className={`flex items-center font-medium group transition-all ${siteConfig.animations.duration.slow} transform ${isInView(newArrivalsRef) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
              style={{ color: theme.primary.main }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.primary.dark}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.primary.main}
            >
              <span>View all</span> 
              <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeData.new_arrivals.map((product, index) => (
              <div 
                key={product.id} 
                className={`transition-all ${siteConfig.animations.duration.slow} transform hover:translate-y-[-8px] ${isInView(newArrivalsRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
            {homeData.new_arrivals.length === 0 && (
              <p 
                className="col-span-full text-center py-8"
                style={{ color: theme.text.secondary }}
              >
                No new arrivals available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Special Offers / Discounted Products */}
      <section 
        ref={specialOffersRef} 
        className={`${layout.section.paddingY} bg-gradient-to-r ${theme.sections.specialOffers.gradient}`}
      >
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div className={`text-center mb-8 transition-all ${siteConfig.animations.duration.slow} transform ${isInView(specialOffersRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span 
              className={`inline-block ${siteConfig.components.badge.padding} ${siteConfig.components.badge.borderRadius} ${siteConfig.components.badge.fontSize} ${siteConfig.components.badge.fontWeight} uppercase tracking-wide`}
              style={{
                backgroundColor: theme.sections.specialOffers.badge.background,
                color: theme.sections.specialOffers.badge.text
              }}
            >
              Hot Deals
            </span>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text.primary }}>
              Special Offers
            </h2>
            <div 
              className="mt-3 w-24 h-1 mx-auto rounded-full"
              style={{ backgroundColor: theme.sections.specialOffers.accent }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeData.discounted_products.map((product, index) => (
              <div 
                key={product.id} 
                className={`transition-all ${siteConfig.animations.duration.slow} transform ${isInView(specialOffersRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
            {homeData.discounted_products.length === 0 && (
              <p 
                className="col-span-full text-center py-8"
                style={{ color: theme.text.secondary }}
              >
                No special offers available right now.
              </p>
            )}
          </div>
          
          <div className={`text-center mt-8 transition-all ${siteConfig.animations.duration.slow} transform ${isInView(specialOffersRef) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <Link 
              to="/products?discount=true" 
              className={`inline-flex items-center ${siteConfig.components.button.paddingLarge} border ${siteConfig.components.button.borderRadius} font-medium transition-colors ${siteConfig.animations.duration.normal} group`}
              style={{
                borderColor: theme.error.main,
                color: theme.error.main
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.error['50'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>View All Offers</span> 
              <ChevronRight size={18} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Bar
      <section 
        className={`${layout.section.paddingYLarge} border-t`}
        style={{ 
          backgroundColor: theme.background.primary,
          borderColor: theme.border.light
        }}
      >
        <div className={`${layout.maxWidth} mx-auto ${layout.padding.mobile} ${layout.padding.tablet} ${layout.padding.desktop}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
              Why Shop With Us
            </h2>
            <div 
              className="mt-3 w-24 h-1 mx-auto rounded-full"
              style={{ backgroundColor: theme.primary.main }}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              className={`${siteConfig.components.card.borderRadius} ${siteConfig.components.card.padding} text-center transform transition-all ${siteConfig.animations.duration.slow} border`}
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.sections.benefits.cardBorder,
                boxShadow: theme.shadow.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div 
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.sections.benefits.iconBackground }}
              >
                <TruckIcon className="h-6 w-6" style={{ color: theme.sections.benefits.iconColor }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.text.primary }}>
                Free Shipping
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {siteConfig.ShippingAndReturns.freeShippingThreshold}
              </p>
            </div>
            
            <div 
              className={`${siteConfig.components.card.borderRadius} ${siteConfig.components.card.padding} text-center transform transition-all ${siteConfig.animations.duration.slow} border`}
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.sections.benefits.cardBorder,
                boxShadow: theme.shadow.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div 
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.sections.benefits.iconBackground }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: theme.sections.benefits.iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.text.primary }}>
                Easy Returns
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                {siteConfig.ShippingAndReturns.returnPolicyDuration}
              </p>
            </div>
            
            <div 
              className={`${siteConfig.components.card.borderRadius} ${siteConfig.components.card.padding} text-center transform transition-all ${siteConfig.animations.duration.slow} border`}
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.sections.benefits.cardBorder,
                boxShadow: theme.shadow.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div 
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.sections.benefits.iconBackground }}
              >
                <ShieldCheckIcon className="h-6 w-6" style={{ color: theme.sections.benefits.iconColor }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.text.primary }}>
                Secure Payment
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                100% secure payment processing
              </p>
            </div>
            
            <div 
              className={`${siteConfig.components.card.borderRadius} ${siteConfig.components.card.padding} text-center transform transition-all ${siteConfig.animations.duration.slow} border`}
              style={{
                backgroundColor: theme.background.primary,
                borderColor: theme.sections.benefits.cardBorder,
                boxShadow: theme.shadow.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div 
                className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.sections.benefits.iconBackground }}
              >
                <ClockIcon className="h-6 w-6" style={{ color: theme.sections.benefits.iconColor }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: theme.text.primary }}>
                24/7 Support
              </h3>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Always here to help you
              </p>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

// Add custom animation keyframes and classes
const style = document.createElement('style');
style.textContent = `
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
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  @keyframes bounceX {
    0%, 100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }
  
  @keyframes spinSlow {
    from {
      transform: rotate(12deg);
    }
    to {
      transform: rotate(372deg);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }
  
  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-bounce-x {
    animation: bounceX 1.5s infinite;
  }
  
  .animate-spin-slow {
    animation: spinSlow 10s linear infinite;
  }
`;
document.head.appendChild(style);

export default Home;