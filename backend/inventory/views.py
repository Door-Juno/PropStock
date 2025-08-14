from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import InventoryTransactionSerializer, ProductStatusSerializer
from products.models import Product
from .models import InventoryTransaction
from datetime import datetime
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema(tags=['Inventory'])
class InventoryTransactionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="재고 변동 내역 조회",
        parameters=[
            OpenApiParameter(name='start_date', description='조회 시작일 (YYYY-MM-DD)', type=OpenApiTypes.DATE),
            OpenApiParameter(name='end_date', description='조회 종료일 (YYYY-MM-DD)', type=OpenApiTypes.DATE),
            OpenApiParameter(name='type', description="거래 유형 ('in' 또는 'out')", type=OpenApiTypes.STR),
        ],
        responses=InventoryTransactionSerializer(many=True)
    )
    def get(self, request):
        store = request.user.store
        transactions = InventoryTransaction.objects.filter(product__store=store).order_by('-transaction_date', '-id')

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                transactions = transactions.filter(transaction_date__gte=start_date)
            except ValueError:
                return Response({"error": "Invalid start_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                transactions = transactions.filter(transaction_date__lte=end_date)
            except ValueError:
                return Response({"error": "Invalid end_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if transaction_type:
            if transaction_type not in ['in', 'out']:
                return Response({"error": "Invalid type. Use 'in' or 'out'."}, status=status.HTTP_400_BAD_REQUEST)
            transactions = transactions.filter(type=transaction_type)

        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="재고 변동 기록 생성 (입고/출고)",
        request=InventoryTransactionSerializer,
        responses={201: InventoryTransactionSerializer}
    )
    def post(self, request):
        try:
            store = request.user.store
        except AttributeError:
            return Response({"detail": "User has no associated store."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        serializer = InventoryTransactionSerializer(data=data)
        if serializer.is_valid():
            # Serializer의 save 메소드에 store 객체를 전달하여 컨텍스트를 제공
            serializer.save(store=store)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Inventory'])
class InventoryStatusAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="현재 재고 현황 조회",
        description="모든 품목의 현재 재고와 그 상태(정상, 부족, 과잉)를 조회합니다.",
        responses=ProductStatusSerializer(many=True)
    )
    def get(self, request):
        store = request.user.store
        products = Product.objects.filter(store=store)
        
        serializer = ProductStatusSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
