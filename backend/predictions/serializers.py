from rest_framework import serializers

class SalesForecastSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    item_code = serializers.CharField(max_length=255)
    name = serializers.CharField(max_length=255)
    current_stock = serializers.IntegerField()
    predicted_quantity = serializers.FloatField()

class OrderRecommendationSerializer(serializers.Serializer):
    item_code = serializers.CharField(max_length=255)
    item_name = serializers.CharField(max_length=255)
    current_stock = serializers.IntegerField()
    predicted_sales_next_day = serializers.FloatField()
    stock_out_estimate_date = serializers.CharField(max_length=255, allow_null=True) # 날짜 또는 N/A
    recommended_order_quantity = serializers.IntegerField()
    order_by_date = serializers.CharField(max_length=255, allow_null=True) # 날짜 또는 N/A
    reason = serializers.CharField(max_length=255)
