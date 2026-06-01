# api/models.py

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

class Product(models.Model):
    """
    Represents a Hot Wheels toy product.
    Each product has a name, description, price, and image.
    """
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    sku = models.CharField(max_length=100, unique=True)  # Stock Keeping Unit
    
    # Categories like "Street Racers", "Hot Trucks", etc.
    category = models.CharField(max_length=100, choices=[
        ('street_racers', 'Street Racers'),
        ('hot_trucks', 'Hot Trucks'),
        ('sports_cars', 'Sports Cars'),
        ('classics', 'Classics'),
        ('exotics', 'Exotics'),
    ])
    
    year = models.IntegerField(default=2024)
    color = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def average_rating(self):
        """Calculate average rating from reviews"""
        avg = self.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def total_reviews(self):
        """Count total reviews"""
        return self.reviews.count()

    @property
    def is_in_stock(self):
        """Check if product is in stock via its inventory relationship"""
        return hasattr(self, 'inventory') and self.inventory.stock_quantity > 0

    @property
    def stock_quantity(self):
        """Get stock quantity via its inventory relationship"""
        return self.inventory.stock_quantity if hasattr(self, 'inventory') else 0


class Inventory(models.Model):
    """
    Tracks stock levels for each product.
    Helps manage what's available and what's out of stock.
    """
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    stock_quantity = models.IntegerField(validators=[MinValueValidator(0)])
    reorder_level = models.IntegerField(default=10)  # Alert when stock falls below this
    
    class Meta:
        verbose_name_plural = "inventories"
    
    def __str__(self):
        return f"{self.product.name} - {self.stock_quantity} units"
    
    def is_in_stock(self):
        return self.stock_quantity > 0
    
    def needs_reorder(self):
        return self.stock_quantity <= self.reorder_level


class Review(models.Model):
    """
    Customer reviews for products.
    Each review has a rating (1-5 stars) and text comment.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=200)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    helpful_users = models.ManyToManyField(User, related_name='helpful_reviews', blank=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')  # One review per user per product
    
    def __str__(self):
        return f"{self.product.name} - {self.rating} stars by {self.user.username}"
    
    @property
    def helpful_count(self):
        """Count of users who marked this review as helpful"""
        return self.helpful_users.count()


class Cart(models.Model):
    """
    Shopping cart for each user.
    Contains items they want to buy before checkout.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
    def get_total(self):
        """Calculate total cart value"""
        return sum(item.get_subtotal() for item in self.items.all())
    
    def get_item_count(self):
        """Count total items in cart"""
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """
    Individual items in a shopping cart.
    Links a product to a cart with a quantity.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'product')
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
    
    def get_subtotal(self):
        return self.product.price * self.quantity


class Order(models.Model):
    """
    Represents a completed purchase.
    Contains customer info and all products ordered.
    """
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES, default='pending')
    
    # Shipping information
    shipping_address = models.CharField(max_length=255)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_zip = models.CharField(max_length=20)
    
    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment
    payment_method = models.CharField(max_length=50)
    is_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.order_number}"
    
    def generate_order_number(self):
        """Auto-generate order number"""
        import uuid
        self.order_number = f"HW-{uuid.uuid4().hex[:8].upper()}"


class OrderItem(models.Model):
    """
    Individual products in an order.
    Stores snapshot of price at time of purchase.
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity} in Order #{self.order.order_number}"
    
    def get_subtotal(self):
        return self.price_at_purchase * self.quantity


class ProductRecommendation(models.Model):
    """
    AI-generated or rule-based recommendations.
    Shows customers related products they might like.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommendations_from')
    recommended_product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='recommendations_to'
    )
    reason = models.CharField(max_length=255, choices=[
        ('similar_category', 'Similar Category'),
        ('popular_together', 'Popular Together'),
        ('highly_rated', 'Highly Rated'),
        ('new_arrival', 'New Arrival'),
    ])
    score = models.FloatField(default=0.5)  # Relevance score 0-1
    
    class Meta:
        unique_together = ('product', 'recommended_product')
    
    def __str__(self):
        return f"{self.product.name} -> {self.recommended_product.name}"
