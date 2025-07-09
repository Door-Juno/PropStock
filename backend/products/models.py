from django.db import models

class Product(models.Model):
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
