
from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer): #모델 <-> JSON 변환
    class Meta:
        model = Product
        fields = '__all__'  # 모든 필드 포함
