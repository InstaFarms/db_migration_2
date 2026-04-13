# InstaFarms DB migration (old schema → new schema)

This repo helps you move data from a PostgreSQL database that matches `src/schema_old/schema.ts` into one that matches `src/schema_new/schema.ts`, using JSON files as an intermediate format.

## Prerequisites

- **Node.js** (current LTS is fine) and **npm**
- **PostgreSQL** with:
  - **Old database**: populated with data in the old schema
  - **New database**: empty or disposable target (you will apply the new schema here)
- A local **`.env`** file (see [Configuration](#configuration))

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`: set `OLD_DATABASE_URL`, `NEW_DATABASE_URL`, and optional migration variables.

3. **Apply the new schema to the target database** (first time on a new DB, or after schema changes)

   ```bash
   npm run schema:push
   ```

4. **Export data from the old database to JSON** (under `data/oldedata/` by default)

   ```bash
   npm run json:export
   ```

5. **Import JSON into the new database**

   ```bash
   npm run json:import
   ```

6. **Validate** (row counts, FK orphans, sample hashes)

   ```bash
   npm run json:validate
   ```

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run schema:push` | Pushes `schema_new` to `NEW_DATABASE_URL` via Drizzle Kit. |
| `npm run json:export` | Reads old DB tables (minus exclusions) into `MIGRATION_DATA_DIR`. |
| `npm run json:import` | Imports JSON into the new DB with ordering, healing, and brand/geo merges. |
| `npm run json:validate` | Writes reports under `MIGRATION_DATA_DIR/_reports/`. |
| `npm run json:clear` | Deletes import checkpoint / strategy report cache (see below). |

## Configuration

Variables are loaded from `.env` (see `.env.example`).

| Variable | Description |
|----------|-------------|
| `OLD_DATABASE_URL` | Connection string for the **source** database. |
| `NEW_DATABASE_URL` | Connection string for the **target** database. |
| `MIGRATION_DATA_DIR` | Folder for JSON exports and reports (default `data/oldedata`). |
| `MIGRATION_BATCH_SIZE` | Import batch size (default `500`). |
| `MIGRATION_DRY_RUN` | If `true`, import skips writes (for testing). |
| `MIGRATION_TABLE` | If set, import/export can be scoped to a single **source** table name. |
| `MIGRATION_BRAND_NAME` | Used when generating default slugs for brand/geo mapping rows. |

## Output layout

Under `MIGRATION_DATA_DIR` (default `data/oldedata/`):

- `<table>.json` — exported rows per table
- `_manifest.json` — export manifest
- `_checkpoint.json` — import progress (resume); remove with `npm run json:clear` if you want a full re-import from scratch
- `_id-map/` — ID strategy / mapping artifacts written during import
- `_reports/` — validation output from `json:validate`

## Clearing import cache

If you need the importer to **not** skip tables marked complete in the checkpoint, or to reset the strategy report cache:

```bash
npm run json:clear
```

Then run `npm run json:import` again.

## Schema note: `states` / `cities` / `areas` vs brand tables

In the **new** schema, many CMS-style fields (slug, faqs, `info`, `meta`, featured weight, etc.) live on **`brandsOnStates`**, **`brandsOnCities`**, and **`brandsOnAreas`**, not on the slim `states` / `cities` / `areas` tables. The importer merges exported `states.json`, `cities.json`, and `areas.json` into those brand mapping tables for the default brand.

## Further reading

- **[JSON_MIGRATION_RUNBOOK.md](./JSON_MIGRATION_RUNBOOK.md)** — short operational checklist
- **[src/migration-json/README.md](./src/migration-json/README.md)** — details on the migration code and exclusions

## License

ISC (see `package.json`).
