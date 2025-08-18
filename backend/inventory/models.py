from django.db import models
from users.models import Store
from products.models import Product
from datetime import date

class InventoryTransaction(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    transaction_date = models.DateField(default=date.today)
    type = models.CharField(max_length=10, choices=[('in', '입고'), ('out', '출고')])
    quantity = models.IntegerField()
    notes = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.date}] {self.product.name} - {self.get_type_display()}: {self.quantity}"