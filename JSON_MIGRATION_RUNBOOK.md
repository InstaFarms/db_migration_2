# JSON Migration Runbook

## 1) Prerequisites
- Old and new database URLs set in `.env`.
- New database schema is already pushed from `schema_new.ts`.
- Export destination folder is configured (`MIGRATION_DATA_DIR`, default `data/oldedata`).

## 2) Export old data to JSON
- Run:
  - `npm run json:export`
- Output:
  - `data/oldedata/<table>.json`
  - `data/oldedata/_manifest.json`

## 3) Import JSON into new schema
- Run:
  - `npm run json:import`
- Behavior:
  - Uses checkpoint file `data/oldedata/_checkpoint.json` for resume.
  - Applies table mapping rules and transformation rules.
  - Generates ID mapping artifacts in `data/oldedata/_id-map/`.

## 4) Validate migration
- Run:
  - `npm run json:validate`
- Reports:
  - `data/oldedata/_reports/counts.json`
  - `data/oldedata/_reports/fk-orphans.json`
  - `data/oldedata/_reports/sample-hash.json`
  - `data/oldedata/_reports/summary.md`

## 5) Useful options
- Single table:
  - set `MIGRATION_TABLE=<table_name>`
- Dry run import:
  - set `MIGRATION_DRY_RUN=true`
- Batch size:
  - set `MIGRATION_BATCH_SIZE=500` (or suitable value)
