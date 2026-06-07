## [code transaction-atomic] `transaction.atomic`

Context manager and decorator that wraps a block in a DB transaction. Commits on clean exit, rolls back on exception. Nestable — inner blocks become savepoints.

### per-request vs per-iteration

```python
# Per-request: middleware wraps the entire view. One bad field → whole
# request rolls back. The user expects all-or-nothing.
# settings.py: DATABASES = { 'default': { 'ATOMIC_REQUESTS': True, ... } }

# Per-iteration: batch job processes thousands of items. One bad item
# should NOT roll back every successful peer.
for item in items:
    try:
        with transaction.atomic():
            process_item(item)
    except RECOVERABLE_ERRORS as exc:
        log.warning('Skipped %s: %s', item.id, exc)
```

`ATOMIC_REQUESTS` is the right granularity for API views — the user expects a single request to either fully succeed or fully fail. For batch jobs, wrap each iteration separately so a single bad item doesn't destroy the whole run. The outer `try/except` catches known errors and continues; unexpected exceptions escape and crash the command — a programming bug should be visible on the first item, not buried as N error rows.

### decorator form

```python
@transaction.atomic
def transfer(from_acct, to_acct, amount):
    from_acct.balance = F('balance') - amount
    from_acct.save(update_fields=['balance'])
    to_acct.balance = F('balance') + amount
    to_acct.save(update_fields=['balance'])
```

Same semantics as the context manager — the entire function body is one transaction. Prefer the decorator when the whole function is the atomic unit; prefer `with transaction.atomic():` when only part of a function needs transactional wrapping.
