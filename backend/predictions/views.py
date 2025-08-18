from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from products.models import Product
import requests
import os
from datetime import date, timedelta
from .serializers import SalesForecastSerializer, OrderRecommendationSerializer

def _get_ai_predictions(store, predict_date):
    """AI 예측 서버로부터 품목별 판매량 예측을 가져오는 헬퍼 함수"""
    products = Product.objects.filter(store=store)
    if not products.exists():
        return {}, {"detail": "해당 가게에 등록된 품목이 없습니다."}, status.HTTP_404_NOT_FOUND
    
    product_codes = [p.id for p in products] 

    ai_request_data = {
        "store_id": store.id, 
        "predict_date": predict_date.strftime("%Y-%m-%d"),
        "product_codes": product_codes,
        "is_event_day": 1
    }

    ai_service_url = os.environ.get("AI_SERVICE_URL", "http://ai_service:8001/predict_sales/")
    
    print(f"DEBUG: AI Request Data: {ai_request_data}")
    try:
        response = requests.post(ai_service_url, json=ai_request_data, timeout=10)
        response.raise_for_status()
        ai_data = response.json()
       
    except requests.exceptions.RequestException as e:
        return {}, {"detail": f"AI 예측 서버 연결에 실패했습니다: {e}"}, status.HTTP_503_SERVICE_UNAVAILABLE

    predictions_map = {str(pred['product_code']): pred['predicted_quantity'] for pred in ai_data.get('predictions', [])}
    product_map = {p.id: p for p in products}
    return predictions_map, product_map, None

class SalesForecastAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SalesForecastSerializer

    def get(self, request):
        store = request.user.store
        predict_date = date.today() + timedelta(days=1) # 내일 예측

        predictions_map, product_map, error_response = _get_ai_predictions(store, predict_date)
        if error_response:
            return Response(product_map, error_response)

        results = []
        for product_id, product in product_map.items(): # product_id로 순회
            results.append({
                "product_id": product.id,
                "item_code": product.item_code,
                "name": product.name,
                "current_stock": product.current_stock,
                "predicted_quantity": predictions_map.get(str(product_id), 0) # 예측 실패 시 0으로 처리
            })

        return Response(results, status=status.HTTP_200_OK)

class OrderRecommendationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderRecommendationSerializer

    def get(self, request):
        store = request.user.store
        
        predict_date = date.today() + timedelta(days=1) 
        predictions_map, product_map, error_response = _get_ai_predictions(store, predict_date)
        if error_response:
            return Response(product_map, error_response)

        recommendations = []
        for product_id, product in product_map.items(): # product_id로 순회
            predicted_sales_tomorrow = predictions_map.get(str(product_id), 0) # 내일 예측 판매량
            
            # 예상 재고 소진일 계산
            stock_out_estimate_date = None
            if predicted_sales_tomorrow > 0: 
                days_until_stock_out = product.current_stock / predicted_sales_tomorrow
                stock_out_estimate_date = (date.today() + timedelta(days=days_until_stock_out)).strftime("%Y-%m-%d")
            elif product.current_stock <= 0: 
                stock_out_estimate_date = date.today().strftime("%Y-%m-%d")

            predicted_demand_during_lead_time = predicted_sales_tomorrow * product.lead_time
            required_stock_for_period = predicted_demand_during_lead_time + product.safety_stock
            recommended_quantity = max(0, required_stock_for_period - product.current_stock)

            # 권장 발주 시점 계산
            order_by_date = None
            if stock_out_estimate_date:
                # 예상 소진일 - 리드 타임 = 발주해야 할 날짜
                order_by_date_obj = date.fromisoformat(stock_out_estimate_date) - timedelta(days=product.lead_time)
                # 발주 시점이 오늘 이전이면 오늘로 설정 (과거로 발주할 수 없으므로)
                order_by_date = max(date.today(), order_by_date_obj).strftime("%Y-%m-%d")
            
            # 재고 부족 또는 추천 발주량이 0보다 큰 경우에만 추천
            if product.current_stock < product.min_stock or recommended_quantity > 0:
                recommendations.append({
                    "item_code": product.item_code,
                    "item_name": product.name,
                    "current_stock": product.current_stock,
                    "predicted_sales_next_day": predicted_sales_tomorrow,
                    "stock_out_estimate_date": stock_out_estimate_date,
                    "recommended_order_quantity": round(recommended_quantity), # 정수로 반올림
                    "order_by_date": order_by_date,
                    "reason": "재고 부족 또는 예측 수요 발생"
                })
        
        return Response(recommendations, status=status.HTTP_200_OK)
