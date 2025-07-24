# store/urls.py

from django.urls import path
from .views import StoreRetrieveUpdateView

urlpatterns = [
    
    path('<int:pk>/', StoreRetrieveUpdateView.as_view(), name='store-detail'),
]