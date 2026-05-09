## [code output] Output Format

```markdown
# Context: <Title>

<Short description of what this Context covers.>

## Relationships
<Plain-text description of how this Context relates to others.
 If terms overlap with other Contexts but mean different things,
 explain the divergence here.>

## Dictionary

| Term   | Definition   |
|--------|--------------|
| <term> | <definition> |
```

```text
# Single-Context Story (the common case)

[Contexts: Billing]

As a `Customer`, I want to download an `Invoice` so that I can keep
a record of my purchase.
```

```text
# Multi-Context Story with inline disambiguation (rare)

[Contexts: Billing, Account Management]

As a `Customer`, I want to update my `Billing Profile` using my
`Account[Account Management]` so that my invoices are sent to the
correct address.
```
