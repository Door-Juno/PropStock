from django.shortcuts import render
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from products.models import Product


class salesupload(APIView):  
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

        item_codes = df['item_code'].unique() #전체 item_code 수집,unique() 중복 제거

        existing_codes = set(
            Product.objects.filter(item_code__in=item_codes).values_list('item_code', flat=True)
        ) # 한 번의 쿼리로 DB에 있는 item_code만 가져오기
        
        for idx, row in df.iterrows(): #반복문에서는 DB조회 대신 파이썬에서 검사
            try:
                pd.to_datetime(row['date'], format='%Y-%m-%d')

                item_code = row['item_code']
                if item_code not in existing_codes:
                    raise ValueError(f"Item code '{item_code}' not found in database")

                processed_rows += 1

            except Exception as e:
                errors.append({
                    "row": idx + 2,  # 헤더 고려해서 +2
                    "message": str(e)
                })

        return Response({
            "message": "Sales data uploaded successfully.",
            "total_rows": total_rows,
            "processed_rows": processed_rows,
            "failed_rows": total_rows - processed_rows,
            "errors": errors
        }, status=status.HTTP_200_OK)
