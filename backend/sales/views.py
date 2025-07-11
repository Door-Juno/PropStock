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

        try: #파일 읽는중 오류 발생 -> 중간에 멈추지 않게 하려고 예외 처리 시작!
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(uploaded_file)
            else:
                return Response({"message": "Unsupported file format."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e: # 파일 읽기 실페,손상,형식 오류 등이 나면 잡아내는 부분
            return Response({"message": f"Failed to read file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        total_rows = len(df)
        processed_rows = 0
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # 날짜 형식 확인(ex.2025-07-12)
                pd.to_datetime(row['date'], format='%Y-%m-%d')

                # 상품 코드가 DB에 있는지 확인
                item_code = row['item_code']
                if not Product.objects.filter(item_code=item_code).exists():
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

