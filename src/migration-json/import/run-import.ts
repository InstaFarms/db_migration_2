import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getConfig } from "../shared/config";
import { createNewPool } from "../shared/db";
import { log } from "../shared/logger";
import { buildDependencyOrder } from "../mapping/fk-graph";
import { detectIdMode } from "../mapping/id-strategy";
import { getRuleForTable } from "../mapping/schema-map";
import { readCheckpoint, writeCheckpoint } from "./checkpoint";
import { transformListingUsersToCustomers } from "./transformers";
import {
    getTargetColumns,
    insertRowsDoNothing,
    upsertBrandsOnAreasFromExportedAreas,
    upsertBrandsOnCitiesFromExportedCities,
    upsertBrandsOnStatesFromExportedStates,
} from "./upsert";

type Manifest = {
    generatedAt: string;
    tables: { table: string; file: string; rowCount: number }[];
};

const readManifest = async (dataDir: string): Promise<Manifest> => {
    const raw = await readFile(path.join(dataDir, "_manifest.json"), "utf8");
    return JSON.parse(raw) as Manifest;
};

const readTableRows = async (
    dataDir: string,
    fileName: string
): Promise<Record<string, unknown>[]> => {
    const raw = await readFile(path.join(dataDir, fileName), "utf8");
    const parsed = JSON.parse(raw) as { rows: Record<string, unknown>[] };
    return parsed.rows ?? [];
};

const buildCancellationPlanIdMap = async (
    dataDir: string,
    newPool: import("pg").Pool,
    defaultBrandId: string | null,
    defaultAdminId: string | null
): Promise<Map<string, string>> => {
    const map = new Map<string, string>();
    try {
        const sourcePlans = await readTableRows(dataDir, "cancellationPlans.json");
        if (sourcePlans.length === 0) return map;
        if (!defaultBrandId || !defaultAdminId) return map;

        // Ensure every source cancellation plan has a corresponding target row,
        // then capture a deterministic old->new id mapping.
        for (const plan of sourcePlans) {
            const oldId = String(plan.id ?? "");
            const name = String(plan.name ?? "").trim();
            if (!oldId || !name) continue;
            const isActive = plan.isActive == null ? true : Boolean(plan.isActive);

            const upsert = await newPool.query(
                `
                INSERT INTO "cancellationPlans"
                    ("id","brandId","name","isActive","adminCreatedBy","adminUpdatedBy")
                VALUES
                    ($1,$2,$3,$4,$5,$5)
                ON CONFLICT ("brandId","name")
                DO UPDATE SET
                    "isActive" = EXCLUDED."isActive",
                    "adminUpdatedBy" = EXCLUDED."adminUpdatedBy"
                RETURNING "id"
            `,
                [oldId, defaultBrandId, name, isActive, defaultAdminId]
            );

            if ((upsert.rowCount ?? 0) > 0) {
                map.set(oldId, String(upsert.rows[0].id));
            }
        }

        const targetPlansRes = await newPool.query(
            `
            SELECT "id", "name", "brandId"
            FROM "cancellationPlans"
        `
        );
        const byId = new Map<string, string>();
        const byName = new Map<string, string>();
        for (const row of targetPlansRes.rows) {
            const id = String(row.id);
            byId.set(id, id);
            const nameKey = `${String(row.brandId)}::${String(row.name).toLowerCase()}`;
            if (!byName.has(nameKey)) byName.set(nameKey, id);
        }

        for (const plan of sourcePlans) {
            const oldId = String(plan.id ?? "");
            if (!oldId) continue;
            if (byId.has(oldId)) {
                map.set(oldId, byId.get(oldId) as string);
                continue;
            }
            const name = String(plan.name ?? "").toLowerCase();
            if (!name || !defaultBrandId) continue;
            const key = `${defaultBrandId}::${name}`;
            if (byName.has(key)) {
                map.set(oldId, byName.get(key) as string);
            }
        }
    } catch {
        // best-effort map; importer can still proceed
    }
    return map;
};

const ensureDefaultBrand = async (
    newPool: import("pg").Pool,
    newTables: string[]
): Promise<string | null> => {
    if (!newTables.includes("brands")) return null;

    let adminId: string | null = null;
    const adminRes = await newPool.query(`SELECT "id" FROM "admins" ORDER BY "createdAt" ASC LIMIT 1`);
    if ((adminRes.rowCount ?? 0) > 0) {
        adminId = adminRes.rows[0].id as string;
    } else if (newTables.includes("admins")) {
        adminId = randomUUID();
        // adminCreatedBy/adminUpdatedBy have no FK, so self-reference is valid.
        await newPool.query(
            `
            INSERT INTO "admins"
                ("id","firstName","lastName","email","phoneNumber","adminCreatedBy","adminUpdatedBy")
            VALUES
                ($1,'Migration','Admin',$2,$3,$1,$1)
            ON CONFLICT DO NOTHING
        `,
            [adminId, `migration-admin-${adminId.slice(0, 8)}@local`, `99999${adminId.slice(0, 5)}`]
        );
    }

    if (!adminId) return null;

    const brandName = process.env.MIGRATION_BRAND_NAME ?? "InstaFarms";
    const brandDomain = process.env.MIGRATION_BRAND_DOMAIN ?? null;
    const brandRes = await newPool.query(
        `
        INSERT INTO "brands" ("name","domain","isActive","adminCreatedBy","adminUpdatedBy")
        VALUES ($1,$2,true,$3,$3)
        ON CONFLICT ("name")
        DO UPDATE SET "domain"=EXCLUDED."domain", "adminUpdatedBy"=EXCLUDED."adminUpdatedBy"
        RETURNING "id"
    `,
        [brandName, brandDomain, adminId]
    );
    return brandRes.rows[0].id as string;
};

const ensureDefaultAdmin = async (
    newPool: import("pg").Pool,
    newTables: string[]
): Promise<string | null> => {
    if (!newTables.includes("admins")) return null;
    const adminRes = await newPool.query(`SELECT "id" FROM "admins" ORDER BY "createdAt" ASC LIMIT 1`);
    if ((adminRes.rowCount ?? 0) > 0) {
        return adminRes.rows[0].id as string;
    }
    const adminId = randomUUID();
    await newPool.query(
        `
        INSERT INTO "admins"
            ("id","firstName","lastName","email","phoneNumber","adminCreatedBy","adminUpdatedBy")
        VALUES
            ($1,'Migration','Admin',$2,$3,$1,$1)
        ON CONFLICT DO NOTHING
    `,
        [adminId, `migration-admin-${adminId.slice(0, 8)}@local`, `99999${adminId.slice(0, 5)}`]
    );
    return adminId;
};

const ensureChecklistCategories = async (
    dataDir: string,
    newPool: import("pg").Pool,
    defaultAdminId: string | null,
    newTables: string[]
): Promise<void> => {
    if (!defaultAdminId) return;
    if (!newTables.includes("checklistCategoryMaster")) return;

    try {
        const sourceCategories = await readTableRows(dataDir, "checklistCategoryMaster.json");
        for (const row of sourceCategories) {
            const id = String(row.id ?? "");
            const name = String(row.name ?? "");
            const itemType = String(row.itemType ?? "");
            const weight =
                typeof row.weight === "number"
                    ? row.weight
                    : Number(row.weight ?? 0);
            const isActive = row.isActive == null ? true : Boolean(row.isActive);
            if (!id || !name || !itemType) continue;

            await newPool.query(
                `
                INSERT INTO "checklistCategoryMaster"
                    ("id","name","itemType","weight","isActive","adminCreatedBy","adminUpdatedBy")
                VALUES
                    ($1,$2,$3,$4,$5,$6,$6)
                ON CONFLICT ("id")
                DO UPDATE SET
                    "name" = EXCLUDED."name",
                    "itemType" = EXCLUDED."itemType",
                    "weight" = EXCLUDED."weight",
                    "isActive" = EXCLUDED."isActive",
                    "adminUpdatedBy" = EXCLUDED."adminUpdatedBy"
            `,
                [id, name, itemType, weight, isActive, defaultAdminId]
            );
        }
    } catch {
        // Best-effort; importer will still fail later with precise FK errors if categories remain missing.
    }
};

const getColumnNullability = async (
    pool: import("pg").Pool,
    tableName: string
): Promise<Map<string, boolean>> => {
    const res = await pool.query(
        `
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1
    `,
        [tableName]
    );
    const map = new Map<string, boolean>();
    for (const row of res.rows) {
        map.set(row.column_name as string, row.is_nullable === "YES");
    }
    return map;
};

const getIdSet = async (
    pool: import("pg").Pool,
    tableName: string
): Promise<Set<string>> => {
    const res = await pool.query(`SELECT "id" FROM "${tableName}"`);
    return new Set(res.rows.map((r) => String(r.id)));
};

const run = async (): Promise<void> => {
    const config = getConfig();
    const newPool = createNewPool(config);

    try {
        const manifest = await readManifest(config.dataDir);
        const tablesFromManifest = manifest.tables.map((t) => t.table);
        const allNewTablesRes = await newPool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public' AND table_type='BASE TABLE'
        `);
        const newTables = allNewTablesRes.rows.map((r) => r.table_name as string);

        const toImport = config.singleTable
            ? tablesFromManifest.filter((t) => t === config.singleTable)
            : tablesFromManifest;
        const order = await buildDependencyOrder(
            newPool,
            toImport
                .map((t) => getRuleForTable(t).targetTable ?? t)
                .filter((t) => newTables.includes(t))
        );
        const cp = await readCheckpoint(config.dataDir);
        const defaultAdminId = await ensureDefaultAdmin(newPool, newTables);
        const defaultBrandId = await ensureDefaultBrand(newPool, newTables);
        await ensureChecklistCategories(config.dataDir, newPool, defaultAdminId, newTables);
        const cancellationPlanIdMap = await buildCancellationPlanIdMap(
            config.dataDir,
            newPool,
            defaultBrandId,
            defaultAdminId
        );
        const existingIds = {
            properties: new Set<string>(),
            activities: new Set<string>(),
            amenities: new Set<string>(),
            safetyHygiene: new Set<string>(),
        };
        const adminIds = new Set<string>();
        if (newTables.includes("admins")) {
            const admins = await newPool.query(`SELECT "id" FROM "admins"`);
            for (const row of admins.rows) adminIds.add(String(row.id));
        }

        const idStrategyReport: Record<string, { mode: string; reason: string }> = {};
        const idMapsDir = path.join(config.dataDir, "_id-map");
        await mkdir(idMapsDir, { recursive: true });

        const orderIndex = new Map(order.map((table, idx) => [table, idx]));
        const orderedSource = [...toImport].sort((a, b) => {
            const ta = getRuleForTable(a).targetTable ?? a;
            const tb = getRuleForTable(b).targetTable ?? b;
            const ia = orderIndex.has(ta) ? (orderIndex.get(ta) as number) : Number.MAX_SAFE_INTEGER;
            const ib = orderIndex.has(tb) ? (orderIndex.get(tb) as number) : Number.MAX_SAFE_INTEGER;
            if (ia !== ib) return ia - ib;
            return a.localeCompare(b);
        });

        for (const sourceTable of orderedSource) {
            const rule = getRuleForTable(sourceTable);
            if (rule.mode === "skip") {
                log("info", "Skipping table by rule", { sourceTable, reason: rule.reason });
                continue;
            }

            const targetTable = rule.targetTable ?? sourceTable;
            if (!newTables.includes(targetTable)) {
                log("warn", "Target table missing; skipping", { sourceTable, targetTable });
                continue;
            }

            if (cp[sourceTable]?.done) {
                log("info", "Skipping already completed table", { sourceTable });
                continue;
            }

            const manifestItem = manifest.tables.find((t) => t.table === sourceTable);
            if (!manifestItem) continue;

            log("info", "Importing table", { sourceTable, targetTable });
            const rows = await readTableRows(config.dataDir, manifestItem.file);

            let rowsToInsert = rows;
            let generatedIdMap: Record<string, string> = {};
            const idMode = await detectIdMode(newPool, targetTable);
            idStrategyReport[sourceTable] = idMode;

            if (rule.mode === "transform" && sourceTable === "listingUsers") {
                const transformed = transformListingUsersToCustomers(rows);
                rowsToInsert = transformed.transformed;
                generatedIdMap = transformed.idMap;
            } else if (idMode.mode === "regenerate") {
                // no-op generic regenerate placeholder for future table-specific mappings
                generatedIdMap = {};
            }

            const targetColumns = new Set(await getTargetColumns(newPool, targetTable));
            const nullableByColumn = await getColumnNullability(newPool, targetTable);
            const filteredRows = rowsToInsert.map((r) => {
                const out: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(r)) {
                    if (targetColumns.has(k)) out[k] = v;
                }
                // ID policy:
                // - same source/target table: preserve original id
                // - source -> different target table: assign a fresh UUID id (when target has id)
                if (
                    sourceTable !== targetTable &&
                    targetColumns.has("id") &&
                    rule.mode !== "transform" &&
                    (out.id == null || typeof out.id === "string")
                ) {
                    out.id = randomUUID();
                }
                // If target requires brandId, auto-fill from default brand.
                if (
                    defaultBrandId &&
                    targetColumns.has("brandId") &&
                    nullableByColumn.get("brandId") === false &&
                    (out.brandId == null || out.brandId === "")
                ) {
                    out.brandId = defaultBrandId;
                }
                if (
                    targetTable === "cancellationPercentages" &&
                    out.cancellationPlanId != null &&
                    cancellationPlanIdMap.has(String(out.cancellationPlanId))
                ) {
                    out.cancellationPlanId = cancellationPlanIdMap.get(
                        String(out.cancellationPlanId)
                    );
                }
                if (
                    targetTable === "propertyCancellationPlans" &&
                    out.cancellationPlanId != null &&
                    cancellationPlanIdMap.has(String(out.cancellationPlanId))
                ) {
                    out.cancellationPlanId = cancellationPlanIdMap.get(
                        String(out.cancellationPlanId)
                    );
                }
                if (
                    defaultAdminId &&
                    targetColumns.has("adminId") &&
                    (out.adminId == null ||
                        out.adminId === "" ||
                        !adminIds.has(String(out.adminId)))
                ) {
                    out.adminId = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    targetColumns.has("settlementBlockedBy") &&
                    (out.settlementBlockedBy == null ||
                        out.settlementBlockedBy === "" ||
                        !adminIds.has(String(out.settlementBlockedBy)))
                ) {
                    out.settlementBlockedBy = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    targetColumns.has("adminCreatedBy") &&
                    (out.adminCreatedBy == null ||
                        out.adminCreatedBy === "" ||
                        !adminIds.has(String(out.adminCreatedBy)))
                ) {
                    out.adminCreatedBy = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    targetColumns.has("adminUpdatedBy") &&
                    (out.adminUpdatedBy == null ||
                        out.adminUpdatedBy === "" ||
                        !adminIds.has(String(out.adminUpdatedBy)))
                ) {
                    out.adminUpdatedBy = defaultAdminId;
                }
                return out;
            });

            // Refresh FK parent sets at the time dependent tables are imported.
            if (
                targetTable === "activitiesOnProperties" ||
                targetTable === "amenitiesOnProperties" ||
                targetTable === "safetyHygieneOnProperties" ||
                targetTable === "recentlyVisited"
            ) {
                if (newTables.includes("properties")) {
                    existingIds.properties = await getIdSet(newPool, "properties");
                }
            }
            if (targetTable === "activitiesOnProperties" && newTables.includes("activities")) {
                existingIds.activities = await getIdSet(newPool, "activities");
            }
            if (targetTable === "amenitiesOnProperties" && newTables.includes("amenities")) {
                existingIds.amenities = await getIdSet(newPool, "amenities");
            }
            if (
                targetTable === "safetyHygieneOnProperties" &&
                newTables.includes("safetyHygiene")
            ) {
                existingIds.safetyHygiene = await getIdSet(newPool, "safetyHygiene");
            }

            let rowsAfterFkValidation = filteredRows;
            if (targetTable === "activitiesOnProperties") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const propertyId = String(row.propertyId ?? "");
                    const activityId = String(row.activityId ?? "");
                    return (
                        existingIds.properties.has(propertyId) &&
                        existingIds.activities.has(activityId)
                    );
                });
            } else if (targetTable === "amenitiesOnProperties") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const propertyId = String(row.propertyId ?? "");
                    const amenityId = String(row.amenityId ?? "");
                    return (
                        existingIds.properties.has(propertyId) &&
                        existingIds.amenities.has(amenityId)
                    );
                });
            } else if (targetTable === "safetyHygieneOnProperties") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const propertyId = String(row.propertyId ?? "");
                    const safetyHygieneId = String(row.safetyHygieneId ?? "");
                    return (
                        existingIds.properties.has(propertyId) &&
                        existingIds.safetyHygiene.has(safetyHygieneId)
                    );
                });
            } else if (targetTable === "recentlyVisited") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const propertyId = String(row.propertyId ?? "");
                    return propertyId.length > 0 && existingIds.properties.has(propertyId);
                });
            }

            if (rowsAfterFkValidation.length !== filteredRows.length) {
                log("warn", "Skipped FK-invalid rows", {
                    sourceTable,
                    targetTable,
                    skipped: filteredRows.length - rowsAfterFkValidation.length,
                });
            }

            let processed = 0;
            for (let i = 0; i < rowsAfterFkValidation.length; i += config.batchSize) {
                const batch = rowsAfterFkValidation.slice(i, i + config.batchSize);
                if (!config.dryRun) {
                    await insertRowsDoNothing(newPool, targetTable, batch);
                }
                processed += batch.length;
                cp[sourceTable] = {
                    done: false,
                    processedRows: processed,
                    updatedAt: new Date().toISOString(),
                };
                await writeCheckpoint(config.dataDir, cp);
            }

            if (Object.keys(generatedIdMap).length > 0) {
                await writeFile(
                    path.join(idMapsDir, `${sourceTable}.json`),
                    JSON.stringify(generatedIdMap, null, 2),
                    "utf8"
                );
            }

            cp[sourceTable] = {
                done: true,
                processedRows: rowsAfterFkValidation.length,
                updatedAt: new Date().toISOString(),
            };
            await writeCheckpoint(config.dataDir, cp);
        }

        await writeFile(
            path.join(config.dataDir, "_id-map", "_strategy-report.json"),
            JSON.stringify(idStrategyReport, null, 2),
            "utf8"
        );

        // brand-layer derivation
        if (!config.dryRun && newTables.includes("brands")) {
            const adminRes = await newPool.query(`SELECT "id" FROM "admins" LIMIT 1`);
            if ((adminRes.rowCount ?? 0) > 0) {
                const adminId = adminRes.rows[0].id as string;
                const brandId = defaultBrandId;
                if (!brandId) {
                    return;
                }
                await newPool.query(
                    `
                    INSERT INTO "propertiesDataSpecificToBrands"
                    ("propertyId","brandId","slug","adminCreatedBy","adminUpdatedBy")
                    SELECT p."id", $1::uuid,
                        lower(regexp_replace(coalesce(p."propertyCode", p."propertyName", p."id"::text), '[^a-zA-Z0-9]+', '-', 'g')),
                        $2::uuid,$2::uuid
                    FROM "properties" p
                    ON CONFLICT ("propertyId","brandId") DO NOTHING
                `,
                    [brandId, adminId]
                );

                // Derive geo-brand mapping tables from imported properties.
                // Cast uuid params explicitly: in INSERT...SELECT, untyped $n are inferred as text.
                await newPool.query(
                    `
                    INSERT INTO "brandsOnStates"
                        ("brandId","stateId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                    SELECT DISTINCT
                        $1::uuid,
                        p."stateId",
                        lower(regexp_replace($2 || '-state-' || p."stateId"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                        true,
                        $3::uuid,
                        $3::uuid
                    FROM "properties" p
                    WHERE p."stateId" IS NOT NULL
                    ON CONFLICT ("brandId","stateId") DO NOTHING
                `,
                    [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                );

                await newPool.query(
                    `
                    INSERT INTO "brandsOnCities"
                        ("brandId","cityId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                    SELECT DISTINCT
                        $1::uuid,
                        p."cityId",
                        lower(regexp_replace($2 || '-city-' || p."cityId"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                        true,
                        $3::uuid,
                        $3::uuid
                    FROM "properties" p
                    WHERE p."cityId" IS NOT NULL
                    ON CONFLICT ("brandId","cityId") DO NOTHING
                `,
                    [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                );

                await newPool.query(
                    `
                    INSERT INTO "brandsOnAreas"
                        ("brandId","areaId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                    SELECT DISTINCT
                        $1::uuid,
                        p."areaId",
                        lower(regexp_replace($2 || '-area-' || p."areaId"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                        true,
                        $3::uuid,
                        $3::uuid
                    FROM "properties" p
                    WHERE p."areaId" IS NOT NULL
                    ON CONFLICT ("brandId","areaId") DO NOTHING
                `,
                    [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                );

                // Old `states` / `cities` / `areas` JSON has rich CMS fields on the base rows.
                // In the new schema those fields live on `brandsOnStates` / `brandsOnCities` / `brandsOnAreas`.
                // Merge exported content into the default brand (upsert over stub rows).
                const adminIdSet = new Set<string>();
                const adminsRes = await newPool.query(`SELECT "id" FROM "admins"`);
                for (const r of adminsRes.rows) adminIdSet.add(String(r.id));
                const effectiveAdmin =
                    adminIdSet.has(String(adminId)) ? adminId : defaultAdminId ?? adminId;

                if (newTables.includes("brandsOnStates")) {
                    try {
                        const exportedStates = await readTableRows(
                            config.dataDir,
                            "states.json"
                        );
                        const merged = await upsertBrandsOnStatesFromExportedStates(
                            newPool,
                            brandId,
                            effectiveAdmin,
                            adminIdSet,
                            exportedStates
                        );
                        log("info", "Merged exported states into brandsOnStates", {
                            rows: merged,
                        });
                    } catch (e) {
                        log(
                            "warn",
                            "Could not merge states.json into brandsOnStates (missing export?)",
                            { error: e instanceof Error ? e.message : String(e) }
                        );
                    }
                }

                if (newTables.includes("brandsOnCities")) {
                    try {
                        const exportedCities = await readTableRows(
                            config.dataDir,
                            "cities.json"
                        );
                        const merged = await upsertBrandsOnCitiesFromExportedCities(
                            newPool,
                            brandId,
                            effectiveAdmin,
                            adminIdSet,
                            exportedCities
                        );
                        log("info", "Merged exported cities into brandsOnCities", {
                            rows: merged,
                        });
                    } catch (e) {
                        log(
                            "warn",
                            "Could not merge cities.json into brandsOnCities (missing export?)",
                            { error: e instanceof Error ? e.message : String(e) }
                        );
                    }
                }

                if (newTables.includes("brandsOnAreas")) {
                    try {
                        const exportedAreas = await readTableRows(
                            config.dataDir,
                            "areas.json"
                        );
                        const merged = await upsertBrandsOnAreasFromExportedAreas(
                            newPool,
                            brandId,
                            effectiveAdmin,
                            adminIdSet,
                            exportedAreas
                        );
                        log("info", "Merged exported areas into brandsOnAreas", {
                            rows: merged,
                        });
                    } catch (e) {
                        log(
                            "warn",
                            "Could not merge areas.json into brandsOnAreas (missing export?)",
                            { error: e instanceof Error ? e.message : String(e) }
                        );
                    }
                }
            }
        }

        log("info", "Import complete");
    } finally {
        await newPool.end();
    }
};

run().catch((error) => {
    log("error", "Import failed", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
