from django.db import models
from users.models import Store
from products.models import Product

class PredictionResult(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    prediction_date = models.DateField()
    predicted_sales_quantity = models.IntegerField()
    # 예측 결과의 신뢰도 점수 (0.0 ~ 1.0 사이의 값)
    confidence_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('store', 'product', 'prediction_date')

    def __str__(self):
        return f"[{self.prediction_date}] {self.product.name} 예측: {self.predicted_sales_quantity}"