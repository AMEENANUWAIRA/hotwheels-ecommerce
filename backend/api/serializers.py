# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from decimal import Decimal
from .models import (
    Product, Review, Cart, CartItem, Order, OrderItem, 
    Inventory, ProductRecommendation
)
import uuid

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    """Serialize user data without exposing sensitive information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration - validates password"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create cart when user registers
        Cart.objects.create(user=user)
        return user


# Review Serializers
class ReviewSerializer(serializers.ModelSerializer):
    """Serialize product reviews"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'rating', 'title', 'comment', 
                  'helpful_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'helpful_count']


# Inventory Serializers
class InventorySerializer(serializers.ModelSerializer):
    """Serialize inventory/stock information"""
    is_in_stock = serializers.SerializerMethodField()
    needs_reorder = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventory
        fields = ['id', 'stock_quantity', 'reorder_level', 'is_in_stock', 'needs_reorder']
    
    def get_is_in_stock(self, obj):
        return obj.is_in_stock()
    
    def get_needs_reorder(self, obj):
        return obj.needs_reorder()


# Product Serializers
class ProductListSerializer(serializers.ModelSerializer):
    """Simplified product serializer for list views (faster)"""
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    is_in_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'category', 'color', 
                  'average_rating', 'total_reviews', 'is_in_stock']
    
    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_total_reviews(self, obj):
        return obj.total_reviews()
    
    def get_is_in_stock(self, obj):
        return obj.inventory.is_in_stock()


class ProductDetailSerializer(serializers.ModelSerializer):
    """Complete product serializer with all details"""
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()
    inventory = InventorySerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'sku', 
                  'category', 'year', 'color', 'reviews', 'average_rating', 
                  'total_reviews', 'inventory', 'created_at']
    
    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_total_reviews(self, obj):
        return obj.total_reviews()


# Recommendation Serializers
class ProductRecommendationSerializer(serializers.ModelSerializer):
    """Serialize product recommendations"""
    recommended_product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = ProductRecommendation
        fields = ['id', 'recommended_product', 'reason', 'score']


# Cart Serializers
class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for individual cart items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['id', 'added_at']
    
    def get_subtotal(self, obj):
        return float(obj.get_subtotal())


class CartSerializer(serializers.ModelSerializer):
    """Complete cart with all items"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']
    
    def get_total(self, obj):
        return float(obj.get_total())
    
    def get_item_count(self, obj):
        return obj.get_item_count()


# Order Serializers
class OrderItemSerializer(serializers.ModelSerializer):
    """Items within an order"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'quantity', 'price_at_purchase']


class OrderListSerializer(serializers.ModelSerializer):
    """Simplified order serializer for order lists"""
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'total', 'created_at']


class OrderDetailSerializer(serializers.ModelSerializer):
    """Complete order with all items and details"""
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'items', 'shipping_address', 
                  'shipping_city', 'shipping_state', 'shipping_zip', 'subtotal', 
                  'tax', 'shipping_cost', 'total', 'payment_method', 'is_paid', 
                  'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating new orders from cart"""
    shipping_address = serializers.CharField(max_length=255)
    shipping_city = serializers.CharField(max_length=100)
    shipping_state = serializers.CharField(max_length=100)
    shipping_zip = serializers.CharField(max_length=20)
    payment_method = serializers.CharField(max_length=50)
    
    def create(self, validated_data):
        """Convert cart to order"""
        user = self.context['request'].user
        cart = user.cart
        
        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty")
        
        # Calculate totals
        subtotal = cart.get_total()
        tax = subtotal * Decimal('0.08')  # 8% tax
        shipping_cost = Decimal('5.00')
        total = subtotal + tax + shipping_cost
        
        # Create order
        order = Order.objects.create(
            user=user,
            **validated_data,
            subtotal=subtotal,
            tax=tax,
            shipping_cost=shipping_cost,
            total=total,
        )
        order.generate_order_number()
        order.save()
        
        # Create order items from cart
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price_at_purchase=cart_item.product.price,
            )
            
            # Reduce inventory
            cart_item.product.inventory.stock_quantity -= cart_item.quantity
            cart_item.product.inventory.save()
        
        # Clear cart
        cart.items.all().delete()
        
        return order
