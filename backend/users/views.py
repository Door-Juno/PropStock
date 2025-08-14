from rest_framework import generics, status
from rest_framework.response import Response
from .serializer import (
    RegisterSerializer, 
    UserSerializer, 
    MyTokenObtainPairSerializer, 
    StoreSerializer,
    PasswordChangeSerializer,
    EmailChangeSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema

User = get_user_model()

@extend_schema(tags=['Auth'])
class RegisterView(generics.CreateAPIView):
    """회원가입 API"""
    serializer_class = RegisterSerializer

@extend_schema(tags=['Auth'])
class CustomTokenObtainPairView(TokenObtainPairView):
    """로그인 (JWT 토큰 발급) API"""
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if hasattr(self, 'user') and self.user:
            response.data['user'] = UserSerializer(self.user).data
        return response

@extend_schema(tags=['Users'])
class CurrentUserView(generics.RetrieveAPIView):
    """현재 로그인된 사용자 정보 조회 API"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

@extend_schema(tags=['Users'])
class StoreUpdateView(generics.RetrieveUpdateAPIView):
    """가게 정보 조회 및 수정 API"""
    serializer_class = StoreSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # APIView가 아니라 generics.RetrieveUpdateAPIView를 사용하므로, 
        # user.store를 직접 반환해야 합니다.
        return self.request.user.store

@extend_schema(tags=['Users'])
class PasswordChangeView(APIView):
    """비밀번호 변경 API"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PasswordChangeSerializer,
        responses={
            200: {'description': '비밀번호가 성공적으로 변경되었습니다.'},
            400: {'description': '입력값 오류'}
        }
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']

            if not user.check_password(old_password):
                return Response({"old_password": ["이전 비밀번호가 올바르지 않습니다."]}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({"message": "비밀번호가 성공적으로 변경되었습니다."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Users'])
class EmailChangeView(APIView):
    """이메일 변경 API"""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=EmailChangeSerializer,
        responses={
            200: {'description': '이메일 주소가 성공적으로 변경되었습니다.'},
            400: {'description': '이미 사용 중인 이메일'}
        }
    )
    def post(self, request):
        serializer = EmailChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            new_email = serializer.validated_data['new_email']

            if User.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"new_email": ["이미 사용 중인 이메일 주소입니다."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.email = new_email
            user.save()
            return Response({"message": "이메일 주소가 성공적으로 변경되었습니다."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)