# views.py - Updated imports at the top
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q, Min, Max, Case, When
from django.db.models.functions import TruncDay, TruncMonth, Least, Greatest
from django.utils.dateparse import parse_date


import uuid
import traceback

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes

# Use ValidationError from DRF, not from Django
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework import viewsets, generics, status, filters, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta

from .models import (
    PromotionalBanner, User, Address, Category, Brand, Product, ProductVariant, ProductImage,
    ProductAttribute, Cart, CartItem, Wishlist, Coupon, CouponUsage, Order,
    OrderItem, Review, Notification
)
from .serializers import (
    PromotionalBannerSerializer, UserSerializer, UserRegistrationSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    AddressSerializer, CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, ProductCreateUpdateSerializer,
    ProductImageSerializer, ProductAttributeSerializer, ProductVariantSerializer,
    CartSerializer, CartItemSerializer, WishlistSerializer, ReviewSerializer,
    CouponSerializer, CouponValidateSerializer, OrderSerializer, OrderCreateSerializer,
    NotificationSerializer, DashboardOverviewSerializer, SalesReportSerializer, ProductImageSerializer
)




from django.core.mail import send_mail
from django.conf import settings

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from .models import PromotionalBanner
from .serializers import PromotionalBannerSerializer

from rest_framework.permissions import IsAdminUser
from .serializers import (
    UserSerializer, UserRegistrationSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserLoginSerializer, ResendActivationEmailSerializer
)


# ============================================================================
# EMAIL HELPER FUNCTIONS
# ============================================================================

def send_activation_email(user):
    """Send account activation email with token"""
    activation_link = f"https://{settings.FRONTEND_URL}activate/{user.activation_token}"
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 1px solid #e0e0e0;
            }}
            h2 {{
                color: #502380;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 2px solid #502380;
                padding-bottom: 10px;
            }}
            .button {{
                background-color: white;
                border: 2px solid #502380;
                color: #502380;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 20px auto;
                cursor: pointer;
                border-radius: 5px;
                width: fit-content;
                display: block;
                font-weight: bold;
            }}
            .note {{
                color: #666;
                font-size: 14px;
                margin-top: 20px;
                background-color: #f3e5f5;
                padding: 10px;
                border-radius: 4px;
                text-align: center;
            }}
            p {{
                color: #333;
                margin-bottom: 15px;
            }}
            a {{
                color: #502380;
                word-break: break-all;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>Welcome to Devrup Organics!</h2>
            <p>Thank you for registering. Click the button below to activate your account:</p>
            <a href="{activation_link}" class="button">Activate Account</a>
            <p class="note">This link will remain valid until you activate your account.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{activation_link}</p>
        </div>
    </body>
    </html>
    """
    
    send_mail(
        'Activate Your Account',
        f'Please activate your account by clicking: {activation_link}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
        html_message=html_message
    )


def send_password_reset_email(user):
    """Send password reset email with token"""
    reset_link = f"https://{settings.FRONTEND_URL}reset-password/{user.password_reset_token}"
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 1px solid #e0e0e0;
            }}
            h2 {{
                color: #502380;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 2px solid #502380;
                padding-bottom: 10px;
            }}
            .button {{
                background-color: white;
                border: 2px solid #502380;
                color: #502380;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 20px auto;
                cursor: pointer;
                border-radius: 5px;
                width: fit-content;
                display: block;
                font-weight: bold;
            }}
            .warning {{
                color: #502380;
                font-size: 14px;
                margin-top: 20px;
                background-color: #f3e5f5;
                border-left: 4px solid #502380;
                padding: 10px;
                border-radius: 4px;
            }}
            p {{
                color: #333;
                margin-bottom: 15px;
            }}
            a {{
                color: #502380;
                word-break: break-all;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="{reset_link}" class="button">Reset Password</a>
            <p>This link will remain valid until a new password reset is requested.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{reset_link}</p>
            <p class="warning">If you didn't request this password reset, please ignore this email.</p>
        </div>
    </body>
    </html>
    """
    
    send_mail(
        'Password Reset Request',
        f'Click the following link to reset your password: {reset_link}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
        html_message=html_message
    )


def send_activation_reminder_email(user):
    """Send activation reminder email"""
    activation_link = f"https://{settings.FRONTEND_URL}activate/{user.activation_token}"
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: 20px auto;
                background-color: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                border: 1px solid #e0e0e0;
            }}
            h2 {{
                color: #502380;
                margin-bottom: 20px;
                text-align: center;
                border-bottom: 2px solid #502380;
                padding-bottom: 10px;
            }}
            .button {{
                background-color: white;
                border: 2px solid #502380;
                color: #502380;
                padding: 15px 32px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 20px auto;
                cursor: pointer;
                border-radius: 5px;
                width: fit-content;
                display: block;
                font-weight: bold;
            }}
            .note {{
                color: #666;
                font-size: 14px;
                margin-top: 20px;
                background-color: #f3e5f5;
                padding: 10px;
                border-radius: 4px;
                text-align: center;
            }}
            p {{
                color: #333;
                margin-bottom: 15px;
            }}
            a {{
                color: #502380;
                word-break: break-all;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <h2>Account Activation Reminder</h2>
            <p>You requested a new activation link for your account. Click the button below to activate:</p>
            <a href="{activation_link}" class="button">Activate Account</a>
            <p class="note">If you didn't request this email, please ignore it.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{activation_link}</p>
        </div>
    </body>
    </html>
    """
    
    send_mail(
        'Account Activation Reminder',
        f'Please activate your account by clicking: {activation_link}',
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
        html_message=html_message
    )


# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Account registered successfully.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivateAccountView(APIView):
    """Activate user account using token"""
    permission_classes = [AllowAny]
    
    def post(self, request, token):
        try:
            user = User.objects.get(activation_token=token)
            
            if user.is_active:
                return Response({
                    "message": "Account is already activated"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Activate user
            user.is_active = True
            user.activation_token = None  # Clear token after use
            user.save()
            
            return Response({
                "message": "Account activated successfully",
                "success": True
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                "message": "Invalid activation token"
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "message": "An error occurred during activation"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendActivationEmailView(APIView):
    """Resend activation email to user"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            
            if not email:
                return Response({
                    "error": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
                
                if user.is_active:
                    return Response({
                        "error": "Account is already activated"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Generate new activation token
                user.activation_token = str(uuid.uuid4())
                user.save()
                
                # Send activation email
                send_activation_reminder_email(user)
                
                return Response({
                    "message": "Activation email has been sent"
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Don't reveal if user exists for security
                return Response({
                    "message": "If an account exists with this email, an activation link will be sent"
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                "message": f"Error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """User login with JWT tokens"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                return Response({
                    "message": "Email and password are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    "message": "Invalid credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check password
            if not user.check_password(password):
                return Response({
                    "message": "Invalid credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if account is activated
            if not user.is_active:
                return Response({
                    "message": "Account not activated. Please check your email for activation link.",
                    "requires_activation": True,
                    "email": user.email
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'userid': str(user.id),
                    'email': user.email,
                    'firstname': user.first_name,
                    'lastname': user.last_name,
                    'phone': user.phone_number if hasattr(user, 'phone_number') else '',
                    'user_type': 'admin' if user.is_staff else 'customer'
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "message": f"Login failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LogoutView(APIView):
    """User logout"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return Response({
            "message": "Successfully logged out"
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request password reset with email"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email')
            
            if not email:
                return Response({
                    "error": "Email is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(email=email)
                
                # Generate password reset token
                user.password_reset_token = str(uuid.uuid4())
                user.save()
                
                # Send reset email
                send_password_reset_email(user)
                
            except User.DoesNotExist:
                pass  # Silent fail to prevent email enumeration
            
            # Always return positive response for security
            return Response({
                "message": "If an account exists with this email, password reset instructions will be sent"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "message": f"Error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            token = request.data.get('token')
            password = request.data.get('password')
            password_confirm = request.data.get('password_confirm')
            
            if not token or not password or not password_confirm:
                return Response({
                    "error": "Token, password, and password confirmation are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != password_confirm:
                return Response({
                    "error": "Passwords do not match"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(password_reset_token=token)
                
                # Set new password
                user.set_password(password)
                user.password_reset_token = None  # Clear token after use
                user.save()
                
                # Send confirmation email
                send_mail(
                    'Password Reset Successful',
                    'Your password has been successfully reset.',
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False
                )
                
                return Response({
                    "message": "Password has been successfully reset",
                    "success": True
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    "error": "Invalid password reset token"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "message": f"Password reset failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PasswordChangeView(APIView):
    """Change password for authenticated users"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if not current_password or not new_password:
                return Response({
                    "error": "Current password and new password are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = request.user
            
            if not user.check_password(current_password):
                return Response({
                    "error": "Current password is incorrect"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({
                "message": "Password updated successfully"
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "message": f"Password change failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get/update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class CheckAuthView(APIView):
    """Check if user is authenticated"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "authenticated": True,
            "user": {
                'userid': str(request.user.id),
                'email': request.user.email,
                'firstname': request.user.first_name,
                'lastname': request.user.last_name,
            }
        }, status=status.HTTP_200_OK)
    

class PromotionalBannerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing promotional banners.
    Provides CRUD operations for banners.
    """
    queryset = PromotionalBanner.objects.all().order_by('-created_at')
    serializer_class = PromotionalBannerSerializer
    parser_classes = (MultiPartParser, FormParser)
    lookup_field = 'id'
    
    def get_permissions(self):
        """
        Public can view active banners, but only admins can create/update/delete
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = []
        else:
            permission_classes = [IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter to show only active banners for non-admin users
        """
        queryset = PromotionalBanner.objects.all()
        
        # Non-admin users only see active banners
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        
        # Optional filtering by position
        position = self.request.query_params.get('position', None)
        if position:
            queryset = queryset.filter(position=position)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """
        Create a new banner with image upload
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """
        Update a banner - handles image replacement properly
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Store old image path before updating
        old_image = instance.image
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Check if a new image is being uploaded
        new_image = request.FILES.get('image')
        
        if new_image and old_image:
            # Delete old image file from storage before saving new one
            try:
                if os.path.isfile(old_image.path):
                    os.remove(old_image.path)
            except Exception as e:
                pass
                # Log the error but don't fail the update
                # print(f"Error deleting old image: {e}")
        
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Partial update (PATCH) - delegates to update method
        """
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete a banner and its associated image
        """
        instance = self.get_object()
        
        # Delete the image file from storage
        if instance.image:
            try:
                if os.path.isfile(instance.image.path):
                    os.remove(instance.image.path)
            except Exception as e:
                pass
        
        self.perform_destroy(instance)
        return Response(
            {"message": "Banner deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def toggle_status(self, request, id=None):
        """
        Toggle the is_active status of a banner
        """
        banner = self.get_object()
        banner.is_active = not banner.is_active
        banner.save()
        serializer = self.get_serializer(banner)
        return Response(serializer.data)

class EnhancedCartView(APIView):
    """
    Enhanced cart view that includes product details with cart items.
    This is a drop-in replacement for the original CartView.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        # Use the standard serializer first
        serializer = CartSerializer(cart)
        cart_data = serializer.data
        
        # Enhance cart items with product details
        if 'items' in cart_data and cart_data['items']:
            enhanced_items = []
            
            for item_data in cart_data['items']:
                # Get the product variant
                if 'product_variant' in item_data and item_data['product_variant']:
                    variant_id = item_data['product_variant']['id']
                    try:
                        # Get the actual variant
                        variant = ProductVariant.objects.get(id=variant_id)
                        
                        # Get associated product
                        product = variant.product
                        
                        # Get product image
                        product_image = None
                        image = ProductImage.objects.filter(product=product).first()
                        if image:
                            product_image = request.build_absolute_uri(image.image.url)
                        
                        # Add product data to the item
                        item_data['product'] = {
                            'id': str(product.id),
                            'name': product.name,
                            'slug': product.slug,
                            'description': product.description,
                            'category': {
                                'id': str(product.category.id),
                                'name': product.category.name,
                                'slug': product.category.slug
                            } if product.category else None,
                            'main_image': product_image
                        }
                    except (ProductVariant.DoesNotExist, Product.DoesNotExist):
                        # If the product or variant doesn't exist, just keep the original data
                        pass
                
                enhanced_items.append(item_data)
            
            cart_data['items'] = enhanced_items
        
        return Response(cart_data)




# Address Views
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this address is set as default, unset any existing default
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)


# Category Views
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()


# Brand Views
class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()


# views.py - Update the ProductViewSet to support slug lookup


class ProductImageViewSet(viewsets.ModelViewSet):
    """ViewSet for handling product images"""
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductImage.objects.all()
    
    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        
        # Ensure user is the vendor of the product or an admin
        if product.vendor != self.request.user and not self.request.user.is_admin:
            return Response(
                {'error': 'You do not have permission to add images to this product'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(product=product)

from django.db.models import Min, Max, Case, When, Q, F, Value, DecimalField
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]  # Remove OrderingFilter, we'll handle manually
    search_fields = ['name', 'description', 'category__name', 'brand__name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

    def get_queryset(self):
        user = self.request.user

        queryset = Product.objects.select_related(
            'category', 'brand', 'vendor'
        ).prefetch_related('variants')

        if not (user.is_authenticated and user.is_admin):
            queryset = queryset.filter(is_active=True)

        queryset = self.apply_filters(queryset)
        queryset = self.apply_ordering(queryset)

        return queryset.distinct()

    
    def apply_filters(self, queryset):
        """Apply all filters to the queryset"""
        
        # Filter by category
        category_slug = self.request.query_params.get('category__slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by brand
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand__id=brand)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price or max_price:
            # Create a subquery for products with variants in the price range
            variant_filter = Q()
            
            if min_price:
                variant_filter &= (
                    Q(variants__is_discount_active=True, variants__discount_price__gte=min_price) |
                    Q(variants__is_discount_active=False, variants__price__gte=min_price)
                )
            
            if max_price:
                variant_filter &= (
                    Q(variants__is_discount_active=True, variants__discount_price__lte=max_price) |
                    Q(variants__is_discount_active=False, variants__price__lte=max_price)
                )
            
            queryset = queryset.filter(variant_filter)
        
        # Filter by vendor
        vendor = self.request.query_params.get('vendor')
        if vendor:
            queryset = queryset.filter(vendor__id=vendor)
        
        return queryset
    
    def apply_ordering(self, queryset):
        """Apply ordering to the queryset"""
        ordering = self.request.query_params.get('ordering')
        
        if not ordering:
            # Default ordering by created date (newest first)
            return queryset.order_by('-created_at', 'id')
        
        if ordering == 'variants__price':
            # Order by minimum effective price (ascending)
            return queryset.annotate(
                min_effective_price=Min(
                    Case(
                        When(
                            variants__is_discount_active=True,
                            then=Coalesce('variants__discount_price', 'variants__price')
                        ),
                        default='variants__price',
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            ).order_by('min_effective_price', 'id')
            
        elif ordering == '-variants__price':
            # Order by maximum effective price (descending)
            return queryset.annotate(
                max_effective_price=Max(
                    Case(
                        When(
                            variants__is_discount_active=True,
                            then=Coalesce('variants__discount_price', 'variants__price')
                        ),
                        default='variants__price',
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            ).order_by('-max_effective_price', 'id')
            
        elif ordering == 'created_at':
            # Oldest first
            return queryset.order_by('created_at', 'id')
            
        elif ordering == '-created_at':
            # Newest first
            return queryset.order_by('-created_at', 'id')
            
        elif ordering == 'name':
            # Alphabetical A-Z
            return queryset.order_by('name', 'id')
            
        elif ordering == '-name':
            # Alphabetical Z-A
            return queryset.order_by('-name', 'id')
            
        elif ordering == 'reviews_count' or ordering == '-reviews_count':
            # Order by review count (requires reviews_count field or annotation)
            return queryset.order_by(ordering, 'id')
        
        else:
            # Fallback for any other ordering
            try:
                return queryset.order_by(ordering, 'id')
            except:
                # If ordering fails, fall back to default
                return queryset.order_by('-created_at', 'id')
    
    def list(self, request, *args, **kwargs):
        """Override list to handle pagination and ensure unique results"""
        queryset = self.get_queryset()
        
        # Apply search filter if using SearchFilter
        queryset = self.filter_queryset(queryset)
        
        # Paginate
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def variants(self, request, slug=None):
        product = self.get_object()
        variants = product.variants.all()
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, slug=None):
        product = self.get_object()
        
        if request.method == 'GET':
            reviews = product.reviews.all()
            serializer = ReviewSerializer(reviews, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check if user has already reviewed this product
            if Review.objects.filter(user=request.user, product=product).exists():
                return Response(
                    {'error': 'You have already reviewed this product'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add product to the request data
            data = request.data.copy()
            data['product'] = product.id
            
            serializer = ReviewSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                serializer.save(user=request.user, product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsAdminUser])
    def toggle_status(self, request, slug=None):
        """Toggle product active status"""
        product = self.get_object()
        
        # Toggle the is_active status
        product.is_active = not product.is_active
        product.save(update_fields=['is_active'])
        
        # Return the updated product
        serializer = ProductListSerializer(product, context={'request': request})
        return Response(serializer.data)

# Add this to views.py
class ProductImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        product_id = request.data.get('product')
        image_file = request.data.get('image')
        
        if not product_id or not image_file:
            return Response(
                {'error': 'Both product ID and image file are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id)
            
            # Check if user is product vendor or admin
            if product.vendor != request.user and not request.user.is_admin:
                return Response(
                    {'error': 'You do not have permission to add images to this product'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            # Create the product image
            product_image = ProductImage.objects.create(
                product=product,
                image=image_file
            )
            
            return Response(
                ProductImageSerializer(product_image).data,
                status=status.HTTP_201_CREATED
            )
            
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        """Override create with detailed error handling"""
        try:
            # Print the raw request data for debugging            
            # Extract the product_id from request data
            product_id = request.data.get('product_id')
            
            # Validate product_id format if present
            if product_id:
                try:
                    # Try to parse as UUID to check format
                    uuid_obj = uuid.UUID(product_id)                    
                    # Check if product exists
                    try:
                        product = Product.objects.get(id=uuid_obj)
                        
                        # Check permissions
                        if product.vendor != request.user and not request.user.is_admin:
                            return Response(
                                {'error': 'You do not have permission to add variants to this product'},
                                status=status.HTTP_403_FORBIDDEN
                            )
                    except Product.DoesNotExist:
                        return Response(
                            {'product_id': f'Product with ID {product_id} does not exist'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except ValueError:
                    return Response(
                        {'product_id': f'Invalid UUID format: {product_id}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Proceed with standard creation
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            instance = serializer.save()
            
            # Get the complete data for response
            response_serializer = self.get_serializer(instance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to create variant: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Override update with detailed error handling"""
        try:            
            # Get the existing variant
            instance = self.get_object()
            
            # Extract product_id from request data or use existing
            product_id = request.data.get('product_id')
            
            # Validate product_id format if present
            if not product_id:
                # If not provided, add the current product's ID to the request data
                product_id = str(instance.product.id)
                mutable_data = request.data.copy()
                mutable_data['product_id'] = product_id
                request._full_data = mutable_data
            
            # Verify product exists and check permissions
            try:
                product = Product.objects.get(id=uuid.UUID(product_id))                
                # Check permissions
                if product.vendor != request.user and not request.user.is_admin:
                    return Response(
                        {'error': 'You do not have permission to update variants for this product'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except (ValueError, Product.DoesNotExist):
                return Response(
                    {'product_id': f'Invalid or non-existent product ID: {product_id}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Proceed with standard update
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            updated_instance = serializer.save()
            
            # Get the complete data for response
            response_serializer = self.get_serializer(updated_instance)
            return Response(response_serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to update variant: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )



# Add to views.py - Custom permission class for safer user management

class UserManagementPermission(permissions.BasePermission):
    """
    Custom permission class to ensure only admins can manage users
    and users cannot modify themselves to prevent privilege escalation
    """
    
    def has_permission(self, request, view):
        # Only admin users can list or create users
        return request.user.is_authenticated and request.user.is_admin
    
    def has_object_permission(self, request, view, obj):
        # Only admin users can access user objects
        if not request.user.is_authenticated or not request.user.is_admin:
            return False
            
        # Additional safety: prevent admins from removing their own admin privileges
        if obj.id == request.user.id and request.method in ['PUT', 'PATCH']:
            # Check if this would remove admin status from themselves
            if 'is_admin' in request.data and not request.data['is_admin']:
                return False
                
            # For role change actions
            if view.action == 'change_role' and request.data.get('role') != 'admin':
                return False
                
        return True


# Update the UserViewSet to use the custom permission
class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users in admin dashboard
    """
    serializer_class = UserSerializer
    permission_classes = [UserManagementPermission]
    
    # Rest of the implementation remains the same
    
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by role if specified
        role = self.request.query_params.get('role', None)
        if role:
            if role == 'admin':
                queryset = queryset.filter(is_admin=True)
            elif role == 'vendor':
                queryset = queryset.filter(is_vendor=True)
            elif role == 'customer':
                queryset = queryset.filter(is_customer=True)
        
        # Filter by active status if specified
        status = self.request.query_params.get('status', None)
        if status:
            is_active = status.lower() == 'active'
            queryset = queryset.filter(is_active=is_active)
            
        return queryset
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle user active status"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response(self.get_serializer(user).data)
    
    @action(detail=True, methods=['patch'])
    def change_role(self, request, pk=None):
        """Change user role"""
        user = self.get_object()
        role = request.data.get('role', None)
        
        if not role or role not in ['admin', 'vendor', 'customer']:
            return Response(
                {'error': 'Invalid role specified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update role fields
        user.is_admin = role == 'admin'
        user.is_vendor = role == 'vendor'
        user.is_customer = role == 'customer'
        
        # Make sure admin users also have staff permissions
        if user.is_admin:
            user.is_staff = True
        
        user.save()
        return Response(self.get_serializer(user).data)
    
    
# Cart Views
class CartView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        variant_id = request.data.get('product_variant_id')
        quantity = int(request.data.get('quantity', 1))
        
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
        
        variant = get_object_or_404(ProductVariant, id=variant_id)
        
        # Check if item is already in cart
        try:
            cart_item = CartItem.objects.get(cart=cart, product_variant=variant)
            cart_item.quantity += quantity
            cart_item.save()
        except CartItem.DoesNotExist:
            cart_item = CartItem.objects.create(cart=cart, product_variant=variant, quantity=quantity)
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        
        quantity = int(request.data.get('quantity', 1))
        
        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)


class CartItemRemoveView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Wishlist Views
class WishlistView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        wishlist_items = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlist_items, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        product_id = request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        
        # Check if already in wishlist
        if Wishlist.objects.filter(user=request.user, product=product).exists():
            return Response({'error': 'Product already in wishlist'}, status=status.HTTP_400_BAD_REQUEST)
        
        wishlist_item = Wishlist.objects.create(user=request.user, product=product)
        serializer = WishlistSerializer(wishlist_item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request, product_id):
        wishlist_item = get_object_or_404(Wishlist, user=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    
    def get_permissions(self):
        # Allow anyone to validate coupons, but only admins can manage
        if self.action == 'validate':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Coupon.objects.all()
        
        # Filter by is_active if requested
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-created_at') if hasattr(Coupon, 'created_at') else queryset.order_by('-id')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a coupon code for checkout"""
        code = request.data.get('code')
        cart_total = request.data.get('cart_total', 0)
        
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            
            # Check if coupon is currently valid
            from django.utils import timezone
            now = timezone.now()
            
            if coupon.valid_from > now:
                return Response({
                    'valid': False,
                    'message': 'This coupon is not yet valid'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if coupon.valid_to < now:
                return Response({
                    'valid': False,
                    'message': 'This coupon has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check usage limit
            if coupon.used_count >= coupon.usage_limit:
                return Response({
                    'valid': False,
                    'message': 'This coupon has reached its usage limit'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check minimum purchase amount
            if cart_total < coupon.min_purchase_amount:
                return Response({
                    'valid': False,
                    'message': f'Minimum purchase amount of ${coupon.min_purchase_amount} required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate discount
            if coupon.discount_type == 'percent':
                discount_amount = (cart_total * coupon.discount_value) / 100
                if coupon.max_discount:
                    discount_amount = min(discount_amount, coupon.max_discount)
            else:
                discount_amount = coupon.discount_value
            
            return Response({
                'valid': True,
                'coupon': CouponSerializer(coupon).data,
                'discount_amount': discount_amount,
                'final_amount': cart_total - discount_amount
            })
            
        except Coupon.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Invalid coupon code'
            }, status=status.HTTP_404_NOT_FOUND)




class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        notification_ids = request.data.get('notification_ids', [])
        if notification_ids:
            Notification.objects.filter(id__in=notification_ids, user=request.user).update(is_read=True)
        else:
            # Mark all as read if no IDs provided
            Notification.objects.filter(user=request.user).update(is_read=True)
        return Response({'message': 'Notifications marked as read'})


# # Dashboard Views
# class DashboardOverviewView(APIView):
#     permission_classes = [IsAdminUser]
    
#     def get(self, request):
#         # Get basic counts
#         total_orders = Order.objects.count()
#         total_revenue = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
#         total_customers = User.objects.filter(is_customer=True).count()
#         total_products = Product.objects.count()
#         pending_orders = Order.objects.filter(status='pending').count()
        
#         # Get recent orders
#         recent_orders = Order.objects.order_by('-created_at')[:5]
        
#         data = {
#             'total_orders': total_orders,
#             'total_revenue': total_revenue,
#             'total_customers': total_customers,
#             'total_products': total_products,
#             'pending_orders': pending_orders,
#             'recent_orders': recent_orders
#         }
        
#         serializer = DashboardOverviewSerializer(data)
#         return Response(serializer.data)




from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from .models import Order, Product, User, Category
from .serializers import DashboardOverviewSerializer

from datetime import timedelta
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

from .models import Order, Product, User, OrderItem
from .serializers import DashboardOverviewSerializer


class DashboardOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today = now.date()
        yesterday = today - timedelta(days=1)
        week_start = today - timedelta(days=today.weekday())  # Monday
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)

        # ===== BASIC COUNTS =====
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0
        total_customers = User.objects.filter(is_customer=True).count()
        total_products = Product.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()

        # ===== DATE-WISE FILTERS =====
        today_orders = Order.objects.filter(created_at__date=today)
        yesterday_orders = Order.objects.filter(created_at__date=yesterday)
        week_orders = Order.objects.filter(created_at__date__gte=week_start)
        month_orders = Order.objects.filter(created_at__date__gte=month_start)
        year_orders = Order.objects.filter(created_at__date__gte=year_start)

        today_sale = today_orders.aggregate(total=Sum('total_price'))['total'] or 0
        yesterday_sale = yesterday_orders.aggregate(total=Sum('total_price'))['total'] or 0
        week_sale = week_orders.aggregate(total=Sum('total_price'))['total'] or 0
        month_sale = month_orders.aggregate(total=Sum('total_price'))['total'] or 0
        year_sale = year_orders.aggregate(total=Sum('total_price'))['total'] or 0

        # ===== OVERDUE ORDERS =====
        overdue_orders = Order.objects.filter(
            ~Q(status='delivered'),
            expected_delivery_date__lt=today
        ).count()

        # ===== TOP 5 CATEGORIES =====
        top_categories_qs = (
            OrderItem.objects.values('product_variant__product__category__name')
            .annotate(total_sales=Count('id'))
            .order_by('-total_sales')[:5]
        )
        top_categories = [
            {
                'category': c['product_variant__product__category__name'],
                'total_sales': c['total_sales']
            }
            for c in top_categories_qs
        ]

        # ===== TOP 5 PRODUCTS =====
        top_products_qs = (
            OrderItem.objects.values('product_variant__product__name')
            .annotate(total_sales=Count('id'))
            .order_by('-total_sales')[:5]
        )
        top_products = [
            {
                'product': p['product_variant__product__name'],
                'total_sales': p['total_sales']
            }
            for p in top_products_qs
        ]

        # ===== RECENT ORDERS =====
        recent_orders = Order.objects.order_by('-created_at')[:5]

        # ===== ADDITIONAL INSIGHTS =====
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        avg_order_value = (
            total_revenue / total_orders if total_orders > 0 else 0
        )

        customer_repeat_rate = (
            User.objects.filter(is_customer=True)
            .annotate(order_count=Count('orders'))
            .filter(order_count__gt=1)
            .count()
        )

        # ===== FINAL DATA STRUCTURE =====
        data = {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_customers': total_customers,
            'total_products': total_products,
            'pending_orders': pending_orders,
            'overdue_orders': overdue_orders,

            'today_orders': today_orders.count(),
            'today_sale': today_sale,
            'yesterday_orders': yesterday_orders.count(),
            'yesterday_sale': yesterday_sale,
            'week_orders': week_orders.count(),
            'week_sale': week_sale,
            'month_orders': month_orders.count(),
            'month_sale': month_sale,
            'year_orders': year_orders.count(),
            'year_sale': year_sale,

            'cancelled_orders': cancelled_orders,
            'delivered_orders': delivered_orders,
            'avg_order_value': avg_order_value,
            'customer_repeat_rate': customer_repeat_rate,

            'recent_orders': recent_orders,
            'top_categories': top_categories,
            'top_products': top_products,
        }

        serializer = DashboardOverviewSerializer(data)
        return Response(serializer.data)




# views.py - Updated SalesReportView to use serializer

class SalesReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Set default dates if not provided
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
        
        if not start_date:
            if period == 'daily':
                start_date = end_date - timedelta(days=30)  # Last 30 days
            else:
                start_date = end_date - timedelta(days=365)  # Last 12 months
        else:
            start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
        
        # Filter orders by date range and completed status
        orders = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        ).exclude(status='cancelled')
        
        # Group by period
        data = []
        if period == 'daily':
            sales_data = orders.annotate(
                date=TruncDay('created_at')
            ).values('date').annotate(
                sales=Sum('total_price'),
                count=Count('id'),
                avg_order_value=Avg('total_price')
            ).order_by('date')
            
            for item in sales_data:
                item_dict = {
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'sales': item['sales'] or 0,
                    'count': item['count'] or 0,
                    'avg_order_value': item['avg_order_value'] or 0
                }
                data.append(item_dict)
        else:  # monthly
            sales_data = orders.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                sales=Sum('total_price'),
                count=Count('id'),
                avg_order_value=Avg('total_price')
            ).order_by('month')
            
            for item in sales_data:
                item_dict = {
                    'month': item['month'].strftime('%Y-%m'),
                    'sales': item['sales'] or 0,
                    'count': item['count'] or 0,
                    'avg_order_value': item['avg_order_value'] or 0
                }
                data.append(item_dict)
        
        # Calculate summary statistics
        total_sales = sum(item.get('sales', 0) for item in data) if data else 0
        total_orders = sum(item.get('count', 0) for item in data) if data else 0
        avg_order_value = total_sales / total_orders if total_orders > 0 else 0
        
        # Prepare data for serialization
        report_data = {
            'period': period,
            'start_date': start_date,
            'end_date': end_date,
            'summary': {
                'total_sales': total_sales,
                'total_orders': total_orders,
                'avg_order_value': avg_order_value
            },
            'data': data
        }
        
        serializer = SalesReportSerializer(report_data)
        return Response(serializer.data)
    



# views.py - Add a view for category sales breakdown

class CategorySalesReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Set default dates if not provided
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
        
        if not start_date:
            start_date = end_date - timedelta(days=30)  # Default to last 30 days
        else:
            start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
            
        # Get all completed orders in the date range
        orders = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            status__in=['delivered', 'shipped']  # Only count fulfilled orders
        )
        
        # Get all order items from these orders
        order_items = OrderItem.objects.filter(order__in=orders)
        
        # Group by category
        category_sales = {}
        
        for item in order_items:
            try:
                product = item.product_variant.product
                category = product.category
                
                if category.id not in category_sales:
                    category_sales[category.id] = {
                        'category_id': str(category.id),
                        'category_name': category.name,
                        'total_sales': 0,
                        'total_items': 0,
                        'products_sold': set()  # Use set to count unique products
                    }
                
                # Add sales amount (price * quantity)
                item_total = item.price * item.quantity
                category_sales[category.id]['total_sales'] += item_total
                category_sales[category.id]['total_items'] += item.quantity
                category_sales[category.id]['products_sold'].add(str(product.id))
                
            except (AttributeError, Product.DoesNotExist, Category.DoesNotExist):
                # Skip items with missing relationships
                continue
        
        # Convert to list and format for response
        result = []
        for cat_id, data in category_sales.items():
            result.append({
                'category_id': data['category_id'],
                'category_name': data['category_name'],
                'total_sales': data['total_sales'],
                'total_items': data['total_items'],
                'unique_products': len(data['products_sold'])
            })
        
        # Sort by total sales (highest first)
        result.sort(key=lambda x: x['total_sales'], reverse=True)
        
        # Calculate percentages
        total_sales = sum(item['total_sales'] for item in result)
        if total_sales > 0:
            for item in result:
                item['percentage'] = (item['total_sales'] / total_sales) * 100
        else:
            for item in result:
                item['percentage'] = 0
        
        return Response({
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'total_sales': total_sales,
            'categories': result
        })
    


# Modified export view that doesn't require WeasyPrint
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from io import BytesIO

class ExportSalesReportView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get parameters from request
        period = request.query_params.get('period', 'monthly')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        export_format = request.query_params.get('format', 'csv').lower()
        
        # Set default dates (same as before)
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = timezone.datetime.strptime(end_date, '%Y-%m-%d').date()
        
        if not start_date:
            if period == 'daily':
                start_date = end_date - timedelta(days=30)
            else:
                start_date = end_date - timedelta(days=365)
        else:
            start_date = timezone.datetime.strptime(start_date, '%Y-%m-%d').date()
        
        # Get sales data (same as before)
        orders = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        ).exclude(status='cancelled')
        
        # Group by period (same as before)
        data = []
        if period == 'daily':
            sales_data = orders.annotate(
                date=TruncDay('created_at')
            ).values('date').annotate(
                sales=Sum('total_price'),
                count=Count('id'),
                avg_order_value=Avg('total_price')
            ).order_by('date')
            
            for item in sales_data:
                data.append({
                    'date': item['date'].strftime('%Y-%m-%d'),
                    'sales': float(item['sales']) if item['sales'] else 0,
                    'orders': item['count'],
                    'avg_order_value': float(item['avg_order_value']) if item['avg_order_value'] else 0
                })
        else:  # monthly
            sales_data = orders.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                sales=Sum('total_price'),
                count=Count('id'),
                avg_order_value=Avg('total_price')
            ).order_by('month')
            
            for item in sales_data:
                data.append({
                    'month': item['month'].strftime('%Y-%m'),
                    'sales': float(item['sales']) if item['sales'] else 0,
                    'orders': item['count'],
                    'avg_order_value': float(item['avg_order_value']) if item['avg_order_value'] else 0
                })
        
        # Calculate summary statistics
        total_sales = sum(item.get('sales', 0) for item in data) if data else 0
        total_orders = sum(item.get('orders', 0) for item in data) if data else 0
        avg_order_value = total_sales / total_orders if total_orders > 0 else 0
        
        summary = {
            'total_sales': total_sales,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value
        }
        
        # Generate export in requested format
        if export_format == 'csv':
            return self.export_csv(data, period, start_date, end_date, summary)
        elif export_format == 'xlsx':
            return self.export_excel(data, period, start_date, end_date, summary)
        elif export_format == 'pdf':
            return self.export_pdf_reportlab(data, period, start_date, end_date, summary)
        else:
            return Response(
                {'error': 'Unsupported export format'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # CSV and Excel methods remain the same
    
    def export_pdf_reportlab(self, data, period, start_date, end_date, summary):
        # Create a file-like buffer to receive PDF data
        buffer = BytesIO()
        
        # Create the PDF object, using the buffer as its "file"
        doc = SimpleDocTemplate(buffer, pagesize=letter, title=f"Sales Report - {period}")
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        subtitle_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Add title
        elements.append(Paragraph(f"Sales Report - {period.capitalize()}", title_style))
        elements.append(Spacer(1, 12))
        
        # Add date range
        elements.append(Paragraph(f"Period: {start_date} to {end_date}", subtitle_style))
        elements.append(Spacer(1, 12))
        
        # Create table data
        table_data = []
        
        # Add header row
        if period == 'daily':
            table_data.append(['Date', 'Orders', 'Sales ($)', 'Avg Order ($)'])
        else:
            table_data.append(['Month', 'Orders', 'Sales ($)', 'Avg Order ($)'])
        
        # Add data rows
        for item in data:
            if period == 'daily':
                table_data.append([
                    item.get('date', ''),
                    str(item.get('orders', 0)),
                    f"{item.get('sales', 0):.2f}",
                    f"{item.get('avg_order_value', 0):.2f}"
                ])
            else:
                table_data.append([
                    item.get('month', ''),
                    str(item.get('orders', 0)),
                    f"{item.get('sales', 0):.2f}",
                    f"{item.get('avg_order_value', 0):.2f}"
                ])
        
        # Create table
        table = Table(table_data)
        
        # Add style to table
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.blue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])
        table.setStyle(style)
        
        # Add table to elements
        elements.append(table)
        elements.append(Spacer(1, 20))
        
        # Add summary
        elements.append(Paragraph("Summary", subtitle_style))
        elements.append(Spacer(1, 12))
        
        summary_data = [
            ['Total Sales', f"${summary.get('total_sales', 0):.2f}"],
            ['Total Orders', str(summary.get('total_orders', 0))],
            ['Average Order Value', f"${summary.get('avg_order_value', 0):.2f}"]
        ]
        
        summary_table = Table(summary_data)
        summary_style = TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.black),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])
        summary_table.setStyle(summary_style)
        elements.append(summary_table)
        
        # Footer
        elements.append(Spacer(1, 30))
        elements.append(Paragraph("This report is confidential and intended for internal use only.", styles['Italic']))
        elements.append(Paragraph(f"Generated on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Italic']))
        
        # Build the PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        # Create the HTTP response
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="sales_report_{period}_{start_date}_{end_date}.pdf"'
        
        return response
    

# # views.py
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_coupon_code(request):  # Completely new function name
    
    serializer = CouponValidateSerializer(data=request.data)
    if serializer.is_valid():
        coupon = serializer.validated_data['coupon']
        # Check if user has already used this coupon
        if CouponUsage.objects.filter(user=request.user, coupon=coupon).exists():
            return Response({'error': 'You have already used this coupon'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount amount
        cart_total = serializer.validated_data['cart_total']
        if coupon.discount_type == 'percent':
            discount = cart_total * (coupon.discount_value / 100)
            if coupon.max_discount and discount > coupon.max_discount:
                discount = coupon.max_discount
        else:  # flat discount
            discount = coupon.discount_value
        
        return Response({
            'valid': True,
            'coupon': CouponSerializer(coupon).data,
            'discount': discount,
            'final_total': cart_total - discount
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# views.py - Add a new view for homepage data

class HomepageDataView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get active promotional banners
        hero_banner = PromotionalBanner.objects.filter(
            is_active=True, 
            position='hero'
        ).first()
        
        middle_banner = PromotionalBanner.objects.filter(
            is_active=True, 
            position='middle'
        ).first()
        
        # Get categories with images
        categories = Category.objects.filter(
            is_active=True
        ).order_by('display_order')[:6]
        
        # Get featured products
        featured_products = Product.objects.filter(
            is_active=True,
            is_featured=True
        ).prefetch_related(
            'variants', 'images', 'category'
        )[:4]
        
        # Get new arrivals (based on created_at)
        new_arrivals = Product.objects.filter(
            is_active=True
        ).order_by(
            '-created_at'
        ).prefetch_related(
            'variants', 'images', 'category'
        )[:8]
        
        # Get products with discounts
        discounted_products = Product.objects.filter(
            is_active=True,
            variants__is_discount_active=True
        ).distinct().prefetch_related(
            'variants', 'images', 'category'
        )[:4]
        
        # Serialize the data
        context = {'request': request}
        hero_banner_data = PromotionalBannerSerializer(hero_banner, context=context).data if hero_banner else None
        middle_banner_data = PromotionalBannerSerializer(middle_banner, context=context).data if middle_banner else None
        categories_data = CategorySerializer(categories, many=True, context=context).data
        featured_products_data = ProductListSerializer(featured_products, many=True, context=context).data
        new_arrivals_data = ProductListSerializer(new_arrivals, many=True, context=context).data
        discounted_products_data = ProductListSerializer(discounted_products, many=True, context=context).data
        
        # Combine and return
        return Response({
            'hero_banner': hero_banner_data,
            'middle_banner': middle_banner_data,
            'categories': categories_data,
            'featured_products': featured_products_data,
            'new_arrivals': new_arrivals_data,
            'discounted_products': discounted_products_data
        })


# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from decimal import Decimal
import logging
import uuid

from .models import Order, OrderItem, Transaction, Cart, Coupon, CouponUsage, Notification
from .serializers import (
    OrderSerializer, CODOrderCreateSerializer, 
    OnlinePaymentInitiateSerializer, TransactionSerializer
)
from .phonepe_payments import initiate_payment, check_order_status, verify_phonepe_webhook

logger = logging.getLogger(__name__)


# ============================================
# EMAIL HELPER FUNCTIONS (Shared)
# ============================================

def format_address(address):
    """Format address object into string"""
    if not address:
        return "N/A"
    return f"{address.address_line1}, {address.address_line2}, {address.city}, {address.state} {address.zip_code}"


def generate_customer_email_html(context):
    """Generate customer order confirmation email HTML"""
    items_html = ""
    for item in context['order_items']:
        items_html += f"""
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['product_name']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['size']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['quantity']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">₹{item['price']:.2f}</td>
        </tr>
        """

    discount_html = ""
    if context['discount_amount'] > 0:
        discount_html = f"""
        <tr>
            <td colspan="3" style="text-align: right; padding: 15px; color: #4CAF50;">Discount:</td>
            <td style="padding: 15px; color: #4CAF50;">-₹{context['discount_amount']:.2f}</td>
        </tr>
        """

    # Header color based on payment method
    header_color = '#4CAF50' if 'Online' in context['payment_method'] else '#502380'
    header_text = '✓ Payment Confirmed!' if 'Online' in context['payment_method'] else 'Order Confirmation'

    return f"""
    <html>
    <head>
        <style>
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333333;
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
                background-color: {header_color};
                color: white;
                padding: 30px;
                border-radius: 8px;
            }}
            .header h2 {{
                font-size: 24px;
                margin-bottom: 10px;
            }}
            .content {{
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .order-details {{
                margin: 20px 0;
                padding: 20px;
                background-color: #f8f9fa;
                border-radius: 6px;
                border-left: 4px solid {header_color};
            }}
            .table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            .table th {{
                background-color: #f8f9fa;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }}
            .total {{
                background-color: #e8f5e9;
                padding: 20px;
                margin-top: 20px;
                border-radius: 6px;
                text-align: right;
            }}
            .total h3 {{
                color: #2e7d32;
                margin: 0;
            }}
            .note {{
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin-top: 20px;
                border-radius: 6px;
            }}
            .footer {{
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #666666;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h2>{header_text}</h2>
                <p>{'Your payment was successful' if 'Online' in context['payment_method'] else 'Thank you for your order!'}</p>
                <P>{'Our team will contact you shortly regarding order confirmation and payment'}</p>
            </div>
            
            <div class="content">
                <div class="order-details">
                    <p>Dear {context['user_name']},</p>
                    <p>Your order #{context['order_id']} has been {'successfully placed and paid' if 'Online' in context['payment_method'] else 'successfully placed'} on {context['order_date']}.</p>
                    <p><strong>Payment Method:</strong> {context['payment_method']}</p>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                        <tr>
                            <td colspan="3" style="text-align: right; padding: 15px;">Subtotal:</td>
                            <td style="padding: 15px;">₹{context['total_price']:.2f}</td>
                        </tr>
                        {discount_html}
                    </tbody>
                </table>
                
                <div class="total">
                    <h3>{'Amount Paid' if 'Online' in context['payment_method'] else 'Total Amount'}: ₹{context['final_price']:.2f}</h3>
                </div>
                
                {'<div class="note"><p>Your order is now confirmed and will be processed shortly. You can track your order status in your account.</p></div>' if 'Online' in context['payment_method'] else ''}

                <div class="footer">
                    <p>Thank you for shopping with us!</p>
                    <p>Best regards,<br>Devrup Organics</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def generate_admin_email_html(context):
    """Generate admin order notification email HTML"""
    items_html = ""
    for item in context['order_items']:
        items_html += f"""
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['product_name']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['size']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">{item['quantity']}</td>
            <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">₹{item['price']:.2f}</td>
        </tr>
        """

    coupon_info = ""
    if context.get('coupon_code'):
        coupon_info = f"""
        <div class="coupon-info">
            <h3>Coupon Applied</h3>
            <p>Code: {context['coupon_code']}<br>
            Discount: ₹{context['discount_amount']:.2f}</p>
        </div>
        """

    payment_badge = ""
    if 'Online' in context['payment_method']:
        payment_badge = '<span class="payment-badge">✓ PAYMENT CONFIRMED</span>'

    return f"""
    <html>
    <head>
        <style>
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                font-family: 'Arial', sans-serif;
            }}
            .header {{
                text-align: center;
                background-color: #2c3e50;
                color: white;
                padding: 30px;
                border-radius: 8px;
            }}
            .payment-badge {{
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                margin: 10px 0;
            }}
            .content {{
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }}
            .order-info {{
                background-color: #f8f9fa;
                padding: 20px;
                margin: 15px 0;
                border-radius: 6px;
            }}
            .table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            .table th {{
                background-color: #f8f9fa;
                padding: 15px;
                text-align: left;
            }}
            .coupon-info {{
                background-color: #e8f5e9;
                border-left: 4px solid #4CAF50;
                padding: 15px;
                margin: 15px 0;
                border-radius: 6px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h2>New Order {'Received' if 'COD' in context['payment_method'] else 'Notification'}</h2>
                {payment_badge}
                <p>Order #{context['order_id']}</p>
            </div>

            <div class="content">
                <div class="order-info">
                    <h3>Customer Information</h3>
                    <p>Name: {context['customer_name']}<br>
                    Email: {context['customer_email']}<br>
                    Phone: {context['customer_phone']}</p>
                </div>

                <div class="order-info">
                    <h3>Shipping Address</h3>
                    <p>{context['shipping_address']}</p>
                </div>

                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>

                {coupon_info}

                <div class="order-info">
                    <h3>Order Summary</h3>
                    <p>Payment Method: {context['payment_method']}<br>
                    Order Date: {context['order_date']}<br>
                    Subtotal: ₹{context['total_price']:.2f}<br>
                    Discount: ₹{context['discount_amount']:.2f}<br>
                    <strong>Amount {'Received' if 'Online' in context['payment_method'] else 'Due'}: ₹{context['final_price']:.2f}</strong></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """


def send_order_confirmation_emails(order, order_items):
    """Send order confirmation emails to customer and admin"""
    # Customer Email
    customer_context = {
        'user_name': order.user.get_full_name() or order.user.email,
        'order_id': str(order.id),
        'order_items': order_items,
        'total_price': order.total_price + order.discount_amount,
        'discount_amount': order.discount_amount,
        'final_price': order.total_price,
        'order_date': order.created_at.strftime('%B %d, %Y'),
        'payment_method': 'Cash on Delivery' if order.payment_method == 'cash_on_delivery' else 'Online Payment (PhonePe)'
    }
    
    customer_html = generate_customer_email_html(customer_context)
    
    send_mail(
        subject=f"{'Payment Confirmed' if order.payment_method == 'online' else 'Order Confirmation'} - Order #{order.id}",
        message=f"Your {'payment for ' if order.payment_method == 'online' else ''}order #{order.id} has been {'successfully processed' if order.payment_method == 'online' else 'confirmed'}.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[order.user.email],
        html_message=customer_html,
        fail_silently=False
    )
    
    # Admin Email
    admin_context = {
        'order_id': str(order.id),
        'order_items': order_items,
        'order_date': order.created_at.strftime('%B %d, %Y'),
        'customer_name': order.address.name,
        'customer_email': order.user.email,
        'customer_phone': order.address.phone,
        'shipping_address': format_address(order.address),
        'total_price': order.total_price + order.discount_amount,
        'discount_amount': order.discount_amount,
        'final_price': order.total_price,
        'coupon_code': order.coupon.code if order.coupon else None,
        'payment_method': 'Cash on Delivery' if order.payment_method == 'cash_on_delivery' else 'Online Payment (PhonePe)'
    }
    
    admin_html = generate_admin_email_html(admin_context)
    
    send_mail(
        subject=f"New {'Online' if order.payment_method == 'online' else 'COD'} Order - Order #{order.id}",
        message=f"New {'online' if order.payment_method == 'online' else 'COD'} order #{order.id} received.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[settings.ADMIN_EMAIL],
        html_message=admin_html,
        fail_silently=False
    )
    
    logger.info(f"Order confirmation emails sent for order {order.id}")


# ============================================
# CASH ON DELIVERY ORDER VIEW
# ============================================

class CashOnDeliveryOrderView(APIView):
    """Handle Cash on Delivery orders"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CODOrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # --- Step 1: Validate Cart ---
                try:
                    cart = Cart.objects.get(user=request.user)
                except Cart.DoesNotExist:
                    return Response({"error": "Cart not found"}, status=status.HTTP_400_BAD_REQUEST)

                cart_items = cart.items.all()
                if not cart_items.exists():
                    return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

                # --- Step 2: Calculate Prices with Product Discounts ---
                subtotal = Decimal('0.00')  # Original price without any discounts
                product_discount_total = Decimal('0.00')  # Product-level discounts
                
                for item in cart_items:
                    variant = item.product_variant
                    original_price = variant.price * item.quantity
                    subtotal += original_price
                    
                    # Calculate product discount if active
                    if variant.is_discount_active and variant.discount_price:
                        discounted_price = variant.discount_price * item.quantity
                        product_discount_total += (original_price - discounted_price)
                
                # Total after product discounts (before coupon)
                total_after_product_discount = subtotal - product_discount_total
                
                # --- Step 3: Validate Product Discount from Frontend ---
                claimed_product_discount = serializer.validated_data.get('product_discount', Decimal('0.00'))
                
                # Verify frontend calculation matches backend
                if abs(claimed_product_discount - product_discount_total) > Decimal('0.01'):
                    return Response(
                        {
                            "error": "Product discount mismatch",
                            "expected": str(product_discount_total),
                            "received": str(claimed_product_discount)
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # --- Step 4: Validate Coupon Discount ---
                coupon = serializer.validated_data.get('coupon_id')
                claimed_coupon_discount = serializer.validated_data.get('discount_value', Decimal('0.00'))
                coupon_discount = Decimal('0.00')
                
                if coupon:
                    # Coupon is applied on the total AFTER product discounts
                    if not coupon.is_valid(user=request.user, cart_total=total_after_product_discount):
                        return Response(
                            {"error": "Coupon is no longer valid"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    coupon_discount = coupon.calculate_discount(total_after_product_discount)
                    
                    # Verify coupon discount matches
                    if abs(coupon_discount - claimed_coupon_discount) > Decimal('0.01'):
                        return Response(
                            {
                                "error": "Coupon discount mismatch",
                                "expected": str(coupon_discount),
                                "received": str(claimed_coupon_discount)
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Check usage limit
                    usage_count = CouponUsage.objects.filter(
                        user=request.user,
                        coupon=coupon
                    ).count()
                    if usage_count >= coupon.user_limit:
                        return Response(
                            {'error': 'Coupon usage limit reached'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # --- Step 5: Calculate Final Price ---
                # Subtotal - Product Discount - Coupon Discount = Final Price
                final_price = subtotal - product_discount_total - coupon_discount
                total_discount = product_discount_total + coupon_discount
                # Ensure final price is not negative
                if final_price < 0:
                    final_price = Decimal('0.00')
                
                # --- Step 6: Create Order ---
                order = Order.objects.create(
                    user=request.user,
                    address=serializer.validated_data['address_id'],
                    total_price=final_price,
                    payment_method='cash_on_delivery',
                    status='pending',
                    coupon=coupon,
                    discount_amount=total_discount  # Total discount (product + coupon)
                )
                
                # --- Step 7: Create Order Items ---
                order_items = []
                for cart_item in cart_items:
                    variant = cart_item.product_variant
                    
                    # Store the actual price used (discounted if applicable)
                    item_price = variant.price * cart_item.quantity
                    
                    OrderItem.objects.create(
                        order=order,
                        product_variant=cart_item.product_variant,
                        quantity=cart_item.quantity,
                        price=item_price  # Store the actual price paid per unit
                    )
                    order_items.append({
                        'product_name': cart_item.product_variant.product.name,
                        'quantity': cart_item.quantity,
                        'size': cart_item.product_variant.size,
                        'price': item_price * cart_item.quantity
                    })
                
                # --- Step 8: Handle Coupon Usage ---
                if coupon:
                    CouponUsage.objects.create(
                        user=request.user,
                        coupon=coupon,
                        order=order
                    )
                    coupon.usage_count += 1
                    coupon.save()
                
                # --- Step 9: Clear Cart ---
                cart_items.delete()
                
                # --- Step 10: Send Emails ---
                try:
                    send_order_confirmation_emails(order, order_items)
                except Exception as e:
                    logger.error(f"Failed to send COD emails for order {order.id}: {str(e)}")
                
                # --- Step 11: Create Notification ---
                Notification.objects.create(
                    user=request.user,
                    title="Order Placed Successfully",
                    message=f"Your COD order #{order.id} has been placed successfully."
                )
                
                # --- Step 12: Return Response with Breakdown ---
                response_data = OrderSerializer(order, context={'request': request}).data
                response_data['price_breakdown'] = {
                    'subtotal': str(subtotal),
                    'product_discount': str(product_discount_total),
                    'coupon_discount': str(coupon_discount),
                    'total_discount': str(total_discount),
                    'final_price': str(final_price)
                }
                
                return Response(
                    response_data,
                    status=status.HTTP_201_CREATED
                )
                
        except Exception as e:
            logger.error(f"COD order creation failed: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Order creation failed. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ============================================
# ONLINE PAYMENT VIEW
# ============================================

class OnlinePaymentView(APIView):
    """Handle online payment flow via PhonePe"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = OnlinePaymentInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # --- Step 1: Validate Cart ---
                cart_items = Cart.objects.filter(user=request.user)
                if not cart_items.exists():
                    return Response(
                        {"error": "Cart is empty"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # --- Step 2: Calculate Prices ---
                # total_price = sum(item.total_price for item in cart_items)
                try:
                    cart = Cart.objects.get(user=request.user)
                except Cart.DoesNotExist:
                    return Response({"error": "Cart not found"}, status=status.HTTP_400_BAD_REQUEST)

                cart_items = cart.items.all()
                if not cart_items.exists():
                    return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

                # Step 2: Calculate total price
                total_price = sum(
                    (item.product_variant.discount_price or item.product_variant.price) * item.quantity
                    for item in cart_items
                )

                coupon = serializer.validated_data.get('coupon_id')
                claimed_discount = serializer.validated_data.get('discount_value', Decimal('0.00'))
                
                # --- Step 3: Validate Coupon ---
                if coupon:
                    if not coupon.is_valid(user=request.user, cart_total=total_price):
                        return Response(
                            {"error": "Coupon is no longer valid"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    actual_discount = coupon.calculate_discount(total_price)
                    if actual_discount != claimed_discount:
                        return Response(
                            {"error": "Invalid discount amount"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    usage_count = CouponUsage.objects.filter(
                        user=request.user,
                        coupon=coupon
                    ).count()
                    if usage_count >= coupon.user_limit:
                        return Response(
                            {'error': 'Coupon usage limit reached'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                final_price = total_price - claimed_discount
                
                # --- Step 4: Create Order (status='pending') ---
                order = Order.objects.create(
                    user=request.user,
                    address=serializer.validated_data['address_id'],
                    total_price=final_price,
                    payment_method='online',
                    status='pending',
                    coupon=coupon,
                    discount_amount=claimed_discount
                )
                
                # --- Step 5: Create Order Items ---
                for cart_item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product_variant=cart_item.product_variant,
                        quantity=cart_item.quantity,
                        price=cart_item.product_variant.price
                    )
                
                # --- Step 6: Generate Merchant Order ID ---
                merchant_order_id = f"ORDER_{order.id}_{uuid.uuid4().hex[:8].upper()}"
                
                # --- Step 7: Initiate PhonePe Payment ---
                payment_result = initiate_payment(
                    amount_in_paise=int(final_price * 100),
                    merchant_order_id=merchant_order_id,
                    redirect_url=f"{settings.FRONTEND_URL}/payment-status/{merchant_order_id}"
                )
                
                if not payment_result['success']:
                    # Rollback: Delete the order if payment initiation fails
                    order.delete()
                    raise Exception(payment_result['error'])
                
                # --- Step 8: Create Transaction Record ---
                Transaction.objects.create(
                    order=order,
                    merchant_order_id=payment_result['merchant_order_id'],
                    phonepe_transaction_id=payment_result.get('pg_txn_id'),
                    amount=final_price,
                    status='PENDING',
                    pg_response_payload=payment_result
                )
                
                logger.info(f"Payment initiated for order {order.id}, merchant_order_id: {merchant_order_id}")
                
                return Response({
                    'success': True,
                    'payment_url': payment_result['redirect_url'],
                    'order_id': str(order.id),
                    'merchant_order_id': merchant_order_id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Payment initiation failed: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Payment initiation failed. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# PHONEPE WEBHOOK HANDLER
# ============================================

@csrf_exempt
@require_http_methods(["POST"])
def phonepe_webhook(request):
    """Handle PhonePe payment webhooks - PRIMARY confirmation mechanism"""
    
    try:
        # --- Step 1: Verify Webhook Signature ---
        is_valid, callback_data = verify_phonepe_webhook(request)
        if not is_valid:
            logger.warning(f"Invalid webhook signature from IP {request.META.get('REMOTE_ADDR', 'Unknown')}")
            return JsonResponse({"error": "Invalid signature"}, status=401)
        
        logger.info(f"Valid webhook received: {callback_data}")
        
        # --- Step 2: Process Webhook ---
        with transaction.atomic():
            # Extract data with fallback for different PhonePe response formats
            merchant_order_id = callback_data.get('merchantTransactionId') or callback_data.get('merchant_order_id')
            phonepe_status = callback_data.get('state') or callback_data.get('status')
            phonepe_txn_id = callback_data.get('transactionId') or callback_data.get('pg_txn_id')
            
            if not merchant_order_id or not phonepe_status:
                logger.error(f"Missing required fields in webhook: {callback_data}")
                return JsonResponse({"error": "Invalid webhook data"}, status=400)
            
            try:
                # Get transaction with lock to prevent race conditions
                txn = Transaction.objects.select_for_update().get(
                    merchant_order_id=merchant_order_id
                )
                order = txn.order
                
                # Skip if already processed successfully
                if txn.status == 'SUCCESS':
                    logger.info(f"Transaction {merchant_order_id} already processed")
                    return JsonResponse({"status": "already_processed"})
                
                # Double-check with PhonePe API for security
                status_result = check_order_status(merchant_order_id)
                if status_result['success']:
                    api_status = status_result['data'].get('state') or status_result['data'].get('status')
                    if api_status and api_status != phonepe_status:
                        logger.warning(f"Status mismatch for {merchant_order_id}: webhook={phonepe_status}, api={api_status}")
                        phonepe_status = api_status  # Trust API over webhook
                
                # Map PhonePe status to Transaction status
                status_mapping = {
                    'COMPLETED': 'SUCCESS',
                    'SUCCESS': 'SUCCESS',
                    'FAILED': 'FAILED',
                    'PENDING': 'PENDING'
                }
                
                new_txn_status = status_mapping.get(phonepe_status, 'PENDING')
                old_status = txn.status
                
                # Update transaction
                txn.status = new_txn_status
                if phonepe_txn_id:
                    txn.phonepe_transaction_id = phonepe_txn_id
                txn.pg_response_payload = callback_data
                txn.payment_response = callback_data
                txn.save()
                
                logger.info(f"Transaction {merchant_order_id}: {old_status} -> {new_txn_status}")
                
                # Process based on status
                if phonepe_status in ['COMPLETED', 'SUCCESS']:
                    # Payment successful
                    order.status = 'processing'
                    order.save()
                    
                    # Clear user's cart
                    Cart.objects.filter(user=order.user).delete()
                    
                    # Create coupon usage record
                    if order.coupon:
                        coupon_usage, created = CouponUsage.objects.get_or_create(
                            user=order.user, 
                            coupon=order.coupon,
                            defaults={'order': order}
                        )
                        if created:
                            order.coupon.usage_count += 1
                            order.coupon.save()
                            logger.info(f"Coupon {order.coupon.code} marked as used")
                    
                    # Create notification
                    Notification.objects.create(
                        user=order.user,
                        title="Payment Successful",
                        message=f"Your payment for order #{order.id} was successful."
                    )
                    
                    # Send confirmation emails
                    try:
                        order_items = []
                        for item in order.items.all():
                            order_items.append({
                                'product_name': item.product_variant.product.name,
                                'quantity': item.quantity,
                                'size': item.product_variant.size,
                                'price': item.price * item.quantity
                            })
                        send_order_confirmation_emails(order, order_items)
                    except Exception as e:
                        logger.error(f"Failed to send payment emails for order {order.id}: {str(e)}")
                    
                    logger.info(f"Payment completed for order {order.id}")
                    
                elif phonepe_status == 'FAILED':
                    order.status = 'cancelled'
                    order.save()
                    
                    # Create notification
                    Notification.objects.create(
                        user=order.user,
                        title="Payment Failed",
                        message=f"Your payment for order #{order.id} failed. Please try again."
                    )
                    
                    logger.info(f"Payment failed for order {order.id}")
                    
                elif phonepe_status == 'PENDING':
                    # Keep order status as pending
                    logger.info(f"Payment still pending for order {order.id}")
                
            except Transaction.DoesNotExist:
                logger.error(f"Transaction not found: {merchant_order_id}")
                return JsonResponse({"error": "Transaction not found"}, status=404)
                
        return JsonResponse({"status": "processed"})
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}", exc_info=True)
        return JsonResponse({"error": "Webhook processing failed"}, status=500)


# ============================================
# PAYMENT STATUS VIEW
# ============================================

class PaymentStatusView(APIView):
    """Frontend endpoint to check payment status (backup mechanism)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        merchant_order_id = request.data.get('merchant_order_id')
        if not merchant_order_id:
            return Response({
                'success': False,
                'error': 'merchant_order_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Get transaction with lock
                txn = Transaction.objects.select_for_update().get(
                    merchant_order_id=merchant_order_id
                )
                order = txn.order
                
                # Verify this order belongs to the requesting user
                if order.user != request.user:
                    return Response({
                        'success': False,
                        'error': 'Unauthorized'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Skip if already finalized
                if txn.status in ['SUCCESS', 'FAILED']:
                    return Response({
                        'success': True,
                        'status': txn.status,
                        'order_status': order.status,
                        'order_id': str(order.id),
                        'message': self._get_status_message(txn.status)
                    })
                
                # Check with PhonePe API
                status_result = check_order_status(merchant_order_id)
                if not status_result['success']:
                    logger.error(f"Failed to check status: {status_result.get('error')}")
                    return Response({
                        'success': False,
                        'error': 'Failed to check payment status'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Update records
                phonepe_status = status_result['data'].get('state') or status_result['data'].get('status')
                
                status_mapping = {
                    'COMPLETED': 'SUCCESS',
                    'SUCCESS': 'SUCCESS',
                    'FAILED': 'FAILED',
                    'PENDING': 'PENDING'
                }
                
                new_status = status_mapping.get(phonepe_status, 'PENDING')
                txn.status = new_status
                txn.pg_response_payload = status_result['data']
                txn.save()
                
                # Process order based on status
                if phonepe_status in ['COMPLETED', 'SUCCESS'] and order.status == 'pending':
                    order.status = 'processing'
                    order.save()
                    
                    # Clear cart
                    Cart.objects.filter(user=order.user).delete()
                    
                    # Handle coupon
                    if order.coupon:
                        coupon_usage, created = CouponUsage.objects.get_or_create(
                            user=order.user,
                            coupon=order.coupon,
                            defaults={'order': order}
                        )
                        if created:
                            order.coupon.usage_count += 1
                            order.coupon.save()
                    
                    # Create notification
                    Notification.objects.create(
                        user=order.user,
                        title="Payment Successful",
                        message=f"Your payment for order #{order.id} was successful."
                    )
                    
                    # Send emails
                    try:
                        order_items = []
                        for item in order.items.all():
                            order_items.append({
                                'product_name': item.product_variant.product.name,
                                'quantity': item.quantity,
                                'size': item.product_variant.size,
                                'price': item.price * item.quantity
                            })
                        send_order_confirmation_emails(order, order_items)
                    except Exception as e:
                        logger.error(f"Failed to send emails for order {order.id}: {str(e)}")
                    
                elif phonepe_status == 'FAILED':
                    order.status = 'cancelled'
                    order.save()
                    
                    # Create notification
                    Notification.objects.create(
                        user=order.user,
                        title="Payment Failed",
                        message=f"Your payment for order #{order.id} failed. Please try again."
                    )
                
                return Response({
                    'success': True,
                    'status': txn.status,
                    'order_status': order.status,
                    'order_id': str(order.id),
                    'message': self._get_status_message(txn.status)
                })
                
        except Transaction.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Transaction not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Payment status check failed: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'error': 'Status check failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_status_message(self, status):
        """Get user-friendly status message"""
        messages = {
            'SUCCESS': 'Payment confirmed successfully',
            'FAILED': 'Payment failed',
            'PENDING': 'Payment is still being processed'
        }
        return messages.get(status, 'Unknown status')


# ============================================
# ORDER VIEWSET (Read-Only + Status Updates)
# ============================================

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for listing and retrieving orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'is_admin', False):
            return Order.objects.select_related(
                'user', 'address', 'coupon'
            ).prefetch_related(
                'items__product_variant__product__images',
                'transactions'
            ).all()
        return Order.objects.select_related(
            'user', 'address', 'coupon'
        ).prefetch_related(
            'items__product_variant__product__images',
            'transactions'
        ).filter(user=user)

    def create(self, request, *args, **kwargs):
        """Disable direct order creation through this endpoint"""
        return Response({
            'error': 'Please use /checkout/cod/ or /checkout/online/ endpoints'
        }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Disable direct updates - use update_status action instead"""
        return Response({
            'error': 'Please use the update_status endpoint'
        }, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        """Disable direct partial updates"""
        return Response({
            'error': 'Please use the update_status endpoint'
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Disable order deletion"""
        return Response({
            'error': 'Orders cannot be deleted'
        }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        """Retrieve single order details"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    # @action(detail=True, methods=['post'])
    # def update_status(self, request, pk=None):
    #     """Update order status (admin only)"""
    #     order = self.get_object()
    #     new_status = request.data.get('status')
        
    #     if not new_status or new_status not in dict(Order.STATUS_CHOICES).keys():
    #         return Response(
    #             {'error': 'Invalid status'},
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
        
    #     # Only admin can update status
    #     if not (request.user.is_staff or getattr(request.user, 'is_admin', False)):
    #         return Response(
    #             {'error': 'Permission denied'},
    #             status=status.HTTP_403_FORBIDDEN
    #         )
        
    #     old_status = order.status
    #     order.status = new_status
    #     order.save()
        
    #     # Create notification
    #     Notification.objects.create(
    #         user=order.user,
    #         title="Order Status Updated",
    #         message=f"Your order #{order.id} status has been updated to {new_status}."
    #     )
        
    #     # Send status update email
    #     try:
    #         self._send_status_update_email(order, old_status, new_status)
    #     except Exception as e:
    #         logger.error(f"Failed to send status update email for order {order.id}: {str(e)}")
        
    #     return Response(OrderSerializer(order, context={'request': request}).data)


    @action(detail=True, methods=['post'], url_path='update_status')
    @transaction.atomic
    def update_status(self, request, pk=None):
        """
        Update order status with optional shipping details for 'shipped' status.
        
        For 'shipped' status, requires:
        - delivery_partner (string)
        - tracking_number (string)
        - expected_delivery_date (YYYY-MM-DD format)
        - tracking_url (optional URL)
        """
        order = self.get_object()
        new_status = request.data.get('status')
        
        # Debug logging
        
        # Validate status
        if not new_status:
            return Response(
                {'error': 'Status is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get valid status choices
        valid_statuses = dict(Order.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {
                    'error': 'Invalid status',
                    'valid_statuses': list(valid_statuses)
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only admin can update status
        if not (request.user.is_staff or getattr(request.user, 'is_admin', False)):
            return Response(
                {'error': 'Permission denied. Only administrators can update order status.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Store old status for email notification
        old_status = order.status
        
        # Handle shipping details for 'shipped' status
        if new_status == 'shipped':
            # Extract shipping details from request
            delivery_partner = request.data.get('delivery_partner', '').strip()
            tracking_number = request.data.get('tracking_number', '').strip()
            tracking_url = request.data.get('tracking_url', '').strip()
            expected_delivery_date_str = request.data.get('expected_delivery_date')
            
            
            # Validate required fields
            errors = {}
            
            if not delivery_partner:
                errors['delivery_partner'] = 'Delivery partner is required when marking order as shipped'
            
            if not tracking_number:
                errors['tracking_number'] = 'Tracking number is required when marking order as shipped'
            
            if not expected_delivery_date_str:
                errors['expected_delivery_date'] = 'Expected delivery date is required when marking order as shipped'
            
            # Validate and parse expected delivery date
            expected_delivery_date = None
            if expected_delivery_date_str:
                try:
                    # Try parsing with Django's dateparse utility
                    expected_delivery_date = parse_date(expected_delivery_date_str)
                    
                    if not expected_delivery_date:
                        # If parse_date fails, try strptime
                        expected_delivery_date = datetime.strptime(
                            expected_delivery_date_str, 
                            '%Y-%m-%d'
                        ).date()
                    
                    # Validate that delivery date is not in the past
                    if expected_delivery_date < timezone.now().date():
                        errors['expected_delivery_date'] = 'Expected delivery date cannot be in the past'
                        
                except (ValueError, TypeError) as e:
                    errors['expected_delivery_date'] = 'Invalid date format. Please use YYYY-MM-DD format'
            
            # Validate tracking URL if provided
            if tracking_url:
                if not (tracking_url.startswith('http://') or tracking_url.startswith('https://')):
                    errors['tracking_url'] = 'Tracking URL must be a valid URL starting with http:// or https://'
            
            # Debug: Print validation errors
            
            # Return validation errors if any
            if errors:
                return Response(
                    {
                        'error': 'Validation failed',
                        'details': errors,
                        'required_fields': ['delivery_partner', 'tracking_number', 'expected_delivery_date']
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update order with shipping details
            order.delivery_partner = delivery_partner
            order.tracking_number = tracking_number
            order.tracking_url = tracking_url if tracking_url else None
            order.expected_delivery_date = expected_delivery_date
            order.status = new_status
            order.save()
            
            
            # Create detailed notification with tracking information
            notification_message = (
                f"Your order #{order.id} has been shipped! "
                f"Tracking number: {tracking_number}. "
            )
            
            if expected_delivery_date:
                notification_message += f"Expected delivery: {expected_delivery_date.strftime('%B %d, %Y')}. "
            
            if tracking_url:
                notification_message += f"Track your order at: {tracking_url}"
            
            Notification.objects.create(
                user=order.user,
                title="Order Shipped",
                message=notification_message
            )
            
        else:
            # For non-shipped statuses, simple status update
            order.status = new_status
            order.save()
            
            
            # Create standard notification
            status_display = new_status.replace('_', ' ').title()
            Notification.objects.create(
                user=order.user,
                title="Order Status Updated",
                message=f"Your order #{order.id} status has been updated to {status_display}."
            )
        
        # Send status update email
        try:
            self._send_status_update_email(order, old_status, new_status)
        except Exception as e:
            logger.error(f"Failed to send status update email for order {order.id}: {str(e)}")
        
        # Return updated order
        return Response(
            OrderSerializer(order, context={'request': request}).data, 
            status=status.HTTP_200_OK
        )


    def _send_status_update_email(self, order, old_status, new_status):
        """Send order status update email"""
        status_colors = {
            'pending': '#ffc107',
            'processing': '#2196F3',
            'shipped': '#9C27B0',
            'delivered': '#4CAF50',
            'cancelled': '#f44336',
        }
        
        status_messages = {
            'pending': 'Your order is pending confirmation.',
            'processing': 'We are preparing your order for shipment.',
            'shipped': 'Your order has been shipped and is on the way!',
            'delivered': 'Your order has been delivered successfully.',
            'cancelled': 'Your order has been cancelled.',
        }
        
        status_color = status_colors.get(new_status, '#502380')
        status_message = status_messages.get(new_status, 'Your order status has been updated.')
        
        html_message = f"""
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }}
                .email-container {{
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: white;
                    padding: 0;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    overflow: hidden;
                }}
                .header {{
                    background-color: #502380;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h2 {{
                    margin: 0;
                    font-size: 24px;
                }}
                .content {{
                    padding: 30px;
                }}
                .status-container {{
                    background-color: #f8f9fa;
                    padding: 25px;
                    margin: 20px 0;
                    border-radius: 8px;
                    text-align: center;
                    border: 2px solid {status_color};
                }}
                .status-badge {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: {status_color};
                    color: white;
                    border-radius: 25px;
                    font-size: 18px;
                    font-weight: 600;
                    margin: 10px 0;
                    text-transform: uppercase;
                }}
                .order-info {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    margin: 15px 0;
                    border-radius: 6px;
                    border-left: 4px solid #502380;
                }}
                .order-info h3 {{
                    color: #502380;
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 16px;
                }}
                .order-info p {{
                    margin: 5px 0;
                    color: #333;
                }}
                .timeline {{
                    margin: 20px 0;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                }}
                .timeline-item {{
                    padding: 10px 0;
                    color: #666;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #e0e0e0;
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>Order Status Updated</h2>
                    <p style="margin: 10px 0 0 0;">Order #{order.id}</p>
                </div>
                
                <div class="content">
                    <div class="status-container">
                        <p style="margin: 0 0 10px 0; color: #666;">Your order status has been updated to:</p>
                        <div class="status-badge">{new_status}</div>
                        <p style="margin: 15px 0 0 0; color: #333; font-size: 16px;">{status_message}</p>
                    </div>
                    
                    <div class="order-info">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> #{order.id}</p>
                        <p><strong>Order Date:</strong> {order.created_at.strftime('%B %d, %Y')}</p>
                        <p><strong>Total Amount:</strong> ₹{order.total_price:.2f}</p>
                        <p><strong>Payment Method:</strong> {order.get_payment_method_display()}</p>
                    </div>
                    
                    <div class="timeline">
                        <h3 style="color: #502380; margin-top: 0;">Status History</h3>
                        <div class="timeline-item">
                            <strong>Previous Status:</strong> {old_status}
                        </div>
                        <div class="timeline-item">
                            <strong>Current Status:</strong> {new_status}
                        </div>
                        <div class="timeline-item">
                            <strong>Updated:</strong> {order.updated_at.strftime('%B %d, %Y at %I:%M %p')}
                        </div>
                    </div>
                    
                    <p style="color: #666; margin-top: 20px;">You can track your order anytime by logging into your account.</p>
                </div>
                
                <div class="footer">
                    <p style="margin: 0 0 10px 0;">Thank you for shopping with us!</p>
                    <p style="margin: 0 0 10px 0;"><strong>Devrup Organics</strong></p>
                    <p style="margin: 0; font-size: 12px;">© 2025 Devrup Organics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        send_mail(
            subject=f"Order Status Update - Order #{order.id}",
            message=f"Your order #{order.id} status has been updated to {new_status}.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[order.user.email],
            fail_silently=False,
            html_message=html_message
        )
        
        logger.info(f"Status update email sent for order {order.id}: {old_status} -> {new_status}")