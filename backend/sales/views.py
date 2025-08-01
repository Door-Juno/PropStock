from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from products.models import Product
from sales.models import Sales
from .serializer import SalesSerializer # SalesSerializer 임포트
from datetime import datetime # datetime 임포트 추가

class SalesListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = request.user.store
        print(f"DEBUG: User store for filtering: {store.id} - {store.name}")
        sales_records = Sales.objects.filter(store=store)
        print(f"DEBUG: Initial sales records count for this store: {sales_records.count()}")

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                print(f"DEBUG: Filtering sales records from start_date: {start_date}")
                sales_records = sales_records.filter(date__gte=start_date)
            except ValueError:
                return Response({"error": "Invalid start_date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                print(f"DEBUG: Filtering sales records up to end_date: {end_date}")
                sales_records = sales_records.filter(date__lte=end_date)
            except ValueError:
                return Response({"error": "Invalid end_date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        sales_records = sales_records.order_by('-date')
        serializer = SalesSerializer(sales_records, many=True)
        return Response(serializer.data)

    def post(self, request):
        # 요청 데이터를 복사하여 수정 가능하게 만듦
        data = request.data.copy()
        store_id = request.user.store.id

        # 여러 개의 판매 기록(배열)이 들어오므로, 각 객체에 store_id를 추가
        for item in data:
            item['store'] = store_id

        serializer = SalesSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save() # Serializer의 save가 각 객체의 create를 호출
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SalesBulkUploadAPIView(APIView):  # 기존 salesupload 이름을 변경
    permission_classes = [IsAuthenticated]
        
    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"message": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(uploaded_file)
            else:
                return Response({"message": "Unsupported file format."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": f"Failed to read file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        total_rows = len(df)
        processed_rows = 0
        errors = []

        # 중복 제거된 item_code 수집
        item_codes = df['item_code'].unique()
        # DB에 존재하는 item_code만 가져옴
        existing_codes = set(
            Product.objects.filter(item_code__in=item_codes).values_list('item_code', flat=True)
        )

        for idx, row in df.iterrows():
            try:
                # 날짜 변환
                date = pd.to_datetime(row['date'], format='%Y-%m-%d').date()

                item_code = row['item_code']
                if item_code not in existing_codes:
                    raise ValueError(f"Item code '{item_code}' not found in database")

                item = Product.objects.get(item_code=item_code)

                # DB 저장
                Sales.objects.create(
                    store=request.user.store, # store 정보 추가
                    date=date,
                    item=item,
                    quantity=int(row['quantity']),
                    selling_price=float(row['selling_price']),
                    cost_price=float(row['cost_price']),
                    is_event_day=bool(row['is_event_day'])
                )

                processed_rows += 1

            except Exception as e:
                errors.append({
                    "row": idx + 2,  # 헤더 고려
                    "message": str(e)
                })

        return Response({
            "message": "Sales data uploaded successfully.",
            "total_rows": total_rows,
            "processed_rows": processed_rows,
            "failed_rows": total_rows - processed_rows,
            "errors": errors
        }, status=status.HTTP_200_OK)