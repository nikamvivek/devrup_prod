# urls.py - Complete URL routing with payment integration
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'address', AddressViewSet, basename='address')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'product-variants', ProductVariantViewSet, basename='product-variant')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'product-images', ProductImageViewSet, basename='product-image')
router.register(r'users', UserViewSet, basename='user')
router.register(r'banners', PromotionalBannerViewSet, basename='banner')

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
   
    # ============================================
    # AUTH ENDPOINTS
    # ============================================
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/activate/<str:token>/', ActivateAccountView.as_view(), name='activate'),
    path('auth/resend-activation/', ResendActivationEmailView.as_view(), name='resend-activation'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/check/', CheckAuthView.as_view(), name='check-auth'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/password-change/', PasswordChangeView.as_view(), name='password-change'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
   
    # ============================================
    # CART ENDPOINTS
    # ============================================
    path('cart/', EnhancedCartView.as_view(), name='cart'),
    path('cart/add/', CartItemCreateView.as_view(), name='cart-add'),
    path('cart/update/<int:item_id>/', CartItemUpdateView.as_view(), name='cart-update'),
    path('cart/remove/<int:item_id>/', CartItemRemoveView.as_view(), name='cart-remove'),
   
    # ============================================
    # WISHLIST ENDPOINTS
    # ============================================
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<uuid:product_id>/', WishlistView.as_view(), name='wishlist-detail'),
   
    # ============================================
    # COUPON ENDPOINTS
    # ============================================
    path('validate-coupon/', validate_coupon_code, name='validate-coupon'),

    # ============================================
    # CHECKOUT & PAYMENT ENDPOINTS (NEW)
    # ============================================
    # Cash on Delivery checkout
    path('checkout/cod/', CashOnDeliveryOrderView.as_view(), name='checkout-cod'),
    
    # Online payment checkout
    path('checkout/online/', OnlinePaymentView.as_view(), name='checkout-online'),
    
    # Payment status check (for frontend to verify payment after redirect)
    path('payment/status/', PaymentStatusView.as_view(), name='payment-status'),
    
    # PhonePe webhook (for backend payment confirmation)
    path('payment/webhook/phonepe/', phonepe_webhook, name='phonepe-webhook'),

    # ============================================
    # DASHBOARD ENDPOINTS
    # ============================================
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('dashboard/sales-report/', SalesReportView.as_view(), name='sales-report'),
    path('dashboard/category-sales/', CategorySalesReportView.as_view(), name='category-sales-report'),
    path('dashboard/sales-report/export/', ExportSalesReportView.as_view(), name='export-sales-report'),

    # ============================================
    # HOME PAGE
    # ============================================
    path('homepage/', HomepageDataView.as_view(), name='homepage-data'),
]