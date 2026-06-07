## [code meta-db-table] `Meta.db_table`

```python
class StopSale(models.Model):
    class Meta:
        db_table = 'engine_stop_sale'
```

By default Django names the table `<app_label>_<model_name_lower>` (e.g. `hotiday_engine_stopsale`). Override with `Meta.db_table` when the auto-generated name doesn't match an existing schema or a naming convention — common with compound model names that read poorly without a separator.
