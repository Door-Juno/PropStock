from django.db import models
from products.models import Product
from users.models import Store

class Sales(models.Model):
    # 어떤 상점(Store)에서 발생한 판매인지 구분하기 위한 외래 키
    store = models.ForeignKey(Store, on_delete=models.CASCADE, null=True) # 마이그레이션을 위해 임시로 null 허용
    # 판매된 품목(Product) 정보
    item = models.ForeignKey(Product, on_delete=models.CASCADE)
    # 판매가 이루어진 날짜
    date = models.DateField()
    # 판매된 수량
    quantity = models.IntegerField()
    # 판매 시점의 개당 판매가 (수익 분석 및 통계용)
    selling_price = models.IntegerField(default=0)
    # 판매 시점의 개당 원가 (수익 분석 및 통계용)
    cost_price = models.IntegerField(default=0)
    # AI 학습 시 중요한 변수가 될 수 있는 행사일 여부
    is_event_day = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.date} - {self.item.name} ({self.quantity})"