// src/pages/product/ProductReviews.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { productService } from '../../services/productService';
import { AuthContext } from '../../contexts/AuthContext';
import siteConfig from '../../config/siteConfig';

const ProductReviews = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductBySlug(slug);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Please enter a review comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Fix the request payload
      await productService.addProductReview(slug, {
        rating: parseInt(rating, 10),  // Ensure rating is a number
        comment: comment.trim()
      });

      setSuccess(true);

      // Reset form
      setRating(5);
      setComment('');

      // Redirect to product page after a delay
      setTimeout(() => {
        navigate(`/products/${slug}`);
      }, 3000);

    } catch (err) {
      console.error('Error submitting review:', err);
      if (err.response?.status === 400 && err.response?.data?.error === 'You have already reviewed this product') {
        setError('You have already reviewed this product. You can only submit one review per product.');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-gray-300 animate-spin opacity-25"></div>
          <div className={`absolute inset-0 h-12 w-12 rounded-full border-t-2 ${themeClasses.primary.text}`} style={{ borderColor: 'currentColor' }}></div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Error</h1>
          <p className="mt-4 text-red-600">{error}</p>
          <Link
            to="/products"
            className={`mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${themeClasses.button.primary} transition-all duration-300 transform hover:scale-105`}
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between md:space-x-5">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    className="h-16 w-16 rounded-lg object-cover shadow-sm ring-2 ring-gray-100"
                    src={
                      product?.images && product.images.length > 0
                        ? product.images[0].image
                        : product?.main_image || '/api/placeholder/80/80'
                    }
                    alt={product?.name}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Write a review for this product
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
              <Link
                to={`/products/${slug}`}
                className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring} transition-all duration-300 transform hover:scale-105`}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Product
              </Link>
            </div>
          </div>

          <div className="mt-8">
            {success ? (
              <div className="rounded-lg bg-green-50 p-6 border border-green-100 shadow-sm animate-fade-in">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800">
                      Review submitted successfully!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Thank you for your feedback. Your review will help other customers make better purchasing decisions.
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="-mx-2 -my-1.5 flex">
                        <button
                          onClick={() => navigate(`/products/${slug}`)}
                          className="px-3 py-2 rounded-lg text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          Back to product
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-100 shadow-sm animate-fade-in">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          {error}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating select */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform duration-200 transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`${rating >= star
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                            } transition-colors duration-200`}
                        />
                      </button>
                    ))}
                    <span className={`ml-3 text-base font-medium ${themeClasses.primary.text}`}>
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Click on the stars to rate this product
                  </p>
                </div>

                {/* Review comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="comment"
                      name="comment"
                      rows={6}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className={`shadow-sm focus:ring-2 ${themeClasses.primary.ring} focus:border-transparent block w-full sm:text-sm border-gray-300 rounded-lg bg-gray-50 transition-all duration-200`}
                      placeholder="Share your experience with this product... What did you like or dislike? Would you recommend it?"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Tip:</span> Your review will be visible to other customers. Please avoid including personal information.
                  </p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className={`${comment.length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                      {comment.length} / 10 minimum characters
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <Link
                    to={`/products/${slug}`}
                    className="inline-flex justify-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || comment.trim().length < 10}
                    className={`inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg ${themeClasses.button.primary} focus:outline-none focus:ring-2 focus:ring-offset-2 ${themeClasses.primary.ring} transition-all duration-300 transform hover:scale-105
                      ${(submitting || comment.trim().length < 10) ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Review Guidelines */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className={`text-sm font-semibold ${themeClasses.primary.text} mb-3`}>Review Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Be honest and helpful in your review</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Focus on the product's features and your experience</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Avoid personal or sensitive information</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Keep your review respectful and constructive</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Add custom keyframes for animations
const style = document.createElement('style');
style.textContent = `
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
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default ProductReviews;
