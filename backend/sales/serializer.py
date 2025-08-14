from rest_framework import serializers
from .models import Sales

class SalesSerializer(serializers.ModelSerializer):
    # 아래 필드들은 GET 요청 시 (데이터를 읽을 때) 사용됩니다.
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_code = serializers.CharField(source='item.item_code', read_only=True)

    class Meta:
        model = Sales
        fields = [
            'id', 'store', 'item', 'item_name', 'item_code',
            'date', 'quantity', 'selling_price', 'cost_price', 'is_event_day'
        ]
        # store는 POST 요청 시(데이터를 쓸 때) views.py에서 채워주므로 read_only로 설정합니다.
        read_only_fields = ['id', 'item_name', 'item_code']


# drf-spectacular (API 문서)를 위한 Serializers
class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

class SalesBulkUploadErrorSerializer(serializers.Serializer):
    row_number = serializers.IntegerField()
    message = serializers.CharField()

class SalesBulkUploadResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    total_rows = serializers.IntegerField()
    processed_rows = serializers.IntegerField()
    failed_rows = serializers.IntegerField()
    errors = SalesBulkUploadErrorSerializer(many=True)
