# accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # 기존 AbstractUser의 username 필드는 유지하되, 이메일을 USERNAME_FIELD로 사용
    email = models.EmailField(unique=True) 

    USERNAME_FIELD = 'email'  
    REQUIRED_FIELDS = ['username'] 

    def __str__(self):
        return self.email # 관리자 페이지 등에서 객체 표시 이름