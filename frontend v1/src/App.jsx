import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ActivateAccount from './pages/auth/ActivateAccount'; // NEW
import ProductList from './pages/product/ProductList';
import ProductDetail from './pages/product/ProductDetail';
import ProductReviews from './pages/product/ProductReviews';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import OrderSuccess from './pages/order/OrderSuccess';
import OrderDetail from './pages/order/OrderDetail';
import MyOrders from './pages/order/MyOrders';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import AddressBook from './pages/profile/AddressBook';
import Wishlist from './pages/wishlist/Wishlist';
import NotFound from './pages/notfound/NotFound';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import NewAddress from './pages/profile/NewAddress';
import EditAddress from './pages/profile/EditAddress';
import ChangePassword from './pages/profile/ChangePassword';
import Notifications from './pages/notifications/Notifications';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import SalesReport from './pages/admin/SalesReport';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import CouponManagement from './pages/admin/CouponManagement';
import UserManagement from './pages/admin/UserManagement';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import PaymentStatus from './pages/cart/PaymentStatus';
// Context Providers

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import BannerManagement from './pages/admin/BannerManagement';
import BannerCreate from './pages/admin/BannerCreate';
import ScrollToTop from './components/layout/ScrollToTop';
import BannerEdit from './pages/admin/BannerEdit';

import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import ReturnRefundPolicy from './pages/legal/ReturnRefundPolicy';


const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Admin Routes - No Navbar or Footer */}
              <Route path="/admin" element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } />
              <Route path="/admin/sales-report" element={
                <AdminRoute>
                  <SalesReport />
                </AdminRoute>
              } />
              <Route path="/admin/products" element={
                <AdminRoute>
                  <ProductManagement />
                </AdminRoute>
              } />
              <Route path="/admin/banners" element={
                <AdminRoute>
                  <BannerManagement/>
                </AdminRoute>
              } />
               <Route path="/admin/banners/create" element={
                <AdminRoute>
                  <BannerCreate/>
                </AdminRoute>
              } />

              <Route path="/admin/banners/edit/:id" element={
                <AdminRoute>
                  <BannerEdit/>
                </AdminRoute>
              } />

              <Route path="/admin/products/create" element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              } />
              <Route path="/admin/products/edit/:slug" element={
                <AdminRoute>
                  <EditProduct />
                </AdminRoute>
              } />
              <Route path="/admin/categories" element={
                <AdminRoute>
                  <CategoryManagement />
                </AdminRoute>
              } />
              <Route path="/admin/orders" element={
                <AdminRoute>
                  <OrderManagement />
                </AdminRoute>
              } />
              <Route path="/admin/orders/:id" element={
                <AdminRoute>
                  <AdminOrderDetail />
                </AdminRoute>
              } />
              <Route path="/admin/coupons" element={
                <AdminRoute>
                  <CouponManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              {/* Regular Customer Routes with Navbar and Footer */}
              <Route path="*" element={
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/activate/:token" element={<ActivateAccount />} /> {/* NEW */}

                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:slug" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/checkout" 
                        element={
                          <PrivateRoute>
                            <Checkout />
                          </PrivateRoute>
                        } 
                      />
                      <Route path="/payment-status/:merchantOrderId" element={<PaymentStatus />} />

                      <Route 
                        path="/orders" 
                        element={
                          <PrivateRoute>
                            <MyOrders />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/notifications" 
                        element={
                          <PrivateRoute>
                            <Notifications />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/orders/:id" 
                        element={
                          <PrivateRoute>
                            <OrderDetail />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/orders/success/:id" 
                        element={
                          <PrivateRoute>
                            <OrderSuccess />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile" 
                        element={
                          <PrivateRoute>
                            <Profile />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile/edit" 
                        element={
                          <PrivateRoute>
                            <EditProfile />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile/addresses" 
                        element={
                          <PrivateRoute>
                            <AddressBook />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile/addresses/new" 
                        element={
                          <PrivateRoute>
                            <NewAddress />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile/addresses/edit/:id" 
                        element={
                          <PrivateRoute>
                            <EditAddress />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/profile/change-password" 
                        element={
                          <PrivateRoute>
                            <ChangePassword />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/wishlist" 
                        element={
                          <PrivateRoute>
                            <Wishlist />
                          </PrivateRoute>
                        } 
                      />
                      <Route 
                        path="/products/:slug/review" 
                        element={
                          <PrivateRoute>
                            <ProductReviews />
                          </PrivateRoute>
                        } 
                      />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />
                      <Route path="/shipping" element={<ShippingPolicy />} />
                      <Route path="/return" element={<ReturnRefundPolicy />} />

                      
                      {/* Catch all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;