from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import InventoryTransactionSerializer, ProductStatusSerializer # ProductStatusSerializer 추가
from products.models import Product # Product 모델 임포트

class InventoryTransactionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # 현재 인증된 사용자의 store 정보를 가져옵니다.
        try:
            store = request.user.store
        except AttributeError:
            return Response({"detail": "User has no associated store."}, status=status.HTTP_400_BAD_REQUEST)

        # 요청 데이터에 store 정보를 추가합니다.
        data = request.data.copy()
        data['store'] = store.id

        serializer = InventoryTransactionSerializer(data=data)
        if serializer.is_valid():
            # serializer.save()가 호출될 때, create 메소드에서 store 객체를 사용합니다.
            serializer.save(store=store)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InventoryStatusAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        store = request.user.store
        products = Product.objects.filter(store=store)
        
        serializer = ProductStatusSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)