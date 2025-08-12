from django.db import models, transaction
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

    def save(self, *args, **kwargs):
        # 데이터베이스 트랜잭션으로 원자성 보장
        with transaction.atomic():
            # 재고 차감 로직 (새로운 판매 기록일 때만 실행)
            if self.pk is None:  # 새로운 객체가 생성될 때
                # 연결된 상품의 재고를 가져와서 판매 수량만큼 차감
                self.item.current_stock -= self.quantity
                self.item.save()
            
            # 원래의 save() 메서드 호출
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} - {self.item.name} ({self.quantity})"