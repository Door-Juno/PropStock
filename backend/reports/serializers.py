from rest_framework import serializers

class SummaryReportSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_profit = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_quantity = serializers.IntegerField()

class SalesTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_sales_quantity = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)

class InventoryTurnoverSerializer(serializers.Serializer):
    item_code = serializers.CharField(max_length=255)
    item_name = serializers.CharField(max_length=255)
    turnover_rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_days_in_stock = serializers.CharField(max_length=255) # N/A 가능성 때문에 CharField

class CostSavingsSerializer(serializers.Serializer):
    total_waste_cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    message = serializers.CharField(max_length=255)
