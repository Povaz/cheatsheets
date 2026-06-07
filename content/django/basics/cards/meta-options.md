## [code meta-options] Meta options

`class Meta` inside a model configures table-level behaviour — naming, ordering, constraints, and admin display.

```python
class StopSale(models.Model):
    class Meta:
        # override auto-generated table name <app_label>_<model_name_lower>
        db_table = 'engine_stop_sale'
        # default queryset order, overridden with .order_by()
        ordering = ['-created_at']
        # composite unique constraint 
        constraints = [UniqueConstraint('property', 'date')]
        # singular name in admin
        verbose_name = 'stop sale'
        # plural name in admin
        verbose_name_plural = 'stop sales'
        # DB index for frequent lookups
        indexes = [
            models.Index(fields=['property', 'date']),
        ]
        # don't create a table for this model — for inheritance only
        abstract = True
```
