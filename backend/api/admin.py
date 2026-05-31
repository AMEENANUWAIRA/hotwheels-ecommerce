from django.contrib import admin
from .models import (
    Product, Inventory, Review, Cart, 
    CartItem, Order, OrderItem, ProductRecommendation
)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Columns to display in the list view
    list_display = ('name', 'sku', 'category', 'price', 'year', 'created_at')
    # Filters on the right sidebar
    list_filter = ('category', 'year')
    # Adds a search bar at the top
    search_fields = ('name', 'sku', 'description')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    # You can display model methods like 'is_in_stock' and 'needs_reorder' directly
    list_display = ('product', 'stock_quantity', 'reorder_level', 'is_in_stock', 'needs_reorder')
    search_fields = ('product__name', 'product__sku')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('product__name', 'user__username', 'title')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'added_at')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'total', 'is_paid', 'created_at')
    list_filter = ('status', 'is_paid')
    search_fields = ('order_number', 'user__username')
    
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_at_purchase')

@admin.register(ProductRecommendation)
class ProductRecommendationAdmin(admin.ModelAdmin):
    list_display = ('product', 'recommended_product', 'reason', 'score')
    list_filter = ('reason',)
    search_fields = ('product__name', 'recommended_product__name')