## [code service-layer] Service layer pattern

Neither Django nor DRF prescribe a service layer. It's a project-level convention: views parse requests and return responses, services orchestrate multi-model writes, models stay focused on "what is a row."

### thin view

```python views/order.py
class OrderViewSet(ModelViewSet):
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        order_service.cancel_order(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)
```

The view does three things: resolve the URL to an object, delegate to the service, return an HTTP status. No business logic, no multi-table writes.

### service

```python services/order_service.py
def cancel_order(order_id):
    with transaction.atomic():
        order = Order.objects.select_for_update().get(pk=order_id)
        order.status = Order.STATUS_CANCELLED
        order.save(update_fields=['status', 'updated_at'])
        LineItem.objects.filter(order=order).update(status='cancelled')
```

The service owns the invariant: cancelling an order also cancels its line items, atomically. If a management command or a signal needs to cancel an order tomorrow, it calls `cancel_order` — it doesn't rewrite the two-table update.
