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
        return self.request.user


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_new_password = request.data.get('confirm_new_password')

        if not user.check_password(old_password):
            return Response({"old_password": ["이전 비밀번호가 올바르지 않습니다."]}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({"new_password": ["새 비밀번호가 일치하지 않습니다."]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "비밀번호가 성공적으로 변경되었습니다."}, status=status.HTTP_200_OK)

class EmailChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')

        if User.objects.filter(email=new_email).exclude(id=user.id).exists():
            return Response({"new_email": ["이미 사용 중인 이메일 주소입니다."]}, status=status.HTTP_400_BAD_REQUEST)
        
        user.email = new_email
        user.save()
        return Response({"message": "이메일 주소가 성공적으로 변경되었습니다."}, status=status.HTTP_200_OK)

