import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  User,
  Heart,
  ShoppingCart,
  Package,
  Tag,
  Shield,
  Truck,
  ArrowRight,
  RefreshCw 
} from "lucide-react";
import productService from "../../services/productService";
import { useAuth } from "../../contexts/AuthContext";
import siteConfig from "../../config/siteConfig";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);
  const { user } = useAuth(); // assuming useAuth provides user or null

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();

        if (Array.isArray(data)) {
          setCategories(data);
        } else if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
                setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Extract dynamic gradient colors from siteConfig.theme.primary.gradient which is usually 'from-indigo-600 to-purple-600'

  const getGradientClasses = () => {
    // fallback if gradient is not defined
    const gradient = siteConfig.theme.primary.gradient || "from-indigo-400 to-purple-400";
    // split string and sanitize spaces if any
    const parts = gradient.trim().split(/\s+/);
    // Return classes only if both from- and to- present
    if (parts.length === 2 && parts[0].startsWith("from-") && parts[1].startsWith("to-")) {
      return `bg-gradient-to-r ${parts[0]} ${parts[1]}`;
    }
    return "bg-gradient-to-r from-indigo-400 to-purple-400"; // fallback
  };


  // Use only theme color for icon hover and company name gradient text
  const primaryTextClass = siteConfig.tailwindClasses.primary.text || "text-indigo-600";
  const primaryHoverTextClass = siteConfig.tailwindClasses.primary.hover || "hover:text-indigo-600";

  // We keep the black/dark background as-is (bg-gradient-to-r from-gray-800 to-gray-900)
  // We only update icon hover colors and company name text gradient per your request

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="animate-fadeIn">
            <h3 className={`text-xl font-bold text-transparent bg-clip-text ${getGradientClasses()}`}>
              {siteConfig.shopName}
            </h3>

            <p className="mt-2 text-sm text-gray-300 leading-relaxed">{siteConfig.description}</p>
            <div className="mt-6 flex space-x-4">
              {siteConfig.socialLinks.facebook && (
                <a
                  href={siteConfig.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:${primaryTextClass} hover:bg-transparent transition-colors duration-300`}
                >
                  <Facebook size={18} />
                </a>
              )}
              {siteConfig.socialLinks.twitter && (
                <a
                  href={siteConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:${primaryTextClass} hover:bg-transparent transition-colors duration-300`}
                >
                  <Twitter size={18} />
                </a>
              )}
              {siteConfig.socialLinks.instagram && (
                <a
                  href={siteConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:${primaryTextClass} hover:bg-transparent transition-colors duration-300`}
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Categories */}
          <div className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-gray-700 pb-2">
              Shop
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <ShoppingBag
                    size={14}
                    className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                  />
                  <span>All Products</span>
                  <ArrowRight
                    size={12}
                    className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  />
                </Link>
              </li>

              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/products?category=${cat.slug || cat.name}`}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <ShoppingBag
                        size={14}
                        className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                      />
                      <span>{cat.name}</span>
                      <ArrowRight
                        size={12}
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                ))}

              <li>
                <Link
                  to="/products?discount=true"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <Tag
                    size={14}
                    className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                  />
                  <span>Sale</span>
                  <ArrowRight
                    size={12}
                    className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="animate-fadeIn" style={{ animationDelay: "200ms" }}>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-gray-700 pb-2">
              Account
            </h3>
            <ul className="mt-4 space-y-3">
              {!user && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <User
                        size={14}
                        className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                      />
                      <span>Login</span>
                      <ArrowRight
                        size={12}
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <User
                        size={14}
                        className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                      />
                      <span>Register</span>
                      <ArrowRight
                        size={12}
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                >
                  <ShoppingCart
                    size={14}
                    className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                  />
                  <span>Cart</span>
                  <ArrowRight
                    size={12}
                    className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  />
                </Link>
              </li>

              {user && (
                <>
                  <li>
                    <Link
                      to="/wishlist"
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <Heart
                        size={14}
                        className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                      />
                      <span>Wishlist</span>
                      <ArrowRight
                        size={12}
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <Package
                        size={14}
                        className="mr-2 text-gray-400 group-hover:text-indigo-400 transition-colors duration-200"
                      />
                      <span>Orders</span>
                      <ArrowRight
                        size={12}
                        className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="animate-fadeIn" style={{ animationDelay: "300ms" }}>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase border-b border-gray-700 pb-2">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start group">
                <MapPin
                  size={16}
                  className="flex-shrink-0 text-gray-400 mr-3 group-hover:text-indigo-400 transition-colors duration-200"
                />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
                  {siteConfig.contact.address}
                </span>
              </li>
              <li className="flex items-center group">
                <Phone
                  size={16}
                  className="flex-shrink-0 text-gray-400 mr-3 group-hover:text-indigo-400 transition-colors duration-200"
                />
                <a
                  href={`tel:${siteConfig.contact.phone}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="flex items-center group">
                <Mail
                  size={16}
                  className="flex-shrink-0 text-gray-400 mr-3 group-hover:text-indigo-400 transition-colors duration-200"
                />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
            </ul>

            <div className="mt-6 px-4 py-3 bg-gray-700 bg-opacity-50 rounded-lg">
              <p className="text-xs text-gray-300">
                Our customer service team is available {siteConfig.contact.workingHours}.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear}{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400`}>
                {siteConfig.shopName}
              </span>
              . All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-4 md:gap-6">
              <Link
                to={siteConfig.legalLinks.terms}
                className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
              >
                <Shield size={14} className="mr-1" />
                Terms of Service
              </Link>
              <Link
                to={siteConfig.legalLinks.privacy}
                className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
              >
                <Shield size={14} className="mr-1" />
                Privacy Policy
              </Link>
              <Link
                to={siteConfig.legalLinks.shipping}
                className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
              >
                <Truck size={14} className="mr-1" />
                Shipping Policy
              </Link>

              <Link
                to={siteConfig.legalLinks.return}
                className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center"
              >
                <RefreshCw  size={14} className="mr-1" />
                Return & Refund Policy
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
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

        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
