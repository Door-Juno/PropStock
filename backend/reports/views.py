
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from sales.models import Sales
from inventory.models import InventoryTransaction # InventoryTransaction 모델 임포트
from products.models import Product # Product 모델 임포트
from django.db.models import Sum, F, ExpressionWrapper, fields, Avg
from django.db.models.functions import Trunc
from datetime import datetime, timedelta

class SummaryReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = request.user.store
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        sales_in_period = Sales.objects.filter(store=store, date__range=[start_date, end_date])
        total_summary = sales_in_period.aggregate(
            total_revenue=Sum(F('quantity') * F('selling_price')),
            total_profit=Sum(F('quantity') * (F('selling_price') - F('cost_price')))
        )
        total_quantity_agg = sales_in_period.aggregate(total_quantity=Sum('quantity'))
        summary_data = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'total_revenue': total_summary['total_revenue'] or 0,
            'total_profit': total_summary['total_profit'] or 0,
            'total_quantity': total_quantity_agg['total_quantity'] or 0,
        }
        return Response(summary_data, status=status.HTTP_200_OK)

class SalesTrendAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = request.user.store
        end_date_str = request.query_params.get('end_date', datetime.now().date().strftime('%Y-%m-%d'))
        start_date_str = request.query_params.get('start_date', (datetime.now().date() - timedelta(days=7)).strftime('%Y-%m-%d'))
        agg_unit = request.query_params.get('aggregation_unit', 'day')
        if agg_unit not in ['day', 'week', 'month']:
            agg_unit = 'day'
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Please use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        
        trunc_field = Trunc('date', agg_unit, output_field=fields.DateField())
        sales_trend = Sales.objects.filter(store=store, date__range=[start_date, end_date])            .annotate(period=trunc_field).values('period')            .annotate(total_quantity=Sum('quantity'), total_revenue=Sum(F('quantity') * F('selling_price'))).order_by('period')
        
        trend_data = [{
            'date': item['period'].strftime('%Y-%m-%d'),
            'total_sales_quantity': item['total_quantity'],
            'total_revenue': item['total_revenue']
        } for item in sales_trend]
        return Response(trend_data, status=status.HTTP_200_OK)

class InventoryTurnoverAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = request.user.store
        products = Product.objects.filter(store=store)
        report = []
        for product in products:
            # 단순화를 위해 현재 재고를 평균 재고로 가정
            # 더 정확한 계산을 위해서는 특정 기간의 평균 재고를 계산해야 함
            total_sales = Sales.objects.filter(item=product).aggregate(total=Sum('quantity'))['total'] or 0
            avg_stock = product.current_stock # 단순화된 가정
            turnover_rate = total_sales / avg_stock if avg_stock > 0 else 0
            report.append({
                'item_code': product.item_code,
                'item_name': product.name,
                'turnover_rate': round(turnover_rate, 2),
                'average_days_in_stock': round(365 / turnover_rate, 1) if turnover_rate > 0 else 'N/A'
            })
        return Response(report, status=status.HTTP_200_OK)

class CostSavingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        store = request.user.store
        # 재고 조정 내역 중 '폐기'(waste) 또는 '손실'(loss) 등 부정적인 조정을 집계
        # 여기서는 notes 필드에 '폐기'가 포함된 경우로 가정
        waste_transactions = InventoryTransaction.objects.filter(
            product__store=store, 
            type='out', 
            notes__icontains='폐기'
        )
        
        total_waste_cost = waste_transactions.aggregate(
            total_cost=Sum(F('quantity') * F('product__cost_price'))
        )['total_cost'] or 0

        report = {
            'total_waste_cost': total_waste_cost,
            'message': '향후 솔루션 도입 전/후 데이터 비교 기능이 추가될 예정입니다.'
        }
        return Response(report, status=status.HTTP_200_OK)
