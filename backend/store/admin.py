from django.contrib import admin
from .models import Store # Store 모델 임포트

# Store 모델을 관리자 페이지에 등록
admin.site.register(Store)