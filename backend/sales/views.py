

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics
from products.models import Product
from sales.models import Sales
from .serializer import (
    SalesSerializer, FileUploadSerializer, SalesBulkUploadResponseSerializer
)
from datetime import datetime
import pandas as pd
from django.http import FileResponse
import os
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema(tags=['Sales'])
class SalesListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="판매 기록 목록 조회",
        description="사용자의 가게에 대한 판매 기록을 날짜별로 필터링하여 조회합니다.",
        parameters=[
            OpenApiParameter(name='start_date', description='조회 시작일 (YYYY-MM-DD)', type=OpenApiTypes.DATE),
            OpenApiParameter(name='end_date', description='조회 종료일 (YYYY-MM-DD)', type=OpenApiTypes.DATE),
        ],
        responses=SalesSerializer(many=True)
    )
    def get(self, request):
        store = request.user.store
        sales_records = Sales.objects.filter(store=store)

        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                sales_records = sales_records.filter(date__gte=start_date)
            except ValueError:
                return Response({"error": "Invalid start_date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if end_date_str:
            try:
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                sales_records = sales_records.filter(date__lte=end_date)
            except ValueError:
                return Response({"error": "Invalid end_date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        sales_records = sales_records.order_by('-date')
        serializer = SalesSerializer(sales_records, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="판매 기록 수동 생성",
        description="하나 이상의 판매 기록을 수동으로 생성합니다.",
        request=SalesSerializer(many=True),
        responses={201: SalesSerializer(many=True)}
    )
    def post(self, request):
        data = request.data.copy()
        store_id = request.user.store.id

        for item in data:
            item['store'] = store_id

        serializer = SalesSerializer(data=data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(tags=['Sales'])
class SalesRecordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sales.objects.all()
    serializer_class = SalesSerializer
    permission_classes = [IsAuthenticated]
    summary="개별 판매 기록 조회/수정/삭제"

    def get_queryset(self):
        return self.queryset.filter(store=self.request.user.store)

@extend_schema(tags=['Sales'])
class SalesBulkUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]
        
    @extend_schema(
        summary="판매 기록 일괄 업로드 (CSV/Excel)",
        request=FileUploadSerializer,
        responses={200: SalesBulkUploadResponseSerializer}
    )
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

        required_columns = ['date', 'item_code', 'quantity', 'is_event_day']
        if not all(col in df.columns for col in required_columns):
            return Response({"message": f"필수 컬럼이 누락되었습니다. 다음 컬럼이 필요합니다: {required_columns}"}, status=status.HTTP_400_BAD_REQUEST)

        total_rows = len(df)
        processed_rows = 0
        errors = []

        item_codes_in_file = df['item_code'].unique()
        products_map = {p.item_code: p for p in Product.objects.filter(store=request.user.store, item_code__in=item_codes_in_file)}

        for idx, row in df.iterrows():
            try:
                record_date = pd.to_datetime(row['date']).date()
                item_code = str(row['item_code'])
                if item_code not in products_map:
                    raise ValueError(f"Item code '{item_code}' (행 {idx + 2})가 데이터베이스에 없거나 해당 가게에 속하지 않습니다.")

                product_obj = products_map[item_code]
                quantity = int(row['quantity'])
                
                if quantity <= 0:
                    processed_rows += 1
                    continue

                is_event_day = bool(row['is_event_day'])

                Sales.objects.create(
                    store=request.user.store,
                    date=record_date,
                    item=product_obj,
                    quantity=quantity,
                    selling_price=product_obj.selling_price,
                    cost_price=product_obj.cost_price,
                    is_event_day=is_event_day
                )
                processed_rows += 1
            except Exception as e:
                errors.append({"row_number": idx + 2, "message": str(e)})

        return Response({
            "message": "Sales data uploaded successfully.",
            "total_rows": total_rows,
            "processed_rows": processed_rows,
            "failed_rows": total_rows - processed_rows,
            "errors": errors
        }, status=status.HTTP_200_OK)

@extend_schema(tags=['Sales'])
class SalesTemplateDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="판매 기록 업로드용 템플릿 다운로드",
        responses={
            200: {
                'content': {'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {'schema': {'type': 'string', 'format': 'binary'}}},
                'description': '판매 기록 업로드용 Excel 템플릿 파일'
            }
        }
    )
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


