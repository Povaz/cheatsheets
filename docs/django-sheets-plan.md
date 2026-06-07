# Django Sheets — Planning Doc

> **Status:** planning complete, no Sheet content written yet.
> **Goal:** turn Django/DRF concepts extracted from three implementation
> walkthroughs into three Sheets under the Django CheatSheet topic
> (`content/django/`).

## Source material

Three walkthroughs in `~/Documents/HotidayVault/CheatSheets/Sources/`:

- `backfill-contract-pdfs-walkthrough.md` — a Django management command.
- `file-attachments-on-manual-cc.md` — Django primer + GFK/registry intro.
- `stop-sale-file-attachment-walkthrough.md` — deepest DRF + signals coverage.

Concepts were extracted, then classified along two axes:

- **Target Sheet:** existing *Django Basics* (expand) · new *Django Basics V2*
  (advanced Django) · new *Django REST Framework*.
- **Kind:** *Concept* (high-level, shapes the project → becomes a **Chapter**)
  vs *Technicality* (low-level, situational → becomes a **single card**,
  slotted under the most pedagogically-natural Concept-chapter).

Dropped as not framework-specific: `@dataclass`, `Counter`, `csv.DictWriter`,
`mock.patch`, and the "single-seam"/"belt-and-suspenders" project conventions.

## Existing Django Basics Sheet (for reference)

`content/django/basics/` — chapters: Project · Request cycle · ORM · Admin · Tests.
Cards already cover: project anatomy, CLI, settings, URL wiring, FBV+CBV views,
templates (DTL + inheritance + static), models/fields, `on_delete`, ORM
(queries/lookups/`F()`), admin, `TestCase`.

---

## Sheet plans

### 1 · Django Basics (no new chapters — enrich existing cards)

| Existing Chapter | Technicality cards to add |
|---|---|
| ORM | `Model.save(update_fields=)` · `values_list(flat=True)` · `QuerySet.none()` · `Meta.db_table` · CASCADE-needs-real-FK |
| Tests | `setUpTestData` · `@override_settings` · storage-isn't-transactional |

### 2 · Django Basics V2 (6 chapters)

```
Chapter: Service layer & transactions
  ├─ concept: service layer pattern
  ├─ concept: transaction.atomic
  └─ (no technicalities)

Chapter: Querying
  ├─ concept: .annotate()
  ├─ concept: N+1 problem
  ├─ concept: select_related
  ├─ Substr (1-indexed)
  └─ GFK N+1 (content_object per-row), cross-ref Generic relations

Chapter: Generic relations
  ├─ concept: ContentType framework
  ├─ concept: GenericForeignKey
  ├─ concept: Attachment registry pattern
  ├─ ContentType.get_for_model
  └─ limit_choices_to

Chapter: Files & storage
  ├─ concept: Storage backends (FS ↔ S3)
  ├─ django.core.files.File
  ├─ SimpleUploadedFile
  ├─ ContentFile
  └─ storage.exists()

Chapter: Commands & data migrations
  ├─ concept: management commands
  ├─ concept: RunPython
  ├─ BaseCommand (add_arguments/handle)
  ├─ CommandError
  ├─ call_command
  ├─ noop_reverse
  └─ migrations-don't-fire-signals

Chapter: Signals
  ├─ concept: signals (pre_delete)
  ├─ AppConfig.ready()
  ├─ dispatch_uid
  └─ apps.get_model
```

### 3 · Django REST Framework (3 chapters)

```
Chapter: Routing & ViewSets
  ├─ concept: ViewSet / ModelViewSet
  ├─ concept: Router wiring
  ├─ @action(detail=…)
  ├─ destroy vs perform_destroy
  ├─ get_object / get_object_or_404
  └─ APIClient + force_authenticate

Chapter: Serializers
  ├─ concept: ModelSerializer
  ├─ SerializerMethodField
  ├─ to_representation
  └─ multipart bracket-indexed upload
```

---

## Concept / "What it is" reference

Definitions for each concept and technicality, to seed card content later.

### Django Basics V2 — concepts
- **Service layer pattern** — project convention: orchestration lives in `services/*.py`; views stay thin, models stay row-focused.
- **`transaction.atomic`** — context manager/decorator wrapping a block in a DB transaction; commit on clean exit, rollback on raise. Nestable as savepoints. Granularity choice: per-request vs per-iteration.
- **`.annotate()`** — attaches a SQL-computed column to each queryset row, usable inside `.filter()`.
- **N+1 query problem** — reading one related field per row triggers one query per row; the cost model behind query optimization.
- **`select_related`** — ORM directive to JOIN single-valued FKs in one query, eliminating per-row follow-ups.
- **`ContentType` framework** — built-in table with one row per model, keyed `(app_label, model)`; bridges "a model class" ↔ "a generic FK".
- **`GenericForeignKey` (GFK)** — `content_type` FK + `object_id` + virtual `content_object` accessor = a typed union letting one row point at any registered model.
- **Attachment registry pattern** — a list constant of allowed `(app_label, model)` targets; adding a type = one line, no migration.
- **Storage backends** — pluggable bytes layer behind `FileField`; `FileSystemStorage` (default) ↔ `S3Boto3Storage`, selected at boot.
- **Management commands** — `<app>/management/commands/<name>.py` with `class Command(BaseCommand)` → auto-discovered `manage.py` subcommand.
- **Data migrations (`RunPython`)** — migration operation running arbitrary Python against a historical model snapshot.
- **Signals (`pre_delete` & co.)** — hooks fired on model lifecycle events regardless of trigger (model/queryset delete, cascade, admin).

### Django Basics V2 — technicalities
- **`Substr(field, pos, length)`** — DB-function wrapper for SQL `SUBSTRING`; **1-indexed** in PostgreSQL.
- **`ContentType.objects.get_for_model(M)`** — model class → its `ContentType` row; cached process-locally but first call hits DB.
- **`limit_choices_to`** — form/admin-level FK target constraint; **not** enforced at DB/API layer.
- **`django.core.files.File`** — wrapper adding `FileField`-expected attributes to a file-like object (correct for local-disk files).
- **`SimpleUploadedFile`** — in-memory upload stand-in (bytes + name + content-type) for tests.
- **`ContentFile`** — in-memory-bytes file wrapper.
- **`storage.exists(name)`** — backend-agnostic existence check (same on FS and S3).
- **`BaseCommand`** — superclass; override `add_arguments(parser)` + `handle(...)`; provides `self.stdout`, `self.style`.
- **`CommandError`** — raise to exit code 1 with clean stderr (no traceback).
- **`call_command(name, ...)`** — programmatic, in-process command invocation (used by tests).
- **`noop_reverse`** — no-op reverse for an irreversible data migration.
- **Migrations don't fire signals** — `RunPython` operates on snapshot model classes, so connected signals don't trigger.
- **`AppConfig.ready()`** — canonical signal-wiring hook; runs once per process after the registry settles.
- **`dispatch_uid`** — de-dup key on `Signal.connect` — same uid registers a receiver only once.
- **`apps.get_model(label, name)`** — lazy model lookup deferring class resolution to registry-ready time.
- **GFK N+1** — `content_object` access is a fresh query per row; GFKs can't be auto-`select_related`.

### DRF — concepts
- **`ViewSet` / `ModelViewSet`** — class bundling list/retrieve/create/update/partial_update/destroy; one class per resource.
- **Router wiring** — maps a viewset's actions to URL paths automatically in `urls.py`.
- **Serializers / `ModelSerializer`** — DRF's JSON I/O layer (the form analog): maps model fields, validates, renders/parses both directions.

### DRF — technicalities
- **`@action(detail=True/False, …)`** — adds a non-CRUD endpoint to a viewset; `detail=True` scopes to one object's URL.
- **`destroy` vs `perform_destroy`** — `destroy` = HTTP handler (parse URL, 204); calls `perform_destroy(instance)` for the work.
- **`get_object()` / `get_object_or_404`** — fetch the detail-URL row or raise `Http404`; preserves the 404 contract in custom code.
- **`SerializerMethodField`** — field computed by a `get_<name>(self, obj)` method; lets the wire shape diverge from the model.
- **`to_representation`** — per-row hook turning an instance into the output dict; the place for conditional shaping.
- **`APIClient` + `force_authenticate`** — test client that bypasses real auth so tests target behavior, not token mechanics.
- **Multipart bracket-indexed upload** — `FormData` upload shape (`attach_to[0]entity_type`), not a JSON body.

### Django Basics — technicality enrichments
- **`Model.save(update_fields=[...])`** — narrows the UPDATE to listed columns; `auto_now=True` only fires when its field is in the list.
- **`.values_list('field', flat=True)`** — pulls a single column as a flat Python list.
- **`QuerySet.none()`** — empty-queryset sentinel; avoids issuing `WHERE id IN ()`.
- **`Meta.db_table`** — overrides the auto-generated table name.
- **CASCADE needs a real FK** — `on_delete=CASCADE` only fires through an actual FK constraint; a plain id column won't cascade.
- **`setUpTestData(cls)`** — class-level fixtures, run once per class (vs `setUp`, once per test).
- **`@override_settings(...)`** — swaps a setting value for a test's lifetime.
- **Storage isn't transactional** — `TestCase` rolls back DB writes, but filesystem/S3 writes are not enrolled in the transaction.

---

## Next steps

1. Scaffold `content/django/basics-v2/` and `content/django/drf/` (each: `sources.yml`, `sheet.yml`, `cards/`).
2. Add the eight enrichment cards to the existing `content/django/basics/`.
3. Draft concept cards (the `← TBD` items), then technicality cards.
