from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import (
    User, Address, Category, Brand, Product, ProductVariant, ProductImage,
    ProductAttribute, Cart, CartItem, Wishlist, Coupon, CouponUsage, Order,
    OrderItem, Review, Notification, PromotionalBanner
)
import uuid
from django.db import transaction

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import User, Cart


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 
                  'is_admin', 'is_vendor', 'is_customer', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'is_active']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        min_length=8
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True
    )
    phone_number = serializers.CharField(required=False, allow_blank=True)
    address_line1 = serializers.CharField(write_only=True, max_length=120)
    zip_code = serializers.CharField(write_only=True, max_length=6)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone_number',
            'password', 'password_confirm', 'is_vendor', 'is_customer',
            'address_line1','zip_code'
        ]

    def validate(self, attrs):
        # Password match check
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })

        # Normalize email
        attrs['email'] = attrs['email'].lower()

        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({
                "email": "An account with this email already exists."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        address_line1 = validated_data.pop('address_line1')
        zip_code = validated_data.pop('zip_code')

        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            Address.objects.create(
                user=user,
                address_line1=address_line1,
                city="",
                state="",
                country="India",
                zip_code=zip_code,
                is_default=True,
                phone=user.phone_number,
                name=f"{user.first_name} {user.last_name}".strip()
            )
            Cart.objects.create(user=user)

        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate_email(self, value):
        return value.lower()


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        write_only=True, 
        required=True
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True
    )

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True
    )

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs


class ResendActivationEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country', 'is_default', 'phone','name']
        read_only_fields = ['id', 'user']


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'is_active', 'image','image_url' ,'display_order']
        read_only_fields = ['id', 'slug']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'logo', 'description']
        read_only_fields = ['id']


class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = ['id', 'attribute_type', 'attribute_value']
        read_only_fields = ['id']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image']
        read_only_fields = ['id']


# serializers.py - Updated ProductVariantSerializer to handle updates properly
from rest_framework import serializers
from .models import ProductVariant, Product
import uuid

class ProductVariantSerializer(serializers.ModelSerializer):
    # Changed to CharField to accept string representation of UUID
    product_id = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'product_id', 'size', 'price', 'stock', 'sku', 'is_discount_active', 'discount_price', 'discount_percentage']
        read_only_fields = ['id']
    
    def validate_product_id(self, value):
        """Validate the product_id is a valid UUID and corresponds to an existing product"""
        try:
            # Try to convert to UUID to validate format
            product_id = uuid.UUID(value)
            
            # Check if product exists
            try:
                Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with ID {value} does not exist")
                
            return value
        except ValueError:
            raise serializers.ValidationError(f"Invalid UUID format: {value}")
    
    def create(self, validated_data):
        """Create a product variant with detailed error handling"""
        try:
            # Extract and validate product_id
            product_id_str = validated_data.pop('product_id')
            product_id = uuid.UUID(product_id_str)
            
            # Get product
            product = Product.objects.get(id=product_id)
            
            # Check if SKU is unique
            sku = validated_data.get('sku')
            if sku and ProductVariant.objects.filter(sku=sku).exists():
                raise serializers.ValidationError({"sku": f"SKU '{sku}' already exists"})
            
            # Create variant
            variant = ProductVariant.objects.create(product=product, **validated_data)
            return variant
            
        except Exception as e:
            # Log the error for debugging
            print(f"Error creating product variant: {str(e)}")
            raise
    
    def update(self, instance, validated_data):
        """Update a product variant with product_id handling"""
        try:
            # If product_id is provided, update the product relationship
            if 'product_id' in validated_data:
                product_id_str = validated_data.pop('product_id')
                product_id = uuid.UUID(product_id_str)
                product = Product.objects.get(id=product_id)
                instance.product = product
            
            # Update the other fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Check if SKU is unique (if it was changed)
            if 'sku' in validated_data and instance.sku != validated_data['sku']:
                sku = validated_data['sku']
                if ProductVariant.objects.exclude(id=instance.id).filter(sku=sku).exists():
                    raise serializers.ValidationError({"sku": f"SKU '{sku}' already exists"})
            
            instance.save()
            return instance
            
        except Exception as e:
            # Log the error for debugging
            print(f"Error updating product variant: {str(e)}")
            raise


# serializers.py - update your ProductListSerializer
class ProductVariantMinSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'price', 'stock', 'is_discount_active', 'discount_price', 'discount_percentage']

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    brand_name = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()
    variants = ProductVariantMinSerializer(many=True, source='variants.all', read_only=True)
    price = serializers.SerializerMethodField()
    discount_price = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    has_discount = serializers.SerializerMethodField()
    is_featured = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category_name', 'brand_name', 
                  'variants_count', 'main_image', 'price', 'discount_price', 
                  'discount_percentage', 'has_discount', 'variants', 'is_featured','is_active']
        read_only_fields = ['id', 'slug']
    
    def get_category_name(self, obj):
        return obj.category.name
    
    def get_brand_name(self, obj):
        return obj.brand.name if obj.brand else None
    
    def get_variants_count(self, obj):
        return obj.variants.count()
    
    def get_main_image(self, obj):
        image = obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
        return None
    
    def get_price(self, obj):
        variant = obj.variants.first()
        if variant:
            return variant.price
        return None

    def get_discount_price(self, obj):
        variant = obj.variants.first()
        if variant and variant.is_discount_active:
            return variant.discount_price
        return None
        
    def get_discount_percentage(self, obj):
        return obj.discount_percentage
        
    def get_has_discount(self, obj):
        return obj.has_discount
    
class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'category', 'brand', 'vendor', 
                  'is_active', 'created_at', 'updated_at', 'variants', 'images', 
                  'attributes', 'average_rating', 'reviews_count']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / reviews.count()
        return 0
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()


# serializers.py - Update ProductCreateUpdateSerializer to include id in response
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'brand', 'is_active']
        read_only_fields = ['id']  # Make sure id is read-only
    
    def create(self, validated_data):
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)
    
    def to_representation(self, instance):
        # Get the default representation
        representation = super().to_representation(instance)
        
        # Ensure id is included and not None
        if 'id' not in representation or representation['id'] is None:
            representation['id'] = str(instance.id)
            
        return representation


class CartItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    product_variant_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=ProductVariant.objects.all(), source='product_variant'
    )
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product_variant', 'product_variant_id', 'quantity', 'subtotal']
        read_only_fields = ['id', 'subtotal']
    
    def get_subtotal(self, obj):
        if obj.product_variant.is_discount_active and obj.product_variant.discount_price:
            return obj.product_variant.discount_price * obj.quantity
        return obj.product_variant.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_total(self, obj):
        return sum(self.get_item_price(item) for item in obj.items.all())
    
    def get_item_price(self, item):
        variant = item.product_variant
        if variant.is_discount_active and variant.discount_price:
            return variant.discount_price * item.quantity
        return variant.price * item.quantity


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=Product.objects.all(), source='product'
    )
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id']
        read_only_fields = ['id']


# serializers.py - Find the ReviewSerializer class and update it

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'product', 'product_id', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at', 'product']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        # Remove product_id if it exists (we'll use the product from context)
        validated_data.pop('product_id', None)
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# class CouponSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Coupon
#         fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 
#                   'max_discount', 'min_purchase_amount', 'valid_from', 'valid_to', 
#                   'is_active', 'applicable_categories', 'applicable_products', 
#                   'usage_limit', 'used_count']
#         read_only_fields = ['id', 'used_count']

# serializers.py
class CouponSerializer(serializers.ModelSerializer):
    applicable_categories = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Category.objects.all(),
        required=False
    )
    applicable_products = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.all(),
        required=False
    )
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 
                  'max_discount', 'min_purchase_amount', 'valid_from', 'valid_to', 
                  'is_active', 'applicable_categories', 'applicable_products', 
                  'usage_limit', 'used_count']
        read_only_fields = ['id', 'used_count']
    
    def validate(self, data):
        # Validate that valid_to is after valid_from
        if data.get('valid_to') and data.get('valid_from'):
            if data['valid_to'] <= data['valid_from']:
                raise serializers.ValidationError("Valid to date must be after valid from date")
        
        # Validate discount value based on type
        if data.get('discount_type') == 'percent' and data.get('discount_value'):
            if data['discount_value'] > 100:
                raise serializers.ValidationError("Percentage discount cannot exceed 100%")
            if data['discount_value'] < 0:
                raise serializers.ValidationError("Discount value cannot be negative")
        
        return data



class CouponValidateSerializer(serializers.Serializer):
    coupon = serializers.CharField(required=True)
    cart_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)

    def validate(self, attrs):
        coupon = attrs['coupon']
        cart_total = attrs['cart_total']
        
        try:
            coupon = Coupon.objects.get(code=coupon, is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Invalid coupon code."})
        
        # Check if coupon is still valid date-wise
        now = timezone.now()
        if now < coupon.valid_from or now > coupon.valid_to:
            raise serializers.ValidationError({"code": "Coupon is not valid at this time."})
        
        # Check if minimum purchase requirement is met
        if cart_total < coupon.min_purchase_amount:
            raise serializers.ValidationError({
                "cart_total": f"Minimum purchase amount of ${coupon.min_purchase_amount} not met."
            })
        
        # Check if coupon has reached usage limit
        if coupon.used_count >= coupon.usage_limit:
            raise serializers.ValidationError({"code": "Coupon usage limit has been reached."})
        
        # Additional validation could include checking if user has already used this coupon
        # and if the coupon applies to the items in the cart
        
        attrs['coupon'] = coupon
        return attrs


# In serializers.py
# Find the OrderItemSerializer and modify it:

class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_variant', 'quantity', 'price', 'product_name', 'product_image', 'product_slug']
        read_only_fields = ['id', 'price']
    
    def get_product_name(self, obj):
        return obj.product_variant.product.name if obj.product_variant.product else None
    
    def get_product_image(self, obj):
        if obj.product_variant.product and obj.product_variant.product.images.first():
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product_variant.product.images.first().image.url)
        return None
    
    def get_product_slug(self, obj):
        return obj.product_variant.product.slug if obj.product_variant.product else None
    

class PromotionalBannerSerializer(serializers.ModelSerializer):
    # Make image optional for updates
    image = serializers.ImageField(required=False)
    
    class Meta:
        model = PromotionalBanner
        fields = ['id', 'title', 'subtitle', 'image', 'button_text', 
                  'target_url', 'position', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        """
        Validate that image is required only on creation
        """
        # If creating a new banner, image is required
        if not self.instance and not attrs.get('image'):
            raise serializers.ValidationError({'image': 'Image is required when creating a banner.'})
        
        return attrs
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            representation['image'] = request.build_absolute_uri(instance.image.url)
        return representation

# serializers.py - online payments

from rest_framework import serializers
from .models import Order, OrderItem, Transaction, Cart, Coupon, CouponUsage, Address, ProductVariant
from decimal import Decimal

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'merchant_order_id', 'amount', 'status', 
                  'phonepe_transaction_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_variant', 'quantity', 'price', 
                  'product_name', 'product_image', 'product_slug']
        read_only_fields = ['id', 'price']
    
    def get_product_variant(self, obj):
        return {
            'id': obj.product_variant.id,
            'size': obj.product_variant.size,
            'stock': obj.product_variant.stock
        }
    
    def get_product_name(self, obj):
        return obj.product_variant.product.name if obj.product_variant.product else None
    
    def get_product_image(self, obj):
        if obj.product_variant.product and obj.product_variant.product.images.first():
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product_variant.product.images.first().image.url)
        return None
    
    def get_product_slug(self, obj):
        return obj.product_variant.product.slug if obj.product_variant.product else None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    address_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_email', 'address', 'address_details', 
                  'total_price', 'payment_method', 'status', 'created_at', 
                  'updated_at', 'items', 'coupon', 'discount_amount', 'transactions']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_address_details(self, obj):
        if obj.address:
            return {
                'street_address': obj.address.street_address,
                'city': obj.address.city,
                'state': obj.address.state,
                'postal_code': obj.address.postal_code,
                'country': obj.address.country
            }
        return None


class CODOrderCreateSerializer(serializers.Serializer):
    """Serializer for COD order creation"""
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all()
    )
    coupon_id = serializers.PrimaryKeyRelatedField(
        queryset=Coupon.objects.all(),
        required=False,
        allow_null=True
    )
    discount_value = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False, 
        default=Decimal('0.00')
    )
    product_discount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False, 
        default=Decimal('0.00')
    )


class OnlinePaymentInitiateSerializer(serializers.Serializer):
    """Serializer for online payment initiation"""
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all()
    )
    coupon_id = serializers.PrimaryKeyRelatedField(
        queryset=Coupon.objects.all(),
        required=False,
        allow_null=True
    )
    discount_value = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False, 
        default=Decimal('0.00')
    )


# added above content for online payments
# below is being used to create pdf
class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)
    coupon = CouponSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user','discount_amount', 'address', 'total_price', 'payment_method','delivery_partner','tracking_number','tracking_url','expected_delivery_date','actual_delivery_date',
                  'status', 'created_at', 'updated_at', 'items', 'coupon']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(), source='address'
    )
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ['address_id', 'payment_method', 'coupon_code']
    
    def validate_coupon_code(self, value):
        if not value:
            return None
            
        try:
            return Coupon.objects.get(code=value, is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")
    
    def create(self, validated_data):
        user = self.context['request'].user
        coupon_code = validated_data.pop('coupon_code', None)
        
        # Get user's cart
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise serializers.ValidationError({"cart": "User has no active cart."})
        
        # Check if cart is empty
        if not cart.items.exists():
            raise serializers.ValidationError({"cart": "Cart is empty."})
        
        # Calculate total price
        total_price = sum(self.get_item_price(item) for item in cart.items.all())
        
        # Apply coupon if provided
        coupon = None
        if coupon_code:
            coupon = self.validate_coupon_code(coupon_code)
            if coupon:
                # Check if user has already used this coupon
                if CouponUsage.objects.filter(user=user, coupon=coupon).exists():
                    raise serializers.ValidationError({"coupon_code": "You have already used this coupon."})
                
                # Check minimum purchase amount
                if total_price < coupon.min_purchase_amount:
                    raise serializers.ValidationError({
                        "coupon_code": f"Minimum purchase amount of ${coupon.min_purchase_amount} not met."
                    })
                
                # Apply discount
                if coupon.discount_type == 'percent':
                    discount = total_price * (coupon.discount_value / 100)
                    if coupon.max_discount and discount > coupon.max_discount:
                        discount = coupon.max_discount
                else:  # flat discount
                    discount = coupon.discount_value
                
                total_price -= discount
                
                # Record coupon usage
                coupon.used_count += 1
                coupon.save()
                CouponUsage.objects.create(user=user, coupon=coupon)
        
        # Create order
        order = Order.objects.create(
            user=user,
            address=validated_data['address'],
            total_price=total_price,
            payment_method=validated_data['payment_method'],
            coupon=coupon
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product_variant=cart_item.product_variant,
                quantity=cart_item.quantity,
                price=self.get_item_unit_price(cart_item.product_variant)
            )
        
        # Clear the cart
        cart.items.all().delete()
        
        # Create notification for the user
        Notification.objects.create(
            user=user,
            title="Order Placed Successfully",
            message=f"Your order #{order.id} has been placed successfully and is now being processed."
        )
        
        return order
    
    def get_item_price(self, item):
        return item.quantity * self.get_item_unit_price(item.product_variant)
    
    def get_item_unit_price(self, variant):
        if variant.is_discount_active and variant.discount_price:
            return variant.discount_price
        return variant.price


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'created_at']


# # Dashboard serializers
# class DashboardOverviewSerializer(serializers.Serializer):
#     total_orders = serializers.IntegerField()
#     total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
#     total_customers = serializers.IntegerField()
#     total_products = serializers.IntegerField()
#     pending_orders = serializers.IntegerField()
#     recent_orders = OrderSerializer(many=True)

class DashboardOverviewSerializer(serializers.Serializer):
    # Basic metrics
    total_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_customers = serializers.IntegerField()
    total_products = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    overdue_orders = serializers.IntegerField()

    # Time-based analytics
    today_orders = serializers.IntegerField()
    today_sale = serializers.DecimalField(max_digits=12, decimal_places=2)
    yesterday_orders = serializers.IntegerField()
    yesterday_sale = serializers.DecimalField(max_digits=12, decimal_places=2)
    week_orders = serializers.IntegerField()
    week_sale = serializers.DecimalField(max_digits=12, decimal_places=2)
    month_orders = serializers.IntegerField()
    month_sale = serializers.DecimalField(max_digits=12, decimal_places=2)
    year_orders = serializers.IntegerField()
    year_sale = serializers.DecimalField(max_digits=12, decimal_places=2)

    # Operational insights
    cancelled_orders = serializers.IntegerField()
    delivered_orders = serializers.IntegerField()
    avg_order_value = serializers.FloatField()
    customer_repeat_rate = serializers.IntegerField()

    # Lists
    recent_orders = OrderSerializer(many=True)
    top_categories = serializers.ListField(child=serializers.DictField())
    top_products = serializers.ListField(child=serializers.DictField())


class SalesSummarySerializer(serializers.Serializer):
    total_sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    avg_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)

class SalesDataItemSerializer(serializers.Serializer):
    date = serializers.CharField(required=False)
    month = serializers.CharField(required=False)
    sales = serializers.DecimalField(max_digits=12, decimal_places=2)
    orders = serializers.IntegerField(source='count')
    avg_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)

class SalesReportSerializer(serializers.Serializer):
    period = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    summary = SalesSummarySerializer()
    data = serializers.ListField(child=SalesDataItemSerializer())