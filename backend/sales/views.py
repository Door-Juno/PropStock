from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from products.models import Product
from sales.models import Sales
from .serializer import SalesSerializer # SalesSerializer 임포트
from datetime import datetime # datetime 임포트 추가
import pandas as pd
from django.http import FileResponse # FileResponse 임포트
import os # os 모듈 임포트

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

class SalesRecordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sales.objects.all()
    serializer_class = SalesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # 사용자가 자신의 상점 데이터에만 접근할 수 있도록 필터링
        return self.queryset.filter(store=self.request.user.store)

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

        # 필수 컬럼 확인
        required_columns = ['date', 'item_code', 'quantity', 'is_event_day']
        if not all(col in df.columns for col in required_columns):
            return Response({"message": f"필수 컬럼이 누락되었습니다. 다음 컬럼이 필요합니다: {required_columns}"}, status=status.HTTP_400_BAD_REQUEST)

        total_rows = len(df)
        processed_rows = 0
        errors = []

        # 중복 제거된 item_code 수집
        item_codes_in_file = df['item_code'].unique()
        # DB에 존재하는 item_code와 Product 객체를 매핑
        products_map = {p.item_code: p for p in Product.objects.filter(store=request.user.store, item_code__in=item_codes_in_file)}

        for idx, row in df.iterrows():
            try:
                # 날짜 변환
                record_date = pd.to_datetime(row['date']).date()

                item_code = str(row['item_code'])
                if item_code not in products_map:
                    raise ValueError(f"Item code '{item_code}' (행 {idx + 2})가 데이터베이스에 없거나 해당 가게에 속하지 않습니다.")

                product_obj = products_map[item_code]

                # 판매량 변환
                quantity = int(row['quantity'])
                
                # 판매량이 0보다 큰 경우에만 저장
                if quantity <= 0:
                    processed_rows += 1 # 0인 경우도 처리된 것으로 간주 (오류 아님)
                    continue # 다음 행으로 넘어감

                # is_event_day 변환 (불리언)
                is_event_day = bool(row['is_event_day'])

                # DB 저장
                Sales.objects.create(
                    store=request.user.store,
                    date=record_date,
                    item=product_obj, # Product 객체 전달
                    quantity=quantity,
                    selling_price=product_obj.selling_price, # Product에서 판매가 가져옴
                    cost_price=product_obj.cost_price,     # Product에서 원가 가져옴
                    is_event_day=is_event_day
                )

                processed_rows += 1

            except Exception as e:
                errors.append({
                    "row_number": idx + 2,  # 헤더 고려하여 1부터 시작
                    "message": str(e)
                })

        return Response({
            "message": "Sales data uploaded successfully.",
            "total_rows": total_rows,
            "processed_rows": processed_rows,
            "failed_rows": total_rows - processed_rows,
            "errors": errors
        }, status=status.HTTP_200_OK)

class SalesTemplateDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates', 'sales_upload_template.xlsx')
        
        if not os.path.exists(file_path):
            return Response({"detail": "템플릿 파일을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        try:
            response = FileResponse(open(file_path, 'rb'), as_attachment=True, filename='sales_upload_template.xlsx')
            response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            return response
        except Exception as e:
            return Response({"detail": f"파일을 읽는 중 오류가 발생했습니다: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)