from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.text import slugify
from ckeditor.fields import RichTextField
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
import uuid
import os
import shutil
from django.conf import settings


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Auth fields
    is_admin = models.BooleanField(default=False)
    is_vendor = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)  # Changed to False - user starts inactive
    is_staff = models.BooleanField(default=False)
    
    # Email verification tokens (no expiration)
    activation_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email
    
    get_full_name = lambda self: f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['activation_token']),
            models.Index(fields=['password_reset_token']),
        ]


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    phone = models.CharField(max_length=255, blank=True, null=True)
    name= models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f"{self.address_line1}, {self.city}, {self.country}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True, related_name='children')
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Brand(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = RichTextField() 
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, related_name='products', blank=True, null=True)
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviews_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_name = None
        
        # Get old name if product exists
        if not is_new:
            try:
                old_product = Product.objects.get(pk=self.pk)
                old_name = old_product.name
            except Product.DoesNotExist:
                pass
        
        # Generate slug if needed
        if not self.slug:
            self.slug = slugify(self.name)
        
        super().save(*args, **kwargs)
        
        # Rename folder after save if name changed
        if not is_new and old_name and old_name != self.name:
            self.rename_product_folder(old_name)

    @property
    def has_discount(self):
        """Check if any variant of this product has an active discount"""
        return self.variants.filter(is_discount_active=True).exists()
    
    @property
    def discount_percentage(self):
        """Get the highest discount percentage among product variants"""
        highest_discount = self.variants.filter(
            is_discount_active=True
        ).order_by('-discount_percentage').first()
        
        if highest_discount and highest_discount.discount_percentage:
            return highest_discount.discount_percentage
        return 0
    
    def get_folder_name(self):
        """Generate folder name from product name"""
        # Clean the name: remove special chars, replace spaces with hyphens
        clean_name = self.name.lower()
        clean_name = ''.join(c if c.isalnum() or c.isspace() else '' for c in clean_name)
        clean_name = '-'.join(clean_name.split())
        return f"{clean_name}_{str(self.id)[:8]}"
    
    def get_product_folder_path(self):
        """Get the full path to the product's folder"""
        return os.path.join(settings.MEDIA_ROOT, 'products', self.get_folder_name())
    
    def rename_product_folder(self, old_name):
        """Rename product folder when name changes"""
        try:
            # Generate old folder name
            clean_old_name = old_name.lower()
            clean_old_name = ''.join(c if c.isalnum() or c.isspace() else '' for c in clean_old_name)
            clean_old_name = '-'.join(clean_old_name.split())
            old_folder_name = f"{clean_old_name}_{str(self.id)[:8]}"
            
            new_folder_name = self.get_folder_name()
            
            old_path = os.path.join(settings.MEDIA_ROOT, 'products', old_folder_name)
            new_path = os.path.join(settings.MEDIA_ROOT, 'products', new_folder_name)
            
            # Rename folder if it exists
            if os.path.exists(old_path) and not os.path.exists(new_path):
                os.rename(old_path, new_path)
                
                # Update all image paths
                for image in self.images.all():
                    old_image_name = image.image.name
                    new_image_name = old_image_name.replace(old_folder_name, new_folder_name)
                    image.image.name = new_image_name
                    image.save(update_fields=['image'])
        except Exception as e:
            print(f"Error renaming product folder: {e}")

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['name']),
        ]


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)
    is_discount_active = models.BooleanField(default=False)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount_percentage = models.PositiveIntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.size}"


def product_image_upload_path(instance, filename):
    """
    Upload path uses product name-based folder.
    For new products, uses temp folder which gets renamed after product is saved.
    """
    if not instance.product.name or instance.product.name == '':
        # For brand new products without name yet
        return f'products/temp_{str(instance.product.id)}/{filename}'
    
    # Use product name-based folder
    folder_name = instance.product.get_folder_name()
    return f'products/{folder_name}/{filename}'


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=product_image_upload_path)

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductAttribute(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes')
    attribute_type = models.CharField(max_length=100)
    attribute_value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.attribute_type}: {self.attribute_value}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.email}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product_variant.product.name} - {self.product_variant.size}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ['user', 'product']
        
    def __str__(self):
        return f"{self.user.email} - {self.product.name}"


class Coupon(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage'),
        ('flat', 'Flat Amount'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    applicable_categories = models.ManyToManyField(Category, blank=True, related_name='coupons')
    applicable_products = models.ManyToManyField(Product, blank=True, related_name='coupons')
    usage_limit = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.code


class CouponUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='coupon_usages')
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'coupon']
        
    def __str__(self):
        return f"{self.user.email} used {self.coupon.code}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash_on_delivery', 'Cash on Delivery'),
        ('online', 'Online Payment'),  # PhonePe

    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, blank=True, null=True, related_name='orders')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Delivery tracking fields (only relevant when status is 'shipped' or 'delivered')
    delivery_partner = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., FedEx, UPS, DHL")
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(blank=True, null=True, help_text="Link to track the delivery")
    expected_delivery_date = models.DateField(blank=True, null=True)
    actual_delivery_date = models.DateTimeField(blank=True, null=True)  # Optional: for when actually delivered

    def __str__(self):
        return f"Order {self.id} - {self.user.email}"
    
    def has_delivery_info(self):
        """Check if delivery information is available"""
        return self.status in ['shipped', 'delivered'] and self.tracking_number
    
    def save(self, *args, **kwargs):
        # Automatically set actual_delivery_date when status changes to 'delivered'
        if self.status == 'delivered' and not self.actual_delivery_date:
            from django.utils import timezone
            self.actual_delivery_date = timezone.now()
        super().save(*args, **kwargs)                       
    
    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product_variant.product.name} - {self.product_variant.size}"

class Transaction(models.Model):
    """Track PhonePe payment attempts"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]
    
    order = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE, 
        related_name='transactions'
    )
    merchant_order_id = models.CharField(max_length=255, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    phonepe_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    pg_response_code = models.CharField(max_length=50, blank=True, null=True)
    pg_response_message = models.TextField(blank=True, null=True)
    pg_response_payload = models.JSONField(null=True, blank=True)
    payment_response = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Transaction {self.merchant_order_id} for Order {self.order.id}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Transactions"

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        
    def __str__(self):
        return f"{self.user.email} rated {self.product.name}: {self.rating} stars"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.user.email}"
    

class PromotionalBanner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='banners/')
    button_text = models.CharField(max_length=50, default="Shop Now")
    target_url = models.CharField(max_length=255, default="/products")
    is_active = models.BooleanField(default=True)
    position = models.CharField(max_length=50, choices=[
        ('hero', 'Hero Section'),
        ('middle', 'Middle Section'),
        ('bottom', 'Bottom Section')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.position})"


# ============================================================================
# SIGNALS FOR PRODUCT FOLDER MANAGEMENT
# ============================================================================

@receiver(post_save, sender=Product)
def move_product_images_to_named_folder(sender, instance, created, **kwargs):
    """
    After product is created/updated with name, move images from temp folder 
    to name-based folder.
    """
    if instance.name:
        try:
            temp_folder = f'temp_{str(instance.id)}'
            proper_folder = instance.get_folder_name()
            
            temp_path = os.path.join(settings.MEDIA_ROOT, 'products', temp_folder)
            proper_path = os.path.join(settings.MEDIA_ROOT, 'products', proper_folder)
            
            # Move from temp to proper folder
            if os.path.exists(temp_path):
                os.makedirs(proper_path, exist_ok=True)
                
                # Move all files
                for filename in os.listdir(temp_path):
                    old_file = os.path.join(temp_path, filename)
                    new_file = os.path.join(proper_path, filename)
                    
                    if os.path.isfile(old_file):
                        shutil.move(old_file, new_file)
                
                # Update image paths in database
                for image in instance.images.all():
                    if temp_folder in image.image.name:
                        image.image.name = image.image.name.replace(
                            f'products/{temp_folder}/',
                            f'products/{proper_folder}/'
                        )
                        image.save(update_fields=['image'])
                
                # Remove temp folder
                try:
                    os.rmdir(temp_path)
                except:
                    pass
                    
        except Exception as e:
            print(f"Error moving product images: {e}")


@receiver(pre_delete, sender=Product)
def delete_product_folder(sender, instance, **kwargs):
    """
    Delete product folder and all images when product is deleted.
    """
    try:
        # Try to delete the proper folder
        folder_path = instance.get_product_folder_path()
        if os.path.exists(folder_path):
            shutil.rmtree(folder_path)
            print(f"Deleted product folder: {folder_path}")
        
        # Also check for temp folder
        temp_folder = os.path.join(settings.MEDIA_ROOT, 'products', f'temp_{str(instance.id)}')
        if os.path.exists(temp_folder):
            shutil.rmtree(temp_folder)
            print(f"Deleted temp product folder: {temp_folder}")
            
    except Exception as e:
        print(f"Error deleting product folder: {e}")


@receiver([post_save, post_delete], sender=Review)
def update_product_reviews_count(sender, instance, **kwargs):
    """
    Update product reviews count when a review is added or deleted.
    """
    product = instance.product
    product.reviews_count = product.reviews.count()
    product.save(update_fields=['reviews_count'])