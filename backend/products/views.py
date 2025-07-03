from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Product
from .serializer import ProductSerializer
from django.shortcuts import get_object_or_404


