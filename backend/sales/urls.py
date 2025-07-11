from django.urls import path
from .views import salesupload

urlpatterns = [
    path('upload-sales-data/', salesupload.as_view(), name='upload-sales-data'),

]