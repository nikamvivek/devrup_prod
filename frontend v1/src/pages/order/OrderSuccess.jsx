// src/pages/order/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Clock } from 'lucide-react';
import { orderService } from '../../services/orderService';
import siteConfig from '../../config/siteConfig';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrder(id);
        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please check your order history.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Order Error</h1>
          <p className="mt-4 text-red-600">{error || 'Order not found'}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl">
          <div>
            <CheckCircle size={64} className="text-green-500 mx-auto" />
            <div className="mt-3 text-center sm:mt-5">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Thank you for your order!
              </h1>
              <div className="mt-2">
                <p className="text-lg text-gray-500">
                  Your order has been placed successfully. We've sent a confirmation email with all the details.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 border-t border-gray-200">
            <div className="mt-10">
              <h2 className="text-lg font-medium text-gray-900">Order information</h2>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-6">
                <dl className="divide-y divide-gray-200">
                  <div className="pb-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Order number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{order.id}</dd>
                  </div>
                  
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm font-semibold">
                      <span className="px-2 py-1 text-xs font-medium rounded-full capitalize" 
                        style={{
                          backgroundColor: 
                            order.status === 'pending' ? '#FEF3C7' : 
                            order.status === 'processing' ? '#DBEAFE' :
                            order.status === 'shipped' ? '#D1FAE5' :
                            order.status === 'delivered' ? '#D1FAE5' :
                            order.status === 'cancelled' ? '#FEE2E2' : '#F3F4F6',
                          color: 
                            order.status === 'pending' ? '#92400E' : 
                            order.status === 'processing' ? '#1E40AF' :
                            order.status === 'shipped' ? '#065F46' :
                            order.status === 'delivered' ? '#065F46' :
                            order.status === 'cancelled' ? '#B91C1C' : '#1F2937'
                        }}
                      >
                        {order.status}
                      </span>
                    </dd>
                  </div>
                  
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Date placed</dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </dd>
                  </div>
                  
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total amount</dt>
                    <dd className="text-sm font-semibold text-gray-900">{siteConfig.currency.symbol}{order.total_price.toFixed(2)}</dd>
                  </div>
                  
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Payment method</dt>
                    <dd className="text-sm font-semibold text-gray-900 capitalize">
                      {order.payment_method.replace(/_/g, ' ')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>
              
              <div className="mt-4 bg-gray-50 rounded-lg p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <address className="not-italic">
                        {order.address.address_line1}<br />
                        {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                        {order.address.city}, {order.address.state} {order.address.zip_code}<br />
                        {order.address.country}
                      </address>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Shipping method</dt>
                    <dd className="mt-1 text-sm text-gray-900">Standard shipping</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estimated delivery</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-lg font-medium text-gray-900">Order items</h2>
              
              <div className="mt-4 border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {order.items.map((item) => {
                    const product = item.product_variant.product;
                    const variant = item.product_variant;
                    
                    return (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                          <img
                            src={product?.main_image || '/api/placeholder/96/96'}
                            alt={product?.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3>
                                <Link to={`/products/${product?.slug}`}>
                                  {product?.name}
                                </Link>
                              </h3>
                              <p className="ml-4">{siteConfig.currency.symbol}{item.price.toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Size: {variant.size}</p>
                          </div>
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex justify-between">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ShoppingBag size={16} className="mr-2" />
              Continue Shopping
            </Link>
            <Link
              to={`/orders/${order.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Clock size={16} className="mr-2" />
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;