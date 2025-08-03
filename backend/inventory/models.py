from django.db import models
from users.models import Store
from products.models import Product
from datetime import date

# 재고 변동(입고, 출고) 내역을 기록하는 모델입니다.
class InventoryTransaction(models.Model):
    # 어떤 상점(Store)의 재고 변동인지 구분하기 위한 외래 키
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    # 어떤 품목(Product)의 재고 변동인지 구분하기 위한 외래 키
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # 거래가 발생한 날짜
    transaction_date = models.DateField(default=date.today)
    # 거래 유형: 'in'은 입고, 'out'은 판매 외 출고(폐기, 손실 등)
    type = models.CharField(max_length=10, choices=[('in', '입고'), ('out', '출고')])
    # 거래된 수량
    quantity = models.IntegerField()
    # 비고 (예: '주문 입고', '유통기한 만료로 인한 폐기')
    notes = models.CharField(max_length=255, blank=True, null=True)
    # 레코드가 생성된 시간 (자동으로 현재 시간 기록)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # 관리자 페이지 등에서 표시될 객체 이름 형식
        return f"[{self.date}] {self.product.name} - {self.get_type_display()}: {self.quantity}"