from django.urls import path
from .views import SalesListCreateAPIView, SalesBulkUploadAPIView

urlpatterns = [
    path('records/', SalesListCreateAPIView.as_view(), name='sales-records'),
    path('bulk-upload/', SalesBulkUploadAPIView.as_view(), name='sales-bulk-upload'),
]
