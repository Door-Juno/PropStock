# accounts/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model() # 현재 활성화된 User 모델을 가져옵니다.

class UserRegisterSerializer(serializers.ModelSerializer): #restframework의 기본 모델 시리얼라이저 상속
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {'write_only': True}, # 응답에 비밀번호가 포함되지 않도록 설정
        }

    def validate(self, data):
        # 비밀번호와 비밀번호 확인이 일치하는지 검사
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "비밀번호와 비밀번호 확인이 일치하지 않습니다."})
        return data

    def create(self, validated_data):
        # User 모델 생성
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'] # create_user는 비밀번호를 자동으로 해싱합니다.
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # 명세에 따라 'username' 대신 'id' 필드를 사용
    id = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 기본 'username' 필드를 제거하거나 사용하지 않도록 설정
        # self.fields.pop('username', None) # 필요에 따라 기본 username 필드를 제거할 수 있음

    def validate(self, attrs):
        # 요청 받은 'id' 값을 실제 사용자 모델의 USERNAME_FIELD에 매핑
        # 우리 User 모델의 USERNAME_FIELD가 'email'이므로, 'id'는 곧 이메일을 의미합니다.
        attrs[self.username_field] = attrs.pop('id') # 'id'를 제거하고 'email' (username_field)에 할당

        # 상위 클래스의 validate 메서드를 호출하여 실제 인증 처리
        # 이 시점에서 attrs에는 'email'과 'password'가 들어있습니다.
        data = super().validate(attrs)

        # 여기에 추가적인 커스텀 데이터를 응답에 포함시킬 수 있습니다.
        # 예: data['user_id'] = self.user.id
        # 예: data['email'] = self.user.email

        return data