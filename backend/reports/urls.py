from django.urls import path
from .views import SummaryReportAPIView, SalesTrendReportAPIView

urlpatterns = [
    path('summary/', SummaryReportAPIView.as_view(), name='summary-report'),
    path('sales-trend/', SalesTrendReportAPIView.as_view(), name='sales-trend-report'),
]
