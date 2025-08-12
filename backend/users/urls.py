from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, CurrentUserView, StoreUpdateView, PasswordChangeView, EmailChangeView
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('store/', StoreUpdateView.as_view(), name='store_update'),
    path('password-change/', PasswordChangeView.as_view(), name='password_change'),
    path('email-change/', EmailChangeView.as_view(), name='email_change'),
]
