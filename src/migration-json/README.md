# `migration-json` — export / import / validate

TypeScript CLIs under this folder implement the JSON-based migration path.

## Layout

| Path | Role |
|------|------|
| `shared/config.ts` | Reads `MIGRATION_*` and database URLs from the environment. |
| `shared/db.ts` | Creates `pg` pools for old/new databases. |
| `shared/logger.ts` | Structured JSON logs to stdout. |
| `export/run-export.ts` | Dumps old DB tables to JSON. |
| `export/table-list.ts` | Tables **excluded** from export (entities, rooms, certain booking tables, `tableHistory`, etc.). |
| `export/writer.ts` | File envelope, checksums, manifest updates. |
| `mapping/schema-map.ts` | Table rules (e.g. `listingUsers` → `customers`, skipped tables). |
| `mapping/fk-graph.ts` | Topological order for import based on FKs in the **new** DB. |
| `mapping/id-strategy.ts` | Preserve vs regenerate IDs per table. |
| `import/run-import.ts` | Main import orchestration, checkpointing, brand/geo merges. |
| `import/upsert.ts` | Batch `INSERT … ON CONFLICT DO NOTHING`, JSON normalization, upserts into `brandsOn*`. |
| `import/transformers.ts` | Per-table transforms (e.g. listing users). |
| `import/checkpoint.ts` | `_checkpoint.json` read/write. |
| `validate/run-validate.ts` | Post-migration checks and report files. |
| `push-schema.ts` | Runs `drizzle-kit push` against `NEW_DATABASE_URL`. |
| `clear-cache.ts` | Removes checkpoint and `_id-map/_strategy-report.json`. |

## Export

- Connects to `OLD_DATABASE_URL`.
- Enumerates `public` base tables and **drops** those listed in `export/table-list.ts` (`EXCLUDED_TABLES`).
- Writes one JSON file per table plus `_manifest.json` under `MIGRATION_DATA_DIR`.

## Import

- Reads `_manifest.json` and loads each `rows` array.
- Resolves **target** table names via `mapping/schema-map.ts` (defaults to same name).
- Sorts work using FK dependencies on the **new** database so parents load before children.
- Copies only columns that exist on the target table; applies admin/brand healing and cancellation-plan ID mapping where implemented.
- **Brand layer** (when `brands` exists and not dry-run): ensures property/brand links and geo brand tables, then merges `states.json` / `cities.json` / `areas.json` into `brandsOnStates` / `brandsOnCities` / `brandsOnAreas` (including `areaInfo` → `info` on areas).

Checkpointing: progress is stored in `MIGRATION_DATA_DIR/_checkpoint.json`. Completed tables are skipped on restart unless you run `npm run json:clear`.

## Validate

- Compares counts and samples, checks FK orphans, writes `MIGRATION_DATA_DIR/_reports/*`.

## Running from the repo root

```bash
npm run json:export
npm run json:import
npm run json:validate
```

Single-table imports are controlled with `MIGRATION_TABLE=<sourceTableName>` in `.env`.

## Troubleshooting

- **`relation … does not exist` on the new DB** — run `npm run schema:push` first.
- **Import keeps skipping tables** — delete checkpoint with `npm run json:clear`, or delete `MIGRATION_DATA_DIR/_checkpoint.json` manually.
- **Fewer rows in `brandsOnCities` / `brandsOnStates` than in `cities` / `states`** — ensure you are on a version of the importer that merges the full `cities.json` / `states.json` exports into those tables (not only rows implied by `properties`).
- **Windows / `schema:push` issues** — `push-schema.ts` invokes the shell in a Windows-safe way; if push still fails, run `npx drizzle-kit push` manually from the repo root with `NEW_DATABASE_URL` set.
