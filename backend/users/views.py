from rest_framework import generics, status
from rest_framework.response import Response
from .serializer import RegisterSerializer, UserSerializer, MyTokenObtainPairSerializer, StoreSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # super().post() 호출 후에 self.user에 접근
        if hasattr(self, 'user') and self.user:
            response.data['user'] = UserSerializer(self.user).data
        return response

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class StoreUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.store
