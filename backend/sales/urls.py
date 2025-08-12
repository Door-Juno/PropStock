from django.urls import path
from .views import SalesListCreateAPIView, SalesBulkUploadAPIView, SalesRecordDetailAPIView, SalesTemplateDownloadAPIView

urlpatterns = [
    path('records/', SalesListCreateAPIView.as_view(), name='sales-records-list'),
    path('records/<int:pk>/', SalesRecordDetailAPIView.as_view(), name='sales-record-detail'),
    path('bulk-upload/', SalesBulkUploadAPIView.as_view(), name='sales-bulk-upload'),
    path('template/download/', SalesTemplateDownloadAPIView.as_view(), name='sales-template-download'),
]
