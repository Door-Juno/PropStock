from django.urls import path
from .views import SalesForecastAPIView, OrderRecommendationAPIView

urlpatterns = [
    path('sales-forecast/', SalesForecastAPIView.as_view(), name='sales-forecast'),
    path('orders/recommendations/', OrderRecommendationAPIView.as_view(), name='order-recommendations'),
]