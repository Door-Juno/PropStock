# store/serializers.py

from rest_framework import serializers
from .models import Store

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = ['store_id', 'name', 'industry', 'region', 'open_time', 'close_time', 'updated_at']
        # 'store_id'는 기본적으로 Django 모델의 'id' 필드에 매핑됩니다.
        # read_only_fields = ['store_id', 'updated_at', 'created_at'] # 자동으로 생성/업데이트되는 필드는 읽기 전용으로 설정
        # updated_at은 응답에 포함되면서 자동으로 업데이트되어야 하므로 read_only_fields에서 제외할 수 있습니다.
        # 그러나 PUT/PATCH 요청 바디에 updated_at이 포함되지 않아야 하므로 주의가 필요합니다.
        # 명세에서는 요청 바디에 updated_at이 없으므로, 기본 동작으로 충분합니다.