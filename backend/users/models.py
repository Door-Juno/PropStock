from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    store = models.OneToOneField('Store', on_delete=models.CASCADE, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Store(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    updated_at = models.DateTimeField(auto_now=True)

