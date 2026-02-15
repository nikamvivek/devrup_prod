from django.contrib import admin
from django.utils.html import format_html
from .models import (
    PromotionalBanner, User, Address, Category, Brand, Product, ProductVariant, ProductImage,
    ProductAttribute, Cart, CartItem, Wishlist, Coupon, CouponUsage, Order,
    OrderItem, Review, Notification
)

from django import forms
from ckeditor.widgets import CKEditorWidget


class ProductAdminForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorWidget())
    class Meta:
        model = Product
        fields = '__all__'



@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_admin', 'is_vendor', 'is_customer', 'date_joined')
    list_filter = ('is_admin', 'is_vendor', 'is_customer', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_admin', 'is_vendor', 'is_customer', 'is_active', 'is_staff', 'is_superuser')}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'address_line1', 'city', 'state', 'country', 'is_default')
    list_filter = ('is_default', 'country', 'state')
    search_fields = ('user__email', 'address_line1', 'city', 'state', 'country')


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'display_order')
    list_filter = ('is_active',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}   


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_logo', 'description')
    search_fields = ('name',)
    
    def display_logo(self, obj):
        if obj.logo:
            return format_html('<img src="{}" width="50" height="50" />', obj.logo.url)
        return "-"
    display_logo.short_description = 'Logo'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'slug', 'category', 'brand', 'vendor', 'is_active','is_featured','created_at')
    list_filter = ('is_active', 'created_at', 'category', 'brand')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline, ProductAttributeInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'price', 'stock', 'sku', 'is_discount_active', 'discount_price')
    list_filter = ('is_discount_active', 'product__category')
    search_fields = ('product__name', 'sku', 'size')


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'item_count')
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product_variant', 'quantity')
    list_filter = ('cart__user',)
    search_fields = ('cart__user__email', 'product_variant__product__name')


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'product')
    list_filter = ('user',)
    search_fields = ('user__email', 'product__name')


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'valid_from', 'valid_to', 'is_active', 'used_count')
    list_filter = ('discount_type', 'is_active', 'valid_from', 'valid_to')
    search_fields = ('code', 'description')
    filter_horizontal = ('applicable_categories', 'applicable_products')


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'coupon', 'used_at')
    list_filter = ('used_at',)
    search_fields = ('user__email', 'coupon__code')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_variant', 'quantity', 'price')


# @admin.register(Order)
# class OrderAdmin(admin.ModelAdmin):
#     list_display = ('id', 'user', 'total_price', 'payment_method', 'status', 'created_at')
#     list_filter = ('status', 'payment_method', 'created_at')
#     search_fields = ('id', 'user__email')
#     readonly_fields = ('id', 'created_at', 'updated_at')
#     inlines = [OrderItemInline]
    
#     fieldsets = (
#         ('Order Information', {
#             'fields': ('id', 'user', 'address', 'total_price', 'coupon')
#         }),
#         ('Payment and Status', {
#             'fields': ('payment_method', 'status')
#         }),
#         ('Timestamps', {
#             'fields': ('created_at', 'updated_at')
#         }),
#     )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'payment_method', 'status', 'delivery_partner', 'created_at')
    list_filter = ('status', 'payment_method', 'delivery_partner', 'created_at')
    search_fields = ('id', 'user__email', 'tracking_number', 'delivery_partner')
    readonly_fields = ('id', 'created_at', 'updated_at', 'actual_delivery_date')
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'user', 'address', 'total_price','discount_amount', 'coupon')
        }),
        ('Payment and Status', {
            'fields': ('payment_method', 'status')
        }),
        ('Delivery Tracking', {
            'fields': ('delivery_partner', 'tracking_number', 'tracking_url', 'expected_delivery_date', 'actual_delivery_date'),
            'classes': ('collapse',),
            'description': 'Delivery information (only relevant when status is Shipped or Delivered)'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Customize form to show delivery fields only for shipped/delivered orders
        """
        form = super().get_form(request, obj, **kwargs)
        
        # Add help text for delivery fields
        if 'delivery_partner' in form.base_fields:
            form.base_fields['delivery_partner'].help_text = 'Enter the courier service name (e.g., FedEx, UPS, DHL, USPS)'
        
        if 'tracking_number' in form.base_fields:
            form.base_fields['tracking_number'].help_text = 'Enter the tracking/delivery number provided by the courier'
        
        if 'tracking_url' in form.base_fields:
            form.base_fields['tracking_url'].help_text = 'Full URL to track the shipment (e.g., https://www.fedex.com/track?tracking=...)'
        
        return form
    
    def save_model(self, request, obj, form, change):
        """
        Add custom logic when saving the order
        """
        # Clear delivery fields if status is not shipped or delivered
        if obj.status not in ['shipped', 'delivered']:
            obj.delivery_partner = None
            obj.tracking_number = None
            obj.tracking_url = None
            obj.expected_delivery_date = None
        
        super().save_model(request, obj, form, change)
    
    actions = ['mark_as_shipped', 'mark_as_delivered', 'mark_as_cancelled']
    
    def mark_as_shipped(self, request, queryset):
        """Mark selected orders as shipped"""
        updated = queryset.update(status='shipped')
        self.message_user(request, f'{updated} order(s) marked as shipped.')
    mark_as_shipped.short_description = 'Mark selected orders as Shipped'
    
    def mark_as_delivered(self, request, queryset):
        """Mark selected orders as delivered"""
        from django.utils import timezone
        for order in queryset:
            order.status = 'delivered'
            if not order.actual_delivery_date:
                order.actual_delivery_date = timezone.now()
            order.save()
        self.message_user(request, f'{queryset.count()} order(s) marked as delivered.')
    mark_as_delivered.short_description = 'Mark selected orders as Delivered'
    
    def mark_as_cancelled(self, request, queryset):
        """Mark selected orders as cancelled"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} order(s) marked as cancelled.')
    mark_as_cancelled.short_description = 'Mark selected orders as Cancelled'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__email', 'product__name', 'comment')
    readonly_fields = ('created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at',)


# Register ProductImage and ProductAttribute if they need separate admin views
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'display_image')
    search_fields = ('product__name',)
    
    def display_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "-"
    display_image.short_description = 'Image'


@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ('product', 'attribute_type', 'attribute_value')
    list_filter = ('attribute_type',)
    search_fields = ('product__name', 'attribute_type', 'attribute_value')



class PromotionalBannerAdmin(admin.ModelAdmin):
    """Admin interface for promotional banners"""
    list_display = ('title', 'position', 'is_active', 'created_at')
    list_filter = ('position', 'is_active')
    search_fields = ('title', 'subtitle')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'subtitle', 'image', 'button_text', 'target_url')
        }),
        ('Status', {
            'fields': ('position', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

admin.site.register(PromotionalBanner, PromotionalBannerAdmin)