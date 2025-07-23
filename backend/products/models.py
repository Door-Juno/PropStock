from django.db import models
from users.models import Store

class Product(models.Model):
    # 어떤 상점(Store)에 속한 상품인지 구분하기 위한 외래 키입니다.
    # 사용자가 탈퇴하거나 상점 정보가 삭제될 때, 관련된 상품 정보도 함께 삭제됩니다 (on_delete=models.CASCADE).
    store = models.ForeignKey(Store, on_delete=models.CASCADE, null=True) # 마이그레이션을 위해 임시로 null 허용

    item_code = models.CharField(max_length=20, unique=True)  # 품목 코드
    name = models.CharField(max_length=100)                   # 품목명
    unit = models.CharField(max_length=10)                    # 단위(개)
    current_stock = models.IntegerField()                     # 현재 재고량
    min_stock = models.IntegerField()                         # 최소 재고
    safety_stock = models.IntegerField()                      # 안전 재고
    selling_price = models.IntegerField()                     # 판매가
    cost_price = models.IntegerField()                        # 원가
    lead_time = models.IntegerField()                         # 리드 타임 (일 단위)
    last_updated = models.DateTimeField(auto_now=True)        # 최근 수정일 (자동 갱신)

    def __str__(self):
        return f"{self.item_code} - {self.name}"