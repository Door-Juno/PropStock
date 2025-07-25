from django.urls import path
from .views import InventoryTransactionAPIView

urlpatterns = [
    path('transactions/', InventoryTransactionAPIView.as_view(), name='inventory-transactions'),
]
