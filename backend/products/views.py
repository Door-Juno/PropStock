from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions # permissions 임포트
from .models import Product
from .serializer import ProductSerializer
from django.shortcuts import get_object_or_404

class ProductListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated] # 권한 추가
    serializer_class = ProductSerializer

    def get(self, request): #품목 목록 확인
        store = request.user.store # 현재 사용자의 store 가져오기
        search = request.query_params.get('search', '')
        products = Product.objects.filter(store=store, name__icontains=search) # store 기준으로 필터링
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request): #품목 등록
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(store=request.user.store) # store 자동 할당
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated] # 권한 추가
    serializer_class = ProductSerializer

    def get_object(self, pk, user): # user 인자 추가
        # 해당 사용자의 store에 속한 품목만 가져오도록 필터링
        return get_object_or_404(Product, pk=pk, store=user.store)

    def get(self, request, pk):
        product = self.get_object(pk, request.user) # user 인자 전달
        serializer = ProductSerializer(product) # 객체 -> 직렬화(JSON처럼 변환하기위해)
        return Response(serializer.data) #직렬화된 데이터를 HTTP응답으로 보냄

    def put(self, request, pk): #전체 수정
        product = self.get_object(pk, request.user) # user 인자 전달
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save() # store는 이미 할당되어 있으므로 다시 할당할 필요 없음
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk): #일부 수정
        product = self.get_object(pk, request.user) # user 인자 전달
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk): #품목 삭제
        product = self.get_object(pk, request.user) # user 인자 전달
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)