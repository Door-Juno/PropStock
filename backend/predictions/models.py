from django.db import models
from users.models import Store
from products.models import Product

# AI의 수요 예측 결과를 저장하는 모델입니다.
class PredictionResult(models.Model):
    # 어떤 상점(Store)에 대한 예측 결과인지 구분하기 위한 외래 키
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    # 어떤 품목(Product)에 대한 예측 결과인지 구분하기 위한 외래 키
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # 예측 대상 날짜
    prediction_date = models.DateField()
    # AI가 예측한 해당 날짜의 판매량
    predicted_sales_quantity = models.IntegerField()
    # 예측 결과의 신뢰도 점수 (0.0 ~ 1.0 사이의 값)
    confidence_score = models.FloatField(null=True, blank=True)
    # 이 예측 결과 레코드가 생성된 시간 (자동으로 현재 시간 기록)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 특정 상점의 특정 품목에 대해 같은 날짜의 예측 결과가 중복으로 저장되지 않도록 제약 조건 설정
        unique_together = ('store', 'product', 'prediction_date')

    def __str__(self):
        # 관리자 페이지 등에서 표시될 객체 이름 형식
        return f"[{self.prediction_date}] {self.product.name} 예측: {self.predicted_sales_quantity}"