from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from products.models import Product
import requests
import os
from datetime import date, timedelta

class SalesForecastAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. 현재 인증된 사용자의 가게(store)에 속한 모든 품목을 가져옵니다.
        try:
            store = request.user.store
            products = Product.objects.filter(store=store)
            if not products.exists():
                return Response({"detail": "해당 가게에 등록된 품목이 없습니다."}, status=status.HTTP_404_NOT_FOUND)
            
            product_codes = [p.item_code for p in products]

        except AttributeError:
            return Response({"detail": "사용자에게 할당된 가게가 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. AI 예측 서버에 보낼 데이터를 준비합니다.
        # 예측은 내일 날짜를 기준으로 합니다.
        predict_date = date.today() + timedelta(days=1)
        ai_request_data = {
            "predict_date": predict_date.strftime("%Y-%m-%d"),
            "product_codes": product_codes
        }

        # 3. AI 서비스에 내부 API 요청을 보냅니다.
        ai_service_url = os.environ.get("AI_SERVICE_URL", "http://ai_service:8001/predict_sales/")
        
        try:
            response = requests.post(ai_service_url, json=ai_request_data, timeout=10)
            response.raise_for_status()  # 2xx 응답이 아니면 예외 발생
            ai_data = response.json()

        except requests.exceptions.RequestException as e:
            return Response({"detail": f"AI 예측 서버 연결에 실패했습니다: {e}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # 4. AI 예측 결과를 프론트엔드에 맞게 가공합니다.
        # 품목 정보와 예측 결과를 결합합니다.
        product_map = {p.item_code: p for p in products}
        predictions_map = {pred['product_code']: pred['predicted_quantity'] for pred in ai_data.get('predictions', [])}

        results = []
        for code, product in product_map.items():
            results.append({
                "product_id": product.id,
                "item_code": product.item_code,
                "name": product.name,
                "current_stock": product.current_stock,
                "predicted_quantity": predictions_map.get(code, 0) # 예측 실패 시 0으로 처리
            })

        return Response(results, status=status.HTTP_200_OK)

class OrderRecommendationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        store = request.user.store
        recommendations = []
        products = Product.objects.filter(store=store)
        
        # AI 예측 결과를 가져오는 로직 (SalesForecastAPIView와 유사)
        # 여기서는 간단히 SalesForecastAPIView의 로직을 재활용하거나,
        # 별도의 함수로 분리하여 AI 예측 결과를 가져와 사용해야 합니다.
        # 편의상 여기서는 더미 예측 데이터를 사용합니다.
        
        for product in products:
            # 더미 예측 수량 (실제로는 AI 예측 결과 사용)
            predicted_sales_next_7days = 50 # 예시
            
            if product.current_stock < product.min_stock and predicted_sales_next_7days > 0:
                recommended_quantity = product.min_stock + predicted_sales_next_7days - product.current_stock
                recommendations.append({
                    "item_code": product.item_code,
                    "item_name": product.name,
                    "current_stock": product.current_stock,
                    "predicted_sales_next_7days": predicted_sales_next_7days,
                    "recommended_order_quantity": recommended_quantity,
                    "order_by_date": (date.today() + timedelta(days=product.lead_time)).strftime("%Y-%m-%d"),
                    "reason": "재고 부족 및 예측 수요 발생"
                })
        
        return Response(recommendations, status=status.HTTP_200_OK)
