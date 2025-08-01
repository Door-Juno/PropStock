from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import InventoryTransactionSerializer, ProductStatusSerializer # ProductStatusSerializer 추가
from products.models import Product # Product 모델 임포트
from .models import InventoryTransaction # InventoryTransaction 모델 임포트
from datetime import datetime

class InventoryTransactionAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        store = request.user.store
        transactions = InventoryTransaction.objects.filter(product__store=store).order_by('-date', '-id')

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        transaction_type = request.query_params.get('type')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                transactions = transactions.filter(date__gte=start_date)
            except ValueError:
                return Response({"error": "Invalid start_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                transactions = transactions.filter(date__lte=end_date)
            except ValueError:
                return Response({"error": "Invalid end_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if transaction_type:
            if transaction_type not in ['in', 'out']:
                return Response({"error": "Invalid type. Use 'in' or 'out'."}, status=status.HTTP_400_BAD_REQUEST)
            transactions = transactions.filter(type=transaction_type)

        serializer = InventoryTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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