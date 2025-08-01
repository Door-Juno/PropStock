from django.urls import path
from .views import InventoryTransactionAPIView, InventoryStatusAPIView

urlpatterns = [
    path('transactions/', InventoryTransactionAPIView.as_view(), name='inventory-transactions'),
    path('status/', InventoryStatusAPIView.as_view(), name='inventory-status'),
]