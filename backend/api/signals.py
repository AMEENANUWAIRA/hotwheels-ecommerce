from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product, Inventory

@receiver(post_save, sender=Product)
def create_product_inventory(sender, instance, created, **kwargs):
    """
    Automatically creates an Inventory instance for every new Product.
    """
    if created:
        Inventory.objects.create(
            product=instance, 
            stock_quantity=0,    # Updated to match your model
            reorder_level=10     # Matches your model's default
        )