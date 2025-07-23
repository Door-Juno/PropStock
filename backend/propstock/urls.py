
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products', include('products.urls')), #products 앱 URL을 프로젝트에 연결
    path('api/auth/', include('users.urls')),

    path('api/schema/',SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'),name='swagger-ui'),
    path('api/sales/', include('sales.urls')),

]


