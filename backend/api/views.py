# api/views.py

from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import FilterSet

from .models import (
    Product, Review, Cart, CartItem, Order, OrderItem, 
    Inventory, ProductRecommendation
)
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
    CartSerializer, CartItemSerializer, OrderListSerializer, 
    OrderDetailSerializer, OrderCreateSerializer, UserSerializer,
    UserRegistrationSerializer, ProductRecommendationSerializer
)
from django.contrib.auth.models import User


# Custom FilterSet for Product filtering
class ProductFilterSet(FilterSet):
    """Custom filter set for Product - only handles color"""
    
    class Meta:
        model = Product
        fields = ['color']


# Authentication Views
class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Anyone can create an account.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to get/update current user profile.
    Only authenticated users can access their own profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserLoginView(generics.GenericAPIView):
    """
    API endpoint for user login.
    Returns authentication token on successful login.
    """
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'detail': 'Invalid credentials.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# Product Views
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for browsing products.
    Supports filtering by category, searching by name,
    and sorting by price/rating.
    """
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilterSet
    search_fields = ['name', 'description', 'color', 'category']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Handle multiple category parameters and price range"""
        queryset = super().get_queryset()
        
        # Get multiple category values from query params
        # Axios sends as category[]=value1&category[]=value2, so check for 'category[]'
        categories = self.request.query_params.getlist('category[]')
        if not categories:
            # Fallback to 'category' in case format changes
            categories = self.request.query_params.getlist('category')
        
        if categories:
            queryset = queryset.filter(category__in=categories)
        
        # Handle price range filtering
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        # Convert to float if provided
        if min_price is not None:
            try:
                min_price = float(min_price)
                queryset = queryset.filter(price__gte=min_price)
            except (ValueError, TypeError):
                pass
        
        if max_price is not None:
            try:
                max_price = float(max_price)
                queryset = queryset.filter(price__lte=max_price)
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve, simple for list"""
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """
        Get recommended products similar to this one.
        /products/{id}/recommendations/
        """
        product = self.get_object()
        recommendations = product.recommendations_from.all()
        serializer = ProductRecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Advanced search endpoint.
        Allows filtering by price range and multiple categories.
        /products/search/?min_price=10&max_price=50&categories=street_racers,sports_cars
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Price range filtering
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured/top-rated products.
        /products/featured/
        """
        # Get products with highest average ratings
        top_products = Product.objects.annotate(
            avg_rating=Avg('reviews__rating')
        ).filter(avg_rating__isnull=False).order_by('-avg_rating')[:8]
        
        serializer = self.get_serializer(top_products, many=True)
        return Response(serializer.data)


# Review Views
class ReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for product reviews.
    Anyone can view reviews.
    Authenticated users can create and edit their own reviews.
    """
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        """Allow viewing reviews for everyone, but require auth for create/update/delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'mark_helpful']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter reviews by product if product_id in query params"""
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return Review.objects.filter(product_id=product_id)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        """Automatically set the current user as the reviewer"""
        product_id = self.request.data.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(user=self.request.user, product=product)
    
    def perform_update(self, serializer):
        """Ensure user can only update their own reviews"""
        if serializer.instance.user != self.request.user:
            return Response(
                {'detail': 'You can only edit your own reviews.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """
        Toggle helpful status for a review.
        If user already marked as helpful, removes the mark.
        If not marked, adds the mark.
        /reviews/{id}/mark_helpful/
        """
        review = self.get_object()
        
        # Toggle helpful status
        if review.helpful_users.filter(id=request.user.id).exists():
            # Remove the mark
            review.helpful_users.remove(request.user)
            is_marked = False
        else:
            # Add the mark
            review.helpful_users.add(request.user)
            is_marked = True
        
        return Response({
            'helpful_count': review.helpful_count,
            'is_marked_helpful': is_marked
        })


# Cart Views
class CartViewSet(viewsets.ViewSet):
    """
    API endpoints for shopping cart operations.
    Each user has one cart. All operations require authentication.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def view_cart(self, request):
        """
        Get current user's cart.
        /cart/view_cart/
        """
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Add a product to cart.
        POST with: {"product_id": 1, "quantity": 2}
        /cart/add_item/
        """
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        # Validate product exists
        product = get_object_or_404(Product, id=product_id)
        
        # Check stock
        if product.inventory.stock_quantity < quantity:
            return Response(
                {'detail': 'Not enough stock available.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add or update cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """
        Update quantity of item in cart.
        POST with: {"product_id": 1, "quantity": 5}
        /cart/update_item/
        """
        cart = get_object_or_404(Cart, user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity'))
        
        cart_item = get_object_or_404(CartItem, cart=cart, product_id=product_id)
        
        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """
        Remove item from cart.
        POST with: {"product_id": 1}
        /cart/remove_item/
        """
        cart = get_object_or_404(Cart, user=request.user)
        product_id = request.data.get('product_id')
        
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def clear_cart(self, request):
        """
        Remove all items from cart.
        /cart/clear_cart/
        """
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared successfully.'})


# Order Views
class OrderViewSet(viewsets.ViewSet):
    """
    API endpoints for order management.
    Users can view their orders and create new ones.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Get all orders for current user.
        /orders/my_orders/
        """
        orders = Order.objects.filter(user=request.user)
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def order_detail(self, request, pk=None):
        """
        Get details of a specific order.
        /orders/{id}/order_detail/
        """
        order = get_object_or_404(Order, id=pk, user=request.user)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """
        Create new order from cart.
        POST with shipping and payment info
        /orders/create_order/
        """
        serializer = OrderCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            order = serializer.save()
            return Response(
                OrderDetailSerializer(order).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def order_by_number(self, request):
        """
        Get order by order number.
        /orders/order_by_number/?order_number=HW-ABC123
        """
        order_number = request.query_params.get('order_number')
        order = get_object_or_404(Order, order_number=order_number, user=request.user)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)


# Admin Views
class AdminProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing products (admin only).
    Create, read, update, delete products.
    """
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAdminUser]


class AdminInventoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing inventory (admin only).
    Track and update stock levels.
    """
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """
        Update stock quantity for a product.
        POST with: {"quantity": 50}
        """
        product = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is not None:
            product.inventory.stock_quantity = quantity
            product.inventory.save()
            return Response({
                'product': product.name,
                'new_stock': product.inventory.stock_quantity
            })
        return Response({'error': 'Quantity required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def reorder_alert(self, request, pk=None):
        """
        Update reorder level for a product.
        POST with: {"reorder_level": 20}
        """
        product = self.get_object()
        reorder_level = request.data.get('reorder_level')
        
        if reorder_level is not None:
            product.inventory.reorder_level = reorder_level
            product.inventory.save()
            return Response({
                'product': product.name,
                'reorder_level': product.inventory.reorder_level
            })
        return Response({'error': 'Reorder level required'}, status=status.HTTP_400_BAD_REQUEST)


class AdminOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing and managing orders (admin only).
    View all orders and order details.
    """
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update order status.
        POST with: {"status": "shipped"}
        """
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        
        if new_status in valid_statuses:
            order.status = new_status
            order.save()
            return Response({
                'order_number': order.order_number,
                'status': order.status
            })
        return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing users (admin only).
    View user information.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        """
        Toggle staff status for a user.
        Cannot modify own staff status.
        """
        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot modify your own staff status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_staff = not user.is_staff
        user.save()
        return Response({
            'username': user.username,
            'is_staff': user.is_staff
        })
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle active status for a user.
        Cannot modify own active status.
        """
        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {'error': 'You cannot modify your own active status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_active = not user.is_active
        user.save()
        return Response({
            'username': user.username,
            'is_active': user.is_active
        })


class AdminReviewViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reviews (admin only).
    View, delete, or flag reviews.
    """
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminUser]
    
    def destroy(self, request, *args, **kwargs):
        """Delete a review"""
        review = self.get_object()
        product_name = review.product.name
        review.delete()
        return Response({
            'message': f'Review deleted',
            'product': product_name
        })
