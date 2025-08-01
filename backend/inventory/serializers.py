from django.db import transaction
from rest_framework import serializers
from .models import InventoryTransaction
from products.models import Product

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'store', 'store_name', 'product', 'product_name',
            'date', 'type', 'quantity', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'store', 'store_name', 'product_name', 'date', 'created_at']

    def create(self, validated_data):
        with transaction.atomic():
            product = validated_data['product']
            quantity = validated_data['quantity']
            transaction_type = validated_data['type']

            # 재고 수량 업데이트
            if transaction_type == 'in':
                product.current_stock += quantity
            elif transaction_type == 'out':
                if product.current_stock < quantity:
                     raise serializers.ValidationError(f"재고 부족: 현재 재고({product.current_stock})보다 많은 수량({instance.quantity})을 출고할 수 없습니다.")
                product.current_stock -= quantity
            product.save()

            # 재고 변동 기록 생성
            instance = InventoryTransaction.objects.create(**validated_data)
            return instance

class ProductStatusSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'item_code', 'name', 'current_stock', 'min_stock', 'safety_stock', 'status']

    def get_status(self, obj):
        if obj.current_stock < obj.min_stock:
            return '부족'
        elif obj.current_stock > obj.safety_stock: # 안전 재고보다 많으면 과잉으로 간주
            return '과잉'
        else:
            return '정상'