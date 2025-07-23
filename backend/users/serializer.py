from rest_framework import serializers
from .models import User, Store
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email

        return token

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    store = StoreSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'store']

class RegisterSerializer(serializers.ModelSerializer):
    store = StoreSerializer()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'store']

    def create(self, validated_data):
        store_data = validated_data.pop('store')
        store = Store.objects.create(**store_data)
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            store=store
        )
        return user
