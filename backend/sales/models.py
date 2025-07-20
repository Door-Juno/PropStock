from django.db import models
from products.models import Product

class Sales(models.Model):
    date = models.DateField()  # row['date']
    item = models.ForeignKey(Product, on_delete=models.CASCADE)  # item_code를 이용해 Product 객체 조회 후 연결
    quantity = models.IntegerField()  # row['quantity']
    price = models.DecimalField(max_digits=11, decimal_places=2)  # row['price']

    def __str__(self):
        return f"{self.date} - {self.item} ({self.quantity})"
