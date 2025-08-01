from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum, F
from sales.models import Sales
from products.models import Product
from datetime import date, timedelta

class SummaryReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        store = request.user.store
        today = date.today()
        
        # 월간 총 수입 (예시: 이번 달 1일부터 오늘까지)
        start_of_month = today.replace(day=1)
        monthly_sales = Sales.objects.filter(
            store=store,
            date__gte=start_of_month,
            date__lte=today
        ).aggregate(total_revenue=Sum(F('quantity') * F('selling_price')))
        
        total_monthly_revenue = monthly_sales['total_revenue'] if monthly_sales['total_revenue'] else 0

        # 가장 많이 팔린 품목 (예시: 지난 7일간)
        last_7_days = today - timedelta(days=7)
        top_selling_products = Sales.objects.filter(
            store=store,
            date__gte=last_7_days,
            date__lte=today
        ).values('item__name').annotate(total_quantity=Sum('quantity')).order_by('-total_quantity')[:3]

        # 평균 판매량 (예시: 지난 30일간 일일 평균)
        last_30_days = today - timedelta(days=30)
        daily_sales_counts = Sales.objects.filter(
            store=store,
            date__gte=last_30_days,
            date__lte=today
        ).values('date').annotate(daily_total_sales=Sum('quantity'))
        
        average_daily_sales = daily_sales_counts.aggregate(avg_sales=Sum('daily_total_sales'))['avg_sales']
        if daily_sales_counts.count() > 0:
            average_daily_sales = average_daily_sales / daily_sales_counts.count()
        else:
            average_daily_sales = 0

        return Response({
            "total_monthly_revenue": total_monthly_revenue,
            "top_selling_products": list(top_selling_products),
            "average_daily_sales": round(average_daily_sales, 2)
        }, status=status.HTTP_200_OK)

class SalesTrendReportAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        store = request.user.store
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str or not end_date_str:
            return Response({"detail": "start_date와 end_date는 필수 쿼리 파라미터입니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            start_date = date.fromisoformat(start_date_str)
            end_date = date.fromisoformat(end_date_str)
        except ValueError:
            return Response({"detail": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 일별 판매량 및 매출액 추이
        sales_trend = Sales.objects.filter(
            store=store,
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('selling_price'))
        ).order_by('date')

        return Response(list(sales_trend), status=status.HTTP_200_OK)