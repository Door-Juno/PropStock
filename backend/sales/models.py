from django.db import models, transaction
from products.models import Product
from users.models import Store

class Sales(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, null=True) # 마이그레이션을 위해 임시로 null 허용
    item = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateField()
    quantity = models.IntegerField()
    selling_price = models.IntegerField(default=0)
    cost_price = models.IntegerField(default=0)
    is_event_day = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # 데이터베이스 트랜잭션으로 원자성 보장
        with transaction.atomic():
            if self.pk is None:  
                self.item.current_stock -= self.quantity
                self.item.save()
            
            # 원래의 save() 메서드 호출
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} - {self.item.name} ({self.quantity})"