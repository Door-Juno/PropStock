# store/models.py

from django.db import models
from django.conf import settings # settings.AUTH_USER_MODEL을 사용하기 위해 임포트

class Store(models.Model):
    # 매장 정보 설정/조회 명세에 기반한 필드들
    # store_id는 Django가 기본적으로 'id' 필드를 PK로 생성하므로 따로 만들지 않습니다.
    store_id = models.CharField(primary_key=True, help_text="매장 ID (고유 식별자)")
    name = models.CharField(max_length=100, help_text="매장 이름")
    industry = models.CharField(max_length=50, help_text="산업 분야 (예: 편의점, 마트)")
    region = models.CharField(max_length=200, help_text="매장 위치 지역")
    open_time = models.TimeField(help_text="개점 시간")
    close_time = models.TimeField(help_text="폐점 시간")

    # 매장 정보에 대한 최종 업데이트 시간 추가 (명세의 updated_at 반영)
    updated_at = models.DateTimeField(auto_now=True, help_text="마지막 업데이트 시간")
    created_at = models.DateTimeField(auto_now_add=True, help_text="생성 시간")

    # 매장과 사용자를 연결 (필요하다면)
    # 한 사용자가 여러 매장을 관리할 수 있다면 ForeignKey
    # 한 매장이 여러 사용자에게 연결될 수 있다면 ManyToManyField
    # 예: owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_stores', null=True, blank=True)

    class Meta:
        verbose_name = "매장"
        verbose_name_plural = "매장들"

    def __str__(self):
        return self.name