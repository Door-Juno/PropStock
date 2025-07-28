from rest_framework import serializers
from .models import InventoryTransaction

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True) # in = 입고, out = 출고로 변환해서 응답에 보여줌

    class Meta:
        model = InventoryTransaction
        fields = [
            'id', 'store',
            'product', 'product_name',
            'type', 'type_display',
            'quantity', 'notes',
            'date', 'created_at'
        ]
        read_only_fields = ['id', 'date', 'created_at']

    def validate_quantity(self, value): # quantify 필드가 유효한지 검사
        if value <= 0:
            raise serializers.ValidationError("수량은 1개 이상이어야 합니다.")
        return value

    def create(self, validated_data):
        # 출고시 수량을 음수로 바꿔서 저장
        if validated_data['type'] == 'out':
            validated_data['quantity'] = -validated_data['quantity']
        return super().create(validated_data)
