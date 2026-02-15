// src/pages/order/OrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet as PDFStyleSheet } from '@react-pdf/renderer';
import { ChevronLeft, Truck, Package, CheckCircle, AlertCircle, Clock, Calendar, CreditCard, MapPin, ShoppingBag, MessageCircle, ExternalLink, Package2, Printer } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService'; // Assuming you have a productService
import siteConfig from "../../config/siteConfig";

// Extract theme colors and classes from siteConfig
const primaryMain = siteConfig.theme.primary.main || '#4F46E5';
const primaryLight = siteConfig.theme.primary.light || '#818cf8';
const primaryDark = siteConfig.theme.primary.dark || '#4f46e5';
const primaryGradient = siteConfig.theme.primary.gradient || 'from-indigo-600 to-purple-600';
const primaryGradientHover = siteConfig.theme.primary.gradientHover || 'from-indigo-700 to-purple-700';

const primaryTextClass = siteConfig.tailwindClasses.primary.text || 'text-indigo-600';
const primaryBgClass = siteConfig.tailwindClasses.primary.bg || 'bg-indigo-600';
const primaryHoverClass = siteConfig.tailwindClasses.primary.hover || 'hover:text-indigo-600';
const primaryBgHoverClass = siteConfig.tailwindClasses.primary.bgHover || 'hover:bg-indigo-600';
const primaryButtonClass = siteConfig.tailwindClasses.button.primary || 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white';

// PDF Invoice Component
const OrderInvoice = ({ order }) => {
  const pdfStyles = PDFStyleSheet.create({
    page: {
      padding: 40,
      fontSize: 11,
      lineHeight: 1.5,
    },
    header: {
      marginBottom: 20,
      borderBottom: `2 solid ${primaryMain}`,
      paddingBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: primaryMain,
      marginBottom: 5,
    },
    orderNumber: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 10,
    },
    section: {
      marginTop: 20,
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#1F2937',
    },
    row: {
      flexDirection: 'row',
      marginBottom: 5,
    },
    label: {
      width: '40%',
      fontSize: 10,
      color: '#6B7280',
    },
    value: {
      width: '60%',
      fontSize: 10,
      color: '#1F2937',
    },
    table: {
      marginTop: 20,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      padding: 8,
      fontWeight: 'bold',
      fontSize: 10,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottom: '1 solid #E5E7EB',
      padding: 8,
      fontSize: 10,
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'right' },
    col3: { width: '20%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    totalSection: {
      marginTop: 20,
      alignItems: 'flex-end',
    },
    totalRow: {
      flexDirection: 'row',
      width: '40%',
      justifyContent: 'space-between',
      marginBottom: 5,
      fontSize: 10,
      color: '#1F2937',
    },
    grandTotal: {
      flexDirection: 'row',
      width: '40%',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 10,
      borderTop: `2 solid #1F2937`,
      fontSize: 12,
      fontWeight: 'bold',
      color: '#1F2937',
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 9,
      color: '#6B7280',
      borderTop: '1 solid #E5E7EB',
      paddingTop: 10,
    },
  });

  const calculateDiscount = () => {
    if (!order.coupon) return 0;
    if (order.coupon.discount_type === 'percent') {
      return (Number(order.total_price || 0) * Number(order.coupon.discount_value || 0)) / 100;
    }
    return Number(order.coupon.discount_value || 0);
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>INVOICE</Text>
          <Text style={pdfStyles.orderNumber}>Order #{order.id}</Text>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>
            Date: {new Date(order.created_at).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 10, color: '#10B981', marginTop: 5 }}>
            Status: {order.status.toUpperCase()}
          </Text>
        </View>

        {/* Shipping Information */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Shipping Address</Text>
          <Text style={{ fontSize: 10 }}>{order.address.name}</Text>
          <Text style={{ fontSize: 10 }}>{order.address.phone}</Text>

          <Text style={{ fontSize: 10 }}>{order.address.address_line1}</Text>
          {order.address.address_line2 && (
            <Text style={{ fontSize: 10 }}>{order.address.address_line2}</Text>
          )}
          <Text style={{ fontSize: 10 }}>
            {order.address.city}, {order.address.state} {order.address.zip_code}
          </Text>
          <Text style={{ fontSize: 10 }}>{order.address.country}</Text>
        </View>

        {/* Payment Information */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Payment Method</Text>
          <Text style={{ fontSize: 10, textTransform: 'capitalize' }}>
            {order.payment_method.replace(/_/g, ' ')}
          </Text>
        </View>

        {/* Delivery Information */}
        {order.actual_delivery_date && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Delivery Information</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Delivered On:</Text>
              <Text style={pdfStyles.value}>
                {new Date(order.actual_delivery_date).toLocaleDateString()}
              </Text>
            </View>
            {order.tracking_number && (
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Tracking Number:</Text>
                <Text style={pdfStyles.value}>{order.tracking_number}</Text>
              </View>
            )}
            {order.delivery_partner && (
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Delivery Partner:</Text>
                <Text style={pdfStyles.value}>{order.delivery_partner}</Text>
              </View>
            )}
          </View>
        )}

        {/* Order Items Table */}
        <View style={pdfStyles.table}>
          <Text style={pdfStyles.sectionTitle}>Order Items</Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.col1}>Product</Text>
            <Text style={pdfStyles.col2}>Price</Text>
            <Text style={pdfStyles.col3}>Quantity</Text>
            <Text style={pdfStyles.col4}>Total</Text>
          </View>
          {order.items.map((item, index) => {
            const priceEach = Number(item.price || 0);
            const total = priceEach * Number(item.quantity || 0);
            const variant = item.product_variant || {};

            return (
              <View key={index} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.col1}>
                  {item.product_name || 'Product'} ({variant.size})
                </Text>
                <Text style={pdfStyles.col2}>{siteConfig.currency.symbol}{priceEach.toFixed(2)}</Text>
                <Text style={pdfStyles.col3}>{item.quantity}</Text>
                <Text style={pdfStyles.col4}>{siteConfig.currency.symbol}{total.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>{siteConfig.currency.symbol}{Number(order.total_price || 0).toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text>Shipping:</Text>
            <Text>Please contact us on 9765815854 to get shipping details</Text>
          </View>
          {order.coupon && (
            <View style={pdfStyles.totalRow}>
              <Text>Discount ({order.coupon.code}):</Text>
              <Text>-{siteConfig.currency.symbol}{calculateDiscount().toFixed(2)}</Text>
            </View>
          )}
          <View style={pdfStyles.grandTotal}>
            <Text>Total:</Text>
            <Text>{siteConfig.currency.symbol}{Number(order.total_price || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text>Thank you for your purchase!</Text>
          <Text>For questions, contact: support@styleshop.com | (123) 456-7890</Text>
        </View>
      </Page>
    </Document>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await orderService.getOrder(id);

        // Enhance order items with product details
        if (orderData && orderData.items) {
          const enhanceWithProductDetails = async (items) => {
            const enhancedItems = [...items];

            for (let i = 0; i < enhancedItems.length; i++) {
              const item = enhancedItems[i];
              if (item.product_variant && item.product_variant.product) {
                try {
                  const productDetails = await productService.getProduct(item.product_variant.product);
                  item.product_name = productDetails.name;
                  item.product_image = productDetails.images?.[0]?.image || null;
                  item.product_slug = productDetails.slug;
                } catch (err) {
                  console.error('Error fetching product details:', err);
                }
              }
            }

            return enhancedItems;
          };

          orderData.items = await enhanceWithProductDetails(orderData.items);
        }

        setOrder(orderData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const getOrderStatusSteps = () => {
    const steps = [
      { id: 'pending', name: 'Pending', icon: Package, description: 'Order is being processed' },
      { id: 'processing', name: 'Processing', icon: Package, description: 'Order is being prepared' },
      { id: 'shipped', name: 'Shipped', icon: Truck, description: 'Order has been shipped' },
      { id: 'delivered', name: 'Delivered', icon: CheckCircle, description: 'Order has been delivered' }
    ];

    if (order.status === 'cancelled') {
      return [
        { id: 'cancelled', name: 'Cancelled', icon: AlertCircle, description: 'Order has been cancelled' }
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const statusMap = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': 0
    };

    return statusMap[order.status] || 0;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className={`h-16 w-16 rounded-full border-t-2 border-b-2 ${primaryBgClass} animate-spin`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="text-center">
          <h1 className={`text-3xl font-extrabold ${primaryTextClass}`}>Order Detail</h1>
          <p className="mt-4 text-red-600">{error || 'Order not found'}</p>
          <Link
            to="/orders"
            className={`${primaryBgClass} mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${primaryBgHoverClass} transition-all duration-300`}
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderStatusSteps = getOrderStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Back to orders link */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className={`inline-flex items-center text-sm font-medium ${primaryTextClass} hover:text-indigo-500 transition-colors duration-300 group`}
            >
              <ChevronLeft size={16} className="mr-1 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to orders
            </button>
          </div>

          {/* Order header */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-500">Order</span>
                  <h1 className={`text-2xl font-bold mt-1 ${primaryTextClass}`}>#{order.id}</h1>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusBadgeColor(order.status)}`}>
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${order.status === 'cancelled' ? 'bg-red-400' : 'bg-indigo-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-indigo-500'}`}></span>
                    </span>
                    {order.status}
                  </div>
                  {/* Print Invoice Button - Only show when delivered */}
                  {order.status === 'delivered' && (
                    <div className="relative group">
                      <PDFDownloadLink
                        document={<OrderInvoice order={order} />}
                        fileName={`invoice-${order.id}.pdf`}
                      >
                        {({ loading }) => (
                          <button
                            className={`${primaryButtonClass} inline-flex items-center justify-center w-11 h-11 rounded-full shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                            disabled={loading}
                            aria-label="Download Invoice"
                          >
                            <Printer size={20} className={loading ? 'animate-pulse' : ''} />
                          </button>
                        )}
                      </PDFDownloadLink>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50">
                        Download Invoice
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-1.5 text-gray-400" />
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-1.5 text-gray-400" />
                  {new Date(order.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Order status tracker */}
            {order.status !== 'cancelled' && (
              <div className="px-6 py-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className={`text-lg font-semibold ${primaryTextClass} mb-4`}>Order Progress</h2>

                <div className="mt-2">
                  <div className="overflow-hidden">
                    <ul className="relative flex items-center justify-between w-full">
                      {orderStatusSteps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                          <li key={step.id} className={`relative flex flex-col items-center ${index !== orderStatusSteps.length - 1 ? 'flex-1' : ''}`}>
                            {/* Connector line */}
                            {index !== orderStatusSteps.length - 1 && (
                              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${isActive ? primaryBgClass : 'bg-gray-300'}`}></div>
                            )}

                            {/* Step icon */}
                            <div
                              className={`relative flex items-center justify-center w-9 h-9 rounded-full ${isActive ? `${primaryBgClass} text-white` : 'bg-gray-200 text-gray-500'
                                } ${isCurrent ? 'ring-4 ring-indigo-100' : ''} transition-all duration-300`}
                            >
                              <step.icon size={18} />
                            </div>

                            {/* Step label */}
                            <div className="mt-3 text-xs font-medium text-center">
                              <span className={isActive ? `${primaryTextClass} font-semibold` : 'text-gray-500'}>
                                {step.name}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Current step description */}
                <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {order.status === 'cancelled' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        orderStatusSteps[currentStepIndex].icon && (
                          (() => {
                            const IconComponent = orderStatusSteps[currentStepIndex].icon;
                            return <IconComponent className={`h-5 w-5 ${primaryTextClass}`} />;
                          })()
                        )
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {order.status === 'cancelled' ? 'Order cancelled' : orderStatusSteps[currentStepIndex].name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>
                          {order.status === 'cancelled'
                            ? 'Your order has been cancelled. If you have any questions, please contact our customer support.'
                            : orderStatusSteps[currentStepIndex].description
                          }
                        </p>

                        {order.status === 'shipped' && order.expected_delivery_date && (
                          <div className={`mt-3 flex items-center ${primaryTextClass} font-medium`}>
                            <Truck size={16} className={`mr-2 ${primaryTextClass}`} />
                            <p>Expected delivery: {new Date(order.expected_delivery_date).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Tracking Information - Only visible when shipped or delivered */}
            {(order.status === 'shipped' || order.status === 'delivered') && order.tracking_number && (
              <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                <h2 className={`text-lg font-semibold ${primaryTextClass} mb-4 flex items-center`}>
                  <Package2 size={20} className={`mr-2 ${primaryTextClass}`} />
                  Delivery Tracking
                </h2>

                <div className="bg-white rounded-lg p-5 shadow-sm border border-indigo-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Delivery Partner */}
                    {order.delivery_partner && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery Partner</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                          <Truck size={16}  className={`mr-2 ${primaryTextClass}`}/>
                          {order.delivery_partner}
                        </div>
                      </div>
                    )}

                    {/* Tracking Number */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking Number</div>
                      <div className="mt-1 text-sm font-semibold text-gray-900 font-mono">
                        {order.tracking_number}
                      </div>
                    </div>

                    {/* Expected Delivery Date */}
                    {order.expected_delivery_date && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Delivery</div>
                        <div className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                          <Calendar size={16} className={`mr-2 ${primaryTextClass}`} />
                          {new Date(order.expected_delivery_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actual Delivery Date (if delivered) */}
                    {order.status === 'delivered' && order.actual_delivery_date && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivered On</div>
                        <div className="mt-1 text-sm font-semibold text-green-700 flex items-center">
                          <CheckCircle size={16} className="mr-2 text-green-600" />
                          {new Date(order.actual_delivery_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track Package Button */}
                  {order.tracking_url && (
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${primaryBgClass} inline-flex items-center justify-center w-full px-4 py-2.5 text-white text-sm font-medium rounded-lg hover:${primaryBgHoverClass} transition-colors duration-300 shadow-sm hover:shadow-md`}
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Track Your Package
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order cancelled status */}
            {order.status === 'cancelled' && (
              <div className="px-6 py-6 bg-red-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-red-800">Order Cancelled</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Your order has been cancelled. If you have any questions, please contact our customer support.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order details and shipping in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order info */}
            <div className="md:col-span-1 bg-white rounded-2xl shadow-sm p-6 order-2 md:order-1">
              <h2 className={`text-lg font-semibold flex items-center ${primaryTextClass}`}>
                <ShoppingBag size={18} className={`mr-2 ${primaryTextClass}`} />
                Order Information
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Order number</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">{order.id}</div>
                </div>

                {/* <div>
                  <div className="text-sm font-medium text-gray-500">Payment method</div>
                  <div className="mt-1 text-sm text-gray-900 capitalize flex items-center">
                    <CreditCard size={16} className="mr-2 text-gray-400" />
                    {order.payment_method === 'cash_on_delivery' ? 'Pay Later' : order.payment_method.replace(/_/g, ' ')}
                  </div>
                </div> */}

                {order.coupon && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Coupon applied</div>
                    <div className="mt-1 text-sm text-green-600 font-medium">
                      {order.coupon.code} ({order.coupon.discount_type === 'percent' ? `${Number(order.coupon.discount_value || 0)}%` : `${siteConfig.currency.symbol}${Number(order.coupon.discount_value || 0)}`} off)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6 order-1 md:order-2">
              <h2 className={`text-lg font-semibold flex items-center ${primaryTextClass}`}>
                <MapPin size={18} className={`mr-2 ${primaryTextClass}`} />
                Shipping Information
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Shipping address</div>
                  <address className="mt-1 text-sm text-gray-900 not-italic">
                    {order.address.name}<br />
                    {order.address.phone}<br />
                    {order.address.address_line1}<br />
                    {order.address.address_line2 && <>{order.address.address_line2}<br /></>}
                    {order.address.city}, {order.address.state} {order.address.zip_code}<br />
                    {order.address.country}
                  </address>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Shipping method</div>
                  <div className="mt-1 text-sm text-gray-900 flex items-center">
                    Standard Shipping (Please contact us on 9765815854 to get shipping details)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-100">
              <h2 className={`text-lg font-semibold ${primaryTextClass}`}>Items in your order</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {order.items.map((item) => {
                const variant = item.product_variant || {};
                const priceEach = Number(item.price || 0);
                const total = priceEach * Number(item.quantity || 0);

                return (
                  <div key={item.id} className="p-6 flex space-x-4">
                    <div className="flex-shrink-0 w-20 h-20 border border-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.product_image || '/api/placeholder/80/80'}
                        alt={item.product_name || 'Product'}
                        className="w-full h-full object-center object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.product_slug ? (
                              <Link to={`/products/${item.product_slug}`} className={`${primaryHoverClass} transition-colors duration-300`}>
                                {item.product_name || `${variant.product?.name || 'Product'} (${variant.size})`}
                              </Link>
                            ) : (
                              <span>{item.product_name || `Product (${variant.size})`}</span>
                            )}
                          </h4>
                          <div className="mt-1 text-sm text-gray-500">Size: {variant.size}</div>
                          <div className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {siteConfig.currency.symbol}{total.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-2 flex-1 flex justify-end items-end">
                        <span className="text-xs text-gray-500">
                          {siteConfig.currency.symbol}{priceEach.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="bg-gray-50 px-6 py-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{siteConfig.currency.symbol}{Number(order.total_price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">Please contact us on 9765815854 to get shipping details</span>
                </div>
                {order.coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount ({order.coupon.code})</span>
                    <span className="font-medium text-green-600">
                      -{siteConfig.currency.symbol}{
                        order.coupon.discount_type === 'percent'
                          ? (Number(order.total_price || 0) * Number(order.coupon.discount_value || 0) / 100).toFixed(2)
                          : Number(order.coupon.discount_value || 0).toFixed(2)
                      }
                    </span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">{siteConfig.currency.symbol}{Number(order.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer support */}
            <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-sm overflow-hidden`}>
              <div className="px-6 py-6 text-white">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-white/20 rounded-full">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Need help with your order?</h3>
                    <p className="mt-2 text-indigo-100">
                      Our customer support team is here to help! Contact us at{' '}
                      <a href={`mailto:${siteConfig.contact.email}`}
                        className="text-white font-medium hover:underline">
                        {siteConfig.contact.email}
                      </a>
                      {' '}or call us at{' '}
                      <a href={`tel:${siteConfig.contact.phone}`} className="text-white font-medium hover:underline">
                        {siteConfig.contact.phone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

