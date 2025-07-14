from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializer import ProductSerializer
from django.shortcuts import get_object_or_404

class ProductListCreateAPIView(APIView):
    serializer_class = ProductSerializer
    def get(self, request): #품목 목록 확인
        search = request.query_params.get('search', '')
        products = Product.objects.filter(name__icontains=search)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request): #품목 등록
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(APIView):
    serializer_class = ProductSerializer
    def get_object(self, pk): #DB에서 pk 기준으로 product 객체 가져옴
        return get_object_or_404(Product, pk=pk) #해당 id 없을 시 error

    def get(self, request, pk):
        product = self.get_object(pk)
        serializer = ProductSerializer(product) # 객체 -> 직렬화(JSON처럼 변환하기위해)
        return Response(serializer.data) #직렬화된 데이터를 HTTP응답으로 보냄

    def put(self, request, pk): #전체 수정
        product = self.get_object(pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk): #일부 수정
        product = self.get_object(pk)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk): #품목 삭제
        product = self.get_object(pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



