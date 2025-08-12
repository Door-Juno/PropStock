from django.urls import path
from .views import (
    SummaryReportAPIView, 
    SalesTrendAPIView, 
    InventoryTurnoverAPIView,
    CostSavingsAPIView
)

urlpatterns = [
    path('summary/', SummaryReportAPIView.as_view(), name='report-summary'),
    path('sales-trend/', SalesTrendAPIView.as_view(), name='report-sales-trend'),
    path('inventory-turnover/', InventoryTurnoverAPIView.as_view(), name='report-inventory-turnover'),
    path('cost-savings/', CostSavingsAPIView.as_view(), name='report-cost-savings'),
]