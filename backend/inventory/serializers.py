from rest_framework import serializers
from .models import InventoryTransaction

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'store', 'product', 'product_name',
            'date', 'type', 'quantity', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'date', 'created_at']
