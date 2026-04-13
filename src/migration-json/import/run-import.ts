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
import {
    transformCancellationsToBookingCancellation,
    transformCancellationsToBookingRefund,
    transformListingUsersToCustomers,
    transformOwnersWalletToOwnerWallet,
    transformPaymentsToBookingPayments,
    transformWalletTransactionsToOwnerWalletLedger,
    transformWalletWithdrawalRequestsToOwnerPayouts,
} from "./transformers";
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

    const brandsToEnsure: Array<{ name: string; domain: string | null }> = [
        { name: "InstaFarms", domain: process.env.MIGRATION_BRAND_DOMAIN ?? null },
        { name: "Mago", domain: null },
        { name: "Listings", domain: null },
    ];

    let defaultBrandId: string | null = null;
    for (const brand of brandsToEnsure) {
        const brandRes = await newPool.query(
            `
            INSERT INTO "brands" ("name","domain","isActive","adminCreatedBy","adminUpdatedBy")
            VALUES ($1,$2,true,$3,$3)
            ON CONFLICT ("name")
            DO UPDATE SET "domain"=EXCLUDED."domain", "adminUpdatedBy"=EXCLUDED."adminUpdatedBy"
            RETURNING "id"
        `,
            [brand.name, brand.domain, adminId]
        );

        if (brand.name === "InstaFarms") {
            defaultBrandId = brandRes.rows[0].id as string;
        }
    }

    return defaultBrandId;
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

const getIdSet = async (
    pool: import("pg").Pool,
    tableName: string
): Promise<Set<string>> => {
    const res = await pool.query(`SELECT "id" FROM "${tableName}"`);
    return new Set(res.rows.map((r) => String(r.id)));
};

const getJsonColumns = async (
    pool: import("pg").Pool,
    tableName: string
): Promise<Set<string>> => {
    const res = await pool.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema='public'
          AND table_name=$1
          AND udt_name IN ('json','jsonb')
    `,
        [tableName]
    );
    return new Set(res.rows.map((r) => String(r.column_name)));
};

const toCamelCase = (value: string): string =>
    value.replace(/_([a-z])/g, (_, ch: string) => ch.toUpperCase());

const sourceKeyCandidatesForTargetColumn = (targetColumn: string): string[] => {
    const camel = toCamelCase(targetColumn);
    const withGstUpper = camel.replace(/Gst/g, "GST");
    const withIdUpper = withGstUpper.replace(/Id/g, "ID");
    return [...new Set([targetColumn, camel, withGstUpper, withIdUpper])];
};

const readRowValueByTargetColumn = (
    row: Record<string, unknown>,
    targetColumn: string
): unknown => {
    for (const key of sourceKeyCandidatesForTargetColumn(targetColumn)) {
        if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
    }
    return undefined;
};

const resolveColumnName = (targetColumns: Set<string>, candidates: string[]): string | null => {
    for (const candidate of candidates) {
        if (targetColumns.has(candidate)) return candidate;
    }
    return null;
};

const resolveFirstExistingTable = (
    newTables: string[],
    candidates: string[]
): string | null => {
    for (const candidate of candidates) {
        if (newTables.includes(candidate)) return candidate;
    }
    return null;
};

const isMissingValue = (value: unknown): boolean =>
    value == null || (typeof value === "string" && value.trim() === "");

const applyPropertiesRequiredDefaults = (
    row: Record<string, unknown>,
    targetColumns: Set<string>
): void => {
    const setDefault = (candidates: string[], value: unknown): void => {
        const key = resolveColumnName(targetColumns, candidates);
        if (!key) return;
        if (isMissingValue(row[key])) row[key] = value;
    };

    setDefault(["is_disabled", "isDisabled"], false);
    setDefault(["bedroom_count", "bedroomCount"], 0);
    setDefault(["bathroom_count", "bathroomCount"], 0);
    setDefault(["double_bed_count", "doubleBedCount"], 0);
    setDefault(["single_bed_count", "singleBedCount"], 0);
    setDefault(["mattress_count", "mattressCount"], 0);
    setDefault(["base_guest_count", "baseGuestCount"], 0);
    setDefault(["max_guest_count", "maxGuestCount"], 0);
    setDefault(["nearby_places", "nearbyPlaces"], []);
    setDefault(["google_place_reviews", "googlePlaceReviews"], []);
};

const normalizeEnumToken = (value: unknown): string =>
    String(value ?? "")
        .trim()
        .replace(/[\s-]+/g, "_")
        .toUpperCase();

const normalizePropertyBookingType = (value: unknown): "Online" | "Offline" => {
    const token = normalizeEnumToken(value);
    if (token === "ONLINE") return "Online";
    return "Offline";
};

const toNullableNumber = (value: unknown): number | null => {
    if (value == null) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const s = String(value).trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
};

const toBool = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    const token = normalizeEnumToken(value);
    return token === "TRUE" || token === "1" || token === "YES";
};

const applyBookingsEnumNormalization = (
    row: Record<string, unknown>,
    targetColumns: Set<string>
): void => {
    const bookingTypeColumn = resolveColumnName(targetColumns, ["bookingType", "booking_type"]);
    const bookingSourceColumn = resolveColumnName(targetColumns, [
        "bookingSource",
        "booking_source",
    ]);
    const statusColumn = resolveColumnName(targetColumns, ["status"]);

    if (bookingTypeColumn) {
        const token = normalizeEnumToken(row[bookingTypeColumn]);
        if (token === "ONLINE" || token === "OFFLINE") {
            row[bookingTypeColumn] = token;
        } else if (isMissingValue(row[bookingTypeColumn])) {
            row[bookingTypeColumn] = "OFFLINE";
        }
    }

    if (bookingSourceColumn) {
        const token = normalizeEnumToken(row[bookingSourceColumn]);
        const sourceMap: Record<string, string> = {
            WEBSITE: "WEBSITE_DESKTOP",
            WEBSITE_DESKTOP: "WEBSITE_DESKTOP",
            WEBSITE_APP: "WEBSITE_APP",
            APP_ANDROID: "APP_ANDROID",
            APP_IOS: "APP_IOS",
            ADMIN_PANEL: "ADMINPANNEL",
            ADMINPANEL: "ADMINPANNEL",
            ADMINPANNEL: "ADMINPANNEL",
            JARVIS: "JARVIS",
        };
        row[bookingSourceColumn] = sourceMap[token] ?? "ADMINPANNEL";
    }

    if (statusColumn) {
        const token = normalizeEnumToken(row[statusColumn]);
        const statusMap: Record<string, string> = {
            PAYMENT_PENDING: "PENDING",
            AWAITING_APPROVAL: "PENDING",
            PENDING: "PENDING",
            CONFIRMED: "CONFIRMED",
            COMPLETED: "COMPLETED",
            CANCELLED: "CANCELLED",
            CANCELED: "CANCELLED",
            REJECTED: "CANCELLED",
            REFUNDED: "CANCELLED",
        };
        row[statusColumn] = statusMap[token] ?? "PENDING";
    }
};

const toPropertyBrandSlug = (row: Record<string, unknown>): string => {
    const fallback = String(row.id ?? "");
    const base = String(row.slug ?? row.propertyCode ?? row.propertyName ?? fallback);
    const cleaned = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return cleaned || fallback;
};

const toPropertyBrandSlugUnique = (
    row: Record<string, unknown>,
    propertyId: string
): string => {
    const base = toPropertyBrandSlug(row);
    const suffix = propertyId.replace(/-/g, "").slice(0, 8) || propertyId;
    return `${base}-${suffix}`;
};

const propertyBrandJsonFallback = (column: string): unknown => {
    const c = column.toLowerCase();
    if (c === "meta") return "{}";
    if (
        c === "faqs" ||
        c === "photos" ||
        c === "homerulestruths" ||
        c === "home_rules_truths" ||
        c === "sections"
    ) {
        return "[]";
    }
    return null;
};

const upsertPropertiesDataSpecificToBrandsFromProperties = async (
    pool: import("pg").Pool,
    propertiesRows: Record<string, unknown>[],
    brandId: string,
    adminId: string,
    newTables: string[]
): Promise<number> => {
    if (propertiesRows.length === 0) return 0;

    const tableName = resolveFirstExistingTable(newTables, [
        "property_brand_mappings",
        "propertiesDataSpecificToBrands",
    ]);
    if (!tableName) return 0;

    const targetColumns = new Set(await getTargetColumns(pool, tableName));
    const jsonColumns = await getJsonColumns(pool, tableName);
    const propertyIdColumn = resolveColumnName(targetColumns, ["property_id", "propertyId"]);
    const brandIdColumn = resolveColumnName(targetColumns, ["brand_id", "brandId"]);
    const slugColumn = resolveColumnName(targetColumns, ["slug"]);
    const adminCreatedByColumn = resolveColumnName(targetColumns, [
        "adminCreatedBy",
        "admin_created_by",
    ]);
    const adminUpdatedByColumn = resolveColumnName(targetColumns, [
        "adminUpdatedBy",
        "admin_updated_by",
    ]);
    if (!propertyIdColumn || !brandIdColumn || !slugColumn) return 0;

    const sourceColumns = new Set<string>();
    for (const row of propertiesRows) {
        for (const key of Object.keys(row)) sourceColumns.add(key);
    }

    const excludedColumns = new Set([
        "id",
        propertyIdColumn,
        brandIdColumn,
        slugColumn,
        ...(adminCreatedByColumn ? [adminCreatedByColumn] : []),
        ...(adminUpdatedByColumn ? [adminUpdatedByColumn] : []),
    ]);

    const copyColumns = [...targetColumns].filter(
        (c) =>
            !excludedColumns.has(c) &&
            (sourceColumns.has(c) ||
                sourceColumns.has(toCamelCase(c)) ||
                sourceColumns.has(toCamelCase(c).replace(/Gst/g, "GST")))
    );

    const insertColumns = [
        propertyIdColumn,
        brandIdColumn,
        ...copyColumns,
        slugColumn,
        ...(adminCreatedByColumn ? [adminCreatedByColumn] : []),
        ...(adminUpdatedByColumn ? [adminUpdatedByColumn] : []),
    ];
    const updateColumns = [
        ...copyColumns,
        slugColumn,
        ...(adminUpdatedByColumn ? [adminUpdatedByColumn] : []),
    ];

    let count = 0;
    for (const row of propertiesRows) {
        const propertyId = row.id == null ? "" : String(row.id);
        if (!propertyId) continue;

        const hasSourceIsActive = Object.prototype.hasOwnProperty.call(row, "isActive");
        const hasSourceStatus = Object.prototype.hasOwnProperty.call(row, "status");
        const mappedValues: Record<string, unknown> = {};
        for (const c of copyColumns) {
            const sourceValue = readRowValueByTargetColumn(row, c);
            if ((c === "isActive" || c === "is_active") && !hasSourceIsActive && hasSourceStatus) {
                mappedValues[c] = row.status;
            } else if (jsonColumns.has(c)) {
                const value = sourceValue;
                if (typeof value === "string") {
                    const trimmed = value.trim();
                    if (trimmed.length === 0) {
                        mappedValues[c] =
                            tableName === "property_brand_mappings"
                                ? propertyBrandJsonFallback(c)
                                : null;
                    } else {
                        try {
                            mappedValues[c] = JSON.stringify(JSON.parse(trimmed));
                        } catch {
                            mappedValues[c] =
                                tableName === "property_brand_mappings"
                                    ? propertyBrandJsonFallback(c)
                                    : null;
                        }
                    }
                } else if (value == null) {
                    mappedValues[c] =
                        tableName === "property_brand_mappings"
                            ? propertyBrandJsonFallback(c)
                            : null;
                } else {
                    mappedValues[c] = JSON.stringify(value);
                }
            } else {
                mappedValues[c] = sourceValue;
            }
        }

        const values: unknown[] = [
            propertyId,
            brandId,
            ...copyColumns.map((c) => mappedValues[c]),
            toPropertyBrandSlugUnique(row, propertyId),
            ...(adminCreatedByColumn ? [adminId] : []),
            ...(adminUpdatedByColumn ? [adminId] : []),
        ];
        const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(",");
        const updates = updateColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");

        await pool.query(
            `
            INSERT INTO "${tableName}" (${insertColumns
                .map((c) => `"${c}"`)
                .join(",")})
            VALUES (${placeholders})
            ON CONFLICT ("${propertyIdColumn}","${brandIdColumn}")
            DO UPDATE SET ${updates}
        `,
            values
        );
        count += 1;
    }

    return count;
};

const upsertPropertyAreaMappingsFromProperties = async (
    pool: import("pg").Pool,
    propertiesRows: Record<string, unknown>[],
    newTables: string[]
): Promise<number> => {
    const tableName = resolveFirstExistingTable(newTables, [
        "property_area_mappings",
        "propertyAreaMappings",
    ]);
    if (!tableName) return 0;

    const targetColumns = new Set(await getTargetColumns(pool, tableName));
    const propertyIdColumn = resolveColumnName(targetColumns, ["property_id", "propertyId"]);
    const areaIdColumn = resolveColumnName(targetColumns, ["area_id", "areaId"]);
    const areaTypeColumn = resolveColumnName(targetColumns, ["area_type", "areaType"]);
    const sortOrderColumn = resolveColumnName(targetColumns, ["sort_order", "sortOrder"]);
    const createdAtColumn = resolveColumnName(targetColumns, ["createdAt", "created_at"]);
    const updatedAtColumn = resolveColumnName(targetColumns, ["updatedAt", "updated_at"]);
    if (!propertyIdColumn || !areaIdColumn || !areaTypeColumn || !sortOrderColumn) return 0;

    let count = 0;
    for (const row of propertiesRows) {
        const propertyId = String(row.id ?? "");
        if (!propertyId) continue;
        const createdAt = String(row.createdAt ?? new Date().toISOString());
        const updatedAt = String(row.updatedAt ?? createdAt);

        const areaCandidates: Array<{
            areaId: string;
            areaType: "PRIMARY" | "SECONDARY";
            sortOrder: number;
        }> = [];
        const primary = String(row.areaId ?? "");
        if (primary) areaCandidates.push({ areaId: primary, areaType: "PRIMARY", sortOrder: 0 });

        const secondaryKeys = [
            "secondaryAreaId1",
            "secondaryAreaId2",
            "secondaryAreaId3",
            "secondaryAreaId4",
        ] as const;
        secondaryKeys.forEach((key, idx) => {
            const areaId = String(row[key] ?? "");
            if (areaId) {
                areaCandidates.push({
                    areaId,
                    areaType: "SECONDARY",
                    sortOrder: idx + 1,
                });
            }
        });

        const seenAreas = new Set<string>();
        for (const area of areaCandidates) {
            if (seenAreas.has(area.areaId)) continue;
            seenAreas.add(area.areaId);

            const insertColumns = [propertyIdColumn, areaIdColumn, areaTypeColumn, sortOrderColumn];
            const values: unknown[] = [propertyId, area.areaId, area.areaType, area.sortOrder];
            if (createdAtColumn) {
                insertColumns.push(createdAtColumn);
                values.push(createdAt);
            }
            if (updatedAtColumn) {
                insertColumns.push(updatedAtColumn);
                values.push(updatedAt);
            }

            const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(", ");
            const updateColumns = [
                areaTypeColumn,
                sortOrderColumn,
                ...(updatedAtColumn ? [updatedAtColumn] : []),
            ];
            const updates = updateColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");

            await pool.query(
                `
                INSERT INTO "${tableName}" (${insertColumns.map((c) => `"${c}"`).join(",")})
                VALUES (${placeholders})
                ON CONFLICT ("${propertyIdColumn}","${areaIdColumn}")
                DO UPDATE SET ${updates}
            `,
                values
            );
            count += 1;
        }
    }

    return count;
};

const getPropertyBrandMappingLookup = async (
    pool: import("pg").Pool,
    mappingTableName: string,
    mappingTableColumns: Set<string>,
    brandId: string
): Promise<Map<string, string>> => {
    const mappingPropertyIdColumn = resolveColumnName(mappingTableColumns, [
        "property_id",
        "propertyId",
    ]);
    const mappingBrandIdColumn = resolveColumnName(mappingTableColumns, ["brand_id", "brandId"]);
    if (!mappingPropertyIdColumn || !mappingBrandIdColumn) return new Map<string, string>();

    const res = await pool.query(
        `
        SELECT "id", "${mappingPropertyIdColumn}" AS "propertyId"
        FROM "${mappingTableName}"
        WHERE "${mappingBrandIdColumn}" = $1
    `,
        [brandId]
    );
    const lookup = new Map<string, string>();
    for (const row of res.rows) {
        lookup.set(String(row.propertyId), String(row.id));
    }
    return lookup;
};

const upsertPropertyBrandBookingSettingsFromProperties = async (
    pool: import("pg").Pool,
    propertiesRows: Record<string, unknown>[],
    brandId: string,
    defaultAdminId: string,
    newTables: string[]
): Promise<number> => {
    const mappingTableName = resolveFirstExistingTable(newTables, [
        "property_brand_mappings",
        "propertiesDataSpecificToBrands",
    ]);
    const settingsTableName = resolveFirstExistingTable(newTables, [
        "property_brand_booking_settings",
        "propertyBrandBookingSettings",
    ]);
    if (!mappingTableName || !settingsTableName) return 0;

    const mappingTableColumns = new Set(await getTargetColumns(pool, mappingTableName));
    const settingsColumns = new Set(await getTargetColumns(pool, settingsTableName));
    const mappingIdColumn = resolveColumnName(settingsColumns, [
        "property_brand_mapping_id",
        "propertyBrandMappingId",
    ]);
    if (!mappingIdColumn) return 0;

    const mappingLookup = await getPropertyBrandMappingLookup(
        pool,
        mappingTableName,
        mappingTableColumns,
        brandId
    );
    if (mappingLookup.size === 0) return 0;

    let count = 0;
    for (const row of propertiesRows) {
        const propertyId = String(row.id ?? "");
        const propertyBrandMappingId = mappingLookup.get(propertyId);
        if (!propertyBrandMappingId) continue;

        const rowData: Record<string, unknown> = {
            [mappingIdColumn]: propertyBrandMappingId,
        };
        const put = (targetCandidates: string[], sourceKey: string): void => {
            const target = resolveColumnName(settingsColumns, targetCandidates);
            if (!target) return;
            if (!Object.prototype.hasOwnProperty.call(row, sourceKey)) return;
            rowData[target] = row[sourceKey];
        };

        put(["allow_call_booking", "allowCallBooking"], "allowCallBooking");
        put(["allow_enquiry", "allowEnquiry"], "allowEnquiry");
        put(["allow_online_booking", "allowOnlineBooking"], "allowOnlineBooking");
        put(["booking_type", "bookingType"], "bookingType");
        {
            const bookingTypeTarget = resolveColumnName(settingsColumns, [
                "booking_type",
                "bookingType",
            ]);
            if (bookingTypeTarget) {
                rowData[bookingTypeTarget] = normalizePropertyBookingType(row.bookingType);
            }
        }
        put(["checkin_time", "checkinTime"], "checkinTime");
        put(["checkout_time", "checkoutTime"], "checkoutTime");
        put(["booking_policy", "bookingPolicy"], "bookingPolicy");
        put(["requires_confirmation", "requiresConfirmation"], "requiresConfirmation");
        put(["advance_payment_enabled", "advancePaymentEnabled"], "advancePaymentEnabled");
        put(["advance_payment_amount", "advancePaymentAmount"], "advancePaymentAmount");
        put(["advance_payment_percentage", "advancePaymentPercentage"], "advancePaymentPercentage");
        put(["enable_floating_guests", "enableFloatingGuests"], "enableFloatingGuests");
        put(["commission_percentage", "commissionPercentage"], "commissionPercentage");
        put(["security_deposit", "securityDeposit"], "securityDeposit");
        put(["cooking_access_fee", "cookingAccessFee"], "cookingAccessFee");

        const createdAtCol = resolveColumnName(settingsColumns, ["createdAt", "created_at"]);
        const updatedAtCol = resolveColumnName(settingsColumns, ["updatedAt", "updated_at"]);
        const adminCreatedByCol = resolveColumnName(settingsColumns, [
            "adminCreatedBy",
            "admin_created_by",
        ]);
        const adminUpdatedByCol = resolveColumnName(settingsColumns, [
            "adminUpdatedBy",
            "admin_updated_by",
        ]);
        if (createdAtCol) rowData[createdAtCol] = row.createdAt ?? new Date().toISOString();
        if (updatedAtCol) rowData[updatedAtCol] = row.updatedAt ?? row.createdAt ?? new Date().toISOString();
        if (adminCreatedByCol) rowData[adminCreatedByCol] = row.adminCreatedBy ?? defaultAdminId;
        if (adminUpdatedByCol) rowData[adminUpdatedByCol] = row.adminUpdatedBy ?? defaultAdminId;

        // Normalize advance payment fields to satisfy:
        // 1) amount OR percentage OR neither
        // 2) if enabled=false then both amount/percentage must be null
        // 3) if enabled=true then one of amount/percentage must be present
        const advanceEnabledCol = resolveColumnName(settingsColumns, [
            "advance_payment_enabled",
            "advancePaymentEnabled",
        ]);
        const advanceAmountCol = resolveColumnName(settingsColumns, [
            "advance_payment_amount",
            "advancePaymentAmount",
        ]);
        const advancePctCol = resolveColumnName(settingsColumns, [
            "advance_payment_percentage",
            "advancePaymentPercentage",
        ]);
        if (advanceEnabledCol && advanceAmountCol && advancePctCol) {
            let amount = toNullableNumber(rowData[advanceAmountCol]);
            let pct = toNullableNumber(rowData[advancePctCol]);

            // Never allow both simultaneously.
            if (amount != null && pct != null) {
                pct = null;
            }

            let enabled = toBool(rowData[advanceEnabledCol] ?? false);

            // If values exist, force enabled=true.
            if (amount != null || pct != null) enabled = true;

            // If enabled but no value, downgrade to disabled.
            if (enabled && amount == null && pct == null) enabled = false;

            if (!enabled) {
                amount = null;
                pct = null;
            }

            rowData[advanceEnabledCol] = enabled;
            rowData[advanceAmountCol] = amount;
            rowData[advancePctCol] = pct;
        }

        const columns = Object.keys(rowData);
        if (columns.length <= 1) continue;
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(", ");
        const values = columns.map((c) => rowData[c]);
        const updateColumns = columns.filter((c) => c !== mappingIdColumn);
        const updates = updateColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
        await pool.query(
            `
            INSERT INTO "${settingsTableName}" (${columns.map((c) => `"${c}"`).join(",")})
            VALUES (${placeholders})
            ON CONFLICT ("${mappingIdColumn}")
            DO UPDATE SET ${updates}
        `,
            values
        );
        count += 1;
    }

    return count;
};

const upsertPropertyBrandPricingRulesFromProperties = async (
    pool: import("pg").Pool,
    propertiesRows: Record<string, unknown>[],
    brandId: string,
    defaultAdminId: string,
    newTables: string[]
): Promise<number> => {
    const mappingTableName = resolveFirstExistingTable(newTables, [
        "property_brand_mappings",
        "propertiesDataSpecificToBrands",
    ]);
    const pricingTableName = resolveFirstExistingTable(newTables, [
        "property_brand_pricing_rules",
        "propertyBrandPricingRules",
    ]);
    if (!mappingTableName || !pricingTableName) return 0;

    const mappingTableColumns = new Set(await getTargetColumns(pool, mappingTableName));
    const pricingColumns = new Set(await getTargetColumns(pool, pricingTableName));
    const mappingIdColumn = resolveColumnName(pricingColumns, [
        "property_brand_mapping_id",
        "propertyBrandMappingId",
    ]);
    const dayOfWeekColumn = resolveColumnName(pricingColumns, ["day_of_week", "dayOfWeek"]);
    if (!mappingIdColumn || !dayOfWeekColumn) return 0;

    const mappingLookup = await getPropertyBrandMappingLookup(
        pool,
        mappingTableName,
        mappingTableColumns,
        brandId
    );
    if (mappingLookup.size === 0) return 0;

    const dayMap: Array<{ enumValue: string; prefix: string }> = [
        { enumValue: "MONDAY", prefix: "monday" },
        { enumValue: "TUESDAY", prefix: "tuesday" },
        { enumValue: "WEDNESDAY", prefix: "wednesday" },
        { enumValue: "THURSDAY", prefix: "thursday" },
        { enumValue: "FRIDAY", prefix: "friday" },
        { enumValue: "SATURDAY", prefix: "saturday" },
        { enumValue: "SUNDAY", prefix: "sunday" },
    ];

    let count = 0;
    for (const row of propertiesRows) {
        const propertyId = String(row.id ?? "");
        const propertyBrandMappingId = mappingLookup.get(propertyId);
        if (!propertyBrandMappingId) continue;

        for (const { enumValue, prefix } of dayMap) {
            const rowData: Record<string, unknown> = {
                [mappingIdColumn]: propertyBrandMappingId,
                [dayOfWeekColumn]: enumValue,
            };

            const put = (targetCandidates: string[], sourceKey: string): void => {
                const target = resolveColumnName(pricingColumns, targetCandidates);
                if (!target) return;
                if (!Object.prototype.hasOwnProperty.call(row, sourceKey)) return;
                rowData[target] = row[sourceKey];
            };

            put(["base_price", "basePrice"], `${prefix}Price`);
            put(["base_price_with_gst", "basePriceWithGst", "basePriceWithGST"], `${prefix}PriceWithGST`);
            put(["adult_extra_guest_charge", "adultExtraGuestCharge"], `${prefix}AdultExtraGuestCharge`);
            put(
                ["adult_extra_guest_charge_with_gst", "adultExtraGuestChargeWithGst", "adultExtraGuestChargeWithGST"],
                `${prefix}AdultExtraGuestChargeWithGST`
            );
            put(["child_extra_guest_charge", "childExtraGuestCharge"], `${prefix}ChildExtraGuestCharge`);
            put(
                ["child_extra_guest_charge_with_gst", "childExtraGuestChargeWithGst", "childExtraGuestChargeWithGST"],
                `${prefix}ChildExtraGuestChargeWithGST`
            );
            put(["infant_extra_guest_charge", "infantExtraGuestCharge"], `${prefix}InfantExtraGuestCharge`);
            put(
                ["infant_extra_guest_charge_with_gst", "infantExtraGuestChargeWithGst", "infantExtraGuestChargeWithGST"],
                `${prefix}InfantExtraGuestChargeWithGST`
            );
            put(
                ["floating_adult_extra_guest_charge", "floatingAdultExtraGuestCharge"],
                `${prefix}FloatingAdultExtraGuestCharge`
            );
            put(
                ["floating_adult_extra_guest_charge_with_gst", "floatingAdultExtraGuestChargeWithGst", "floatingAdultExtraGuestChargeWithGST"],
                `${prefix}FloatingAdultExtraGuestChargeWithGST`
            );
            put(
                ["floating_child_extra_guest_charge", "floatingChildExtraGuestCharge"],
                `${prefix}FloatingChildExtraGuestCharge`
            );
            put(
                ["floating_child_extra_guest_charge_with_gst", "floatingChildExtraGuestChargeWithGst", "floatingChildExtraGuestChargeWithGST"],
                `${prefix}FloatingChildExtraGuestChargeWithGST`
            );
            put(
                ["floating_infant_extra_guest_charge", "floatingInfantExtraGuestCharge"],
                `${prefix}FloatingInfantExtraGuestCharge`
            );
            put(
                ["floating_infant_extra_guest_charge_with_gst", "floatingInfantExtraGuestChargeWithGst", "floatingInfantExtraGuestChargeWithGST"],
                `${prefix}FloatingInfantExtraGuestChargeWithGST`
            );
            put(["base_guest_count", "baseGuestCount"], `${prefix}BaseGuestCount`);
            put(["discount"], `${prefix}Discount`);
            put(["gst_slab", "gstSlab", "GSTSlab"], `${prefix}GSTSlab`);
            put(["max_extra_guest_price", "maxExtraGuestPrice"], `${prefix}MaxExtraGuestPrice`);
            put(["max_total", "maxTotal"], `${prefix}MaxTotal`);

            const createdAtCol = resolveColumnName(pricingColumns, ["createdAt", "created_at"]);
            const updatedAtCol = resolveColumnName(pricingColumns, ["updatedAt", "updated_at"]);
            const adminCreatedByCol = resolveColumnName(pricingColumns, [
                "adminCreatedBy",
                "admin_created_by",
            ]);
            const adminUpdatedByCol = resolveColumnName(pricingColumns, [
                "adminUpdatedBy",
                "admin_updated_by",
            ]);
            if (createdAtCol) rowData[createdAtCol] = row.createdAt ?? new Date().toISOString();
            if (updatedAtCol) rowData[updatedAtCol] = row.updatedAt ?? row.createdAt ?? new Date().toISOString();
            if (adminCreatedByCol) rowData[adminCreatedByCol] = row.adminCreatedBy ?? defaultAdminId;
            if (adminUpdatedByCol) rowData[adminUpdatedByCol] = row.adminUpdatedBy ?? defaultAdminId;

            const hasPricingValue = Object.keys(rowData).some((k) => {
                if (k === mappingIdColumn || k === dayOfWeekColumn) return false;
                return rowData[k] != null;
            });
            if (!hasPricingValue) continue;

            const columns = Object.keys(rowData);
            const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(", ");
            const values = columns.map((c) => rowData[c]);
            const updateColumns = columns.filter(
                (c) => c !== mappingIdColumn && c !== dayOfWeekColumn
            );
            const updates = updateColumns.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
            await pool.query(
                `
                INSERT INTO "${pricingTableName}" (${columns.map((c) => `"${c}"`).join(",")})
                VALUES (${placeholders})
                ON CONFLICT ("${mappingIdColumn}","${dayOfWeekColumn}")
                DO UPDATE SET ${updates}
            `,
                values
            );
            count += 1;
        }
    }

    return count;
};

const derivePropertyCouponsFromCoupons = async (
    pool: import("pg").Pool,
    newTables: string[],
    defaultAdminId: string | null
): Promise<number> => {
    if (!defaultAdminId) return 0;
    if (!newTables.includes("propertyCoupons")) return 0;
    if (!newTables.includes("coupons")) return 0;

    const mappingTableName = resolveFirstExistingTable(newTables, [
        "property_brand_mappings",
        "propertiesDataSpecificToBrands",
    ]);
    if (!mappingTableName) return 0;

    const mappingColumns = new Set(await getTargetColumns(pool, mappingTableName));
    const couponsColumns = new Set(await getTargetColumns(pool, "coupons"));
    const mappingPropertyIdColumn = resolveColumnName(mappingColumns, ["property_id", "propertyId"]);
    const mappingBrandIdColumn = resolveColumnName(mappingColumns, ["brand_id", "brandId"]);
    const couponsBrandIdColumn = resolveColumnName(couponsColumns, ["brand_id", "brandId"]);
    if (!mappingPropertyIdColumn || !mappingBrandIdColumn || !couponsBrandIdColumn) return 0;

    const res = await pool.query(
        `
        INSERT INTO "propertyCoupons"
            ("propertyId","couponId","allowed","adminCreatedBy","adminUpdatedBy")
        SELECT DISTINCT
            pbm."${mappingPropertyIdColumn}" AS "propertyId",
            c."id" AS "couponId",
            true,
            $1::uuid,
            $1::uuid
        FROM "${mappingTableName}" pbm
        JOIN "coupons" c
          ON c."${couponsBrandIdColumn}" = pbm."${mappingBrandIdColumn}"
        WHERE pbm."${mappingPropertyIdColumn}" IS NOT NULL
        ON CONFLICT ("propertyId","couponId") DO NOTHING
        RETURNING 1
    `,
        [defaultAdminId]
    );

    return res.rowCount ?? 0;
};

const normalizePhotoCategory = (value: unknown): string => {
    const token = normalizeEnumToken(value);
    const allowed = new Set(["OUTDOORS", "INDOORS", "BED_BATH", "AMENITIES", "OTHERS"]);
    return allowed.has(token) ? token : "OTHERS";
};

const derivePhotoPropertyBrandMappingFromPropertyPhotos = async (
    pool: import("pg").Pool,
    propertyPhotosRows: Record<string, unknown>[],
    newTables: string[]
): Promise<number> => {
    if (propertyPhotosRows.length === 0) return 0;

    const targetTable = resolveFirstExistingTable(newTables, [
        "photoPropertyBrandMapping",
        "photo_property_brand_mapping",
    ]);
    if (!targetTable) return 0;

    const mappingTable = resolveFirstExistingTable(newTables, [
        "property_brand_mappings",
        "propertiesDataSpecificToBrands",
    ]);
    if (!mappingTable) return 0;

    const mappingCols = new Set(await getTargetColumns(pool, mappingTable));
    const mappingIdCol = resolveColumnName(mappingCols, ["id"]);
    const mappingPropertyIdCol = resolveColumnName(mappingCols, ["property_id", "propertyId"]);
    if (!mappingIdCol || !mappingPropertyIdCol) return 0;

    const mappingRes = await pool.query(
        `
        SELECT "${mappingIdCol}" AS "id", "${mappingPropertyIdCol}" AS "propertyId"
        FROM "${mappingTable}"
    `
    );
    const propertyToBrandMappingId = new Map<string, string>();
    for (const r of mappingRes.rows) {
        const propertyId = String(r.propertyId ?? "");
        const id = String(r.id ?? "");
        if (!propertyId || !id) continue;
        if (!propertyToBrandMappingId.has(propertyId)) {
            propertyToBrandMappingId.set(propertyId, id);
        }
    }
    if (propertyToBrandMappingId.size === 0) return 0;

    const photoIds = [
        ...new Set(
            propertyPhotosRows
                .map((r) => String(r.photoId ?? ""))
                .filter((id) => id.length > 0)
        ),
    ];
    const photoToUrl = new Map<string, string>();
    if (photoIds.length > 0) {
        const photosRes = await pool.query(
            `
            SELECT "id", "originalUrl"
            FROM "photos"
            WHERE "id" = ANY($1::uuid[])
        `,
            [photoIds]
        );
        for (const r of photosRes.rows) {
            const id = String(r.id ?? "");
            const url = String(r.originalUrl ?? "");
            if (id && url) photoToUrl.set(id, url);
        }
    }

    let count = 0;
    for (const row of propertyPhotosRows) {
        const propertyId = String(row.propertyId ?? "");
        const photoId = String(row.photoId ?? "");
        if (!propertyId || !photoId) continue;

        const propertyBrandMappingId = propertyToBrandMappingId.get(propertyId);
        if (!propertyBrandMappingId) continue;

        const watermarkedUrl = photoToUrl.get(photoId);
        if (!watermarkedUrl) continue;

        const category = normalizePhotoCategory(row.category);
        const sortOrder =
            typeof row.sortOrder === "number"
                ? row.sortOrder
                : Number(row.sortOrder ?? 0) || 0;
        const createdAt = String(row.createdAt ?? new Date().toISOString());
        const updatedAt = String(row.updatedAt ?? createdAt);

        await pool.query(
            `
            INSERT INTO "${targetTable}"
                ("photoId","propertyBrandMappingId","watermarkedUrl","category","sortOrder","isFeatured","createdAt","updatedAt")
            VALUES
                ($1::uuid,$2::uuid,$3,$4,$5,false,$6,$7)
            ON CONFLICT ("photoId","propertyBrandMappingId")
            DO UPDATE SET
                "watermarkedUrl" = EXCLUDED."watermarkedUrl",
                "category" = EXCLUDED."category",
                "sortOrder" = EXCLUDED."sortOrder",
                "updatedAt" = EXCLUDED."updatedAt"
        `,
            [photoId, propertyBrandMappingId, watermarkedUrl, category, sortOrder, createdAt, updatedAt]
        );
        count += 1;
    }

    return count;
};

const seedAdminRolesAndPermissions = async (
    pool: import("pg").Pool,
    newTables: string[],
    dryRun: boolean
): Promise<void> => {
    if (dryRun) {
        log("info", "Skipping admin role/permission seed in dry-run mode");
        return;
    }

    const requiredTables = ["admins", "adminPermissions", "adminRolePermissions"];
    const missingTables = requiredTables.filter((tableName) => !newTables.includes(tableName));
    if (missingTables.length > 0) {
        log("warn", "Skipping admin role/permission seed due to missing table(s)", {
            missingTables,
        });
        return;
    }

    const sql = `
        WITH actor AS (
          SELECT id
          FROM "admins"
          ORDER BY "createdAt" ASC
          LIMIT 1
        ),
        permission_seed(key, label) AS (
          VALUES
            ('DASHBOARD', 'Dashboard'),
            ('ALL_USERS', 'All Users'),
            ('ADMINS', 'Admins'),
            ('CUSTOMERS', 'Customers'),
            ('SUPERVISORS', 'Supervisors'),
            ('OWNER_GANG', 'Owner gang'),
            ('ALL_PROPERTY_USERS', 'All Property Users'),
            ('OWNERS', 'Owners'),
            ('MANAGERS', 'Managers'),
            ('CARETAKERS', 'Caretakers'),
            ('LOCATIONS', 'Locations'),
            ('PROPERTY_DATA', 'Property Data'),
            ('PROPOSALS', 'Proposals'),
            ('BOOKING_MANAGEMENT', 'Booking Management'),
            ('WALLET_AND_SETTLEMENTS', 'Wallet & Settlements'),
            ('REPORTS', 'Reports'),
            ('COUPONS', 'Coupons'),
            ('COLLECTIONS', 'Collections'),
            ('AUDIT_DATA', 'Audit Data'),
            ('CONTACT_REQUESTS', 'Contact Requests'),
            ('NOTIFICATIONS', 'Notifications'),
            ('INSTAFARMS_SPECIFIC_DATA', 'Instafarms Specific Data'),
            ('HISTORY', 'History')
        ),
        upsert_permissions AS (
          INSERT INTO "adminPermissions"
            ("key", "label", "description", "isActive", "adminCreatedBy", "adminUpdatedBy")
          SELECT
            ps.key::"adminPermissionKey",
            ps.label,
            NULL,
            TRUE,
            a.id,
            a.id
          FROM permission_seed ps
          CROSS JOIN actor a
          ON CONFLICT ("key") DO UPDATE
          SET
            "label" = EXCLUDED."label",
            "isActive" = TRUE,
            "adminUpdatedBy" = (SELECT id FROM actor),
            "updatedAt" = CURRENT_TIMESTAMP
          RETURNING "key", id
        ),
        all_permissions AS (
          SELECT ap.id, ap."key"
          FROM "adminPermissions" ap
          JOIN permission_seed ps
            ON ap."key" = ps.key::"adminPermissionKey"
        ),
        roles(role) AS (
          VALUES
            ('SUPER_ADMIN'),
            ('OPS_TEAM'),
            ('SALES_EXECUTIVE'),
            ('FINANCE_TEAM')
        ),
        allowed(role, key) AS (
          VALUES
            ('SUPER_ADMIN', 'DASHBOARD'),
            ('SUPER_ADMIN', 'ALL_USERS'),
            ('SUPER_ADMIN', 'ADMINS'),
            ('SUPER_ADMIN', 'CUSTOMERS'),
            ('SUPER_ADMIN', 'SUPERVISORS'),
            ('SUPER_ADMIN', 'OWNER_GANG'),
            ('SUPER_ADMIN', 'ALL_PROPERTY_USERS'),
            ('SUPER_ADMIN', 'OWNERS'),
            ('SUPER_ADMIN', 'MANAGERS'),
            ('SUPER_ADMIN', 'CARETAKERS'),
            ('SUPER_ADMIN', 'LOCATIONS'),
            ('SUPER_ADMIN', 'PROPERTY_DATA'),
            ('SUPER_ADMIN', 'PROPOSALS'),
            ('SUPER_ADMIN', 'BOOKING_MANAGEMENT'),
            ('SUPER_ADMIN', 'WALLET_AND_SETTLEMENTS'),
            ('SUPER_ADMIN', 'REPORTS'),
            ('SUPER_ADMIN', 'COUPONS'),
            ('SUPER_ADMIN', 'COLLECTIONS'),
            ('SUPER_ADMIN', 'AUDIT_DATA'),
            ('SUPER_ADMIN', 'CONTACT_REQUESTS'),
            ('SUPER_ADMIN', 'NOTIFICATIONS'),
            ('SUPER_ADMIN', 'INSTAFARMS_SPECIFIC_DATA'),
            ('SUPER_ADMIN', 'HISTORY'),
            ('OPS_TEAM', 'DASHBOARD'),
            ('OPS_TEAM', 'ALL_USERS'),
            ('OPS_TEAM', 'ADMINS'),
            ('OPS_TEAM', 'CUSTOMERS'),
            ('OPS_TEAM', 'SUPERVISORS'),
            ('OPS_TEAM', 'OWNER_GANG'),
            ('OPS_TEAM', 'ALL_PROPERTY_USERS'),
            ('OPS_TEAM', 'OWNERS'),
            ('OPS_TEAM', 'MANAGERS'),
            ('OPS_TEAM', 'CARETAKERS'),
            ('OPS_TEAM', 'LOCATIONS'),
            ('OPS_TEAM', 'PROPERTY_DATA'),
            ('OPS_TEAM', 'PROPOSALS'),
            ('OPS_TEAM', 'BOOKING_MANAGEMENT'),
            ('OPS_TEAM', 'WALLET_AND_SETTLEMENTS'),
            ('OPS_TEAM', 'REPORTS'),
            ('OPS_TEAM', 'COUPONS'),
            ('OPS_TEAM', 'COLLECTIONS'),
            ('OPS_TEAM', 'AUDIT_DATA'),
            ('OPS_TEAM', 'CONTACT_REQUESTS'),
            ('OPS_TEAM', 'NOTIFICATIONS'),
            ('OPS_TEAM', 'INSTAFARMS_SPECIFIC_DATA'),
            ('OPS_TEAM', 'HISTORY'),
            ('SALES_EXECUTIVE', 'PROPOSALS'),
            ('SALES_EXECUTIVE', 'BOOKING_MANAGEMENT'),
            ('SALES_EXECUTIVE', 'COUPONS'),
            ('SALES_EXECUTIVE', 'NOTIFICATIONS'),
            ('FINANCE_TEAM', 'DASHBOARD'),
            ('FINANCE_TEAM', 'ALL_USERS'),
            ('FINANCE_TEAM', 'ADMINS'),
            ('FINANCE_TEAM', 'CUSTOMERS'),
            ('FINANCE_TEAM', 'SUPERVISORS'),
            ('FINANCE_TEAM', 'OWNER_GANG'),
            ('FINANCE_TEAM', 'ALL_PROPERTY_USERS'),
            ('FINANCE_TEAM', 'OWNERS'),
            ('FINANCE_TEAM', 'MANAGERS'),
            ('FINANCE_TEAM', 'CARETAKERS'),
            ('FINANCE_TEAM', 'BOOKING_MANAGEMENT'),
            ('FINANCE_TEAM', 'WALLET_AND_SETTLEMENTS'),
            ('FINANCE_TEAM', 'REPORTS'),
            ('FINANCE_TEAM', 'NOTIFICATIONS')
        ),
        matrix AS (
          SELECT
            r.role::"adminPanelRole" AS role,
            p."key",
            CASE WHEN a.key IS NULL THEN FALSE ELSE TRUE END AS can_view,
            CASE WHEN a.key IS NULL THEN FALSE ELSE TRUE END AS can_edit
          FROM roles r
          CROSS JOIN all_permissions p
          LEFT JOIN allowed a
            ON a.role = r.role
           AND a.key = p."key"::text
        )
        INSERT INTO "adminRolePermissions"
          ("role", "permissionId", "canView", "canEdit", "adminCreatedBy", "adminUpdatedBy")
        SELECT
          m.role,
          p.id,
          m.can_view,
          m.can_edit,
          ac.id,
          ac.id
        FROM matrix m
        JOIN all_permissions p
          ON p."key" = m."key"
        CROSS JOIN actor ac
        ON CONFLICT ("role", "permissionId") DO UPDATE
        SET
          "canView" = EXCLUDED."canView",
          "canEdit" = EXCLUDED."canEdit",
          "adminUpdatedBy" = (SELECT id FROM actor),
          "updatedAt" = CURRENT_TIMESTAMP;

        UPDATE "admins"
        SET
          "panelRole" = 'SUPER_ADMIN'::"adminPanelRole",
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "panelRole" IS DISTINCT FROM 'SUPER_ADMIN'::"adminPanelRole";
    `;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        log("info", "Seeded admin permissions, role mappings, and SUPER_ADMIN assignments");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
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
        if (newTables.length === 0) {
            throw new Error(
                "No tables found in NEW_DATABASE_URL. Apply schema first with `npm run schema:push`."
            );
        }

        const toImport = config.singleTable
            ? tablesFromManifest.filter((t) => t === config.singleTable)
            : tablesFromManifest;
        const requiredTargets = [
            ...new Set(
                toImport
                    .map((sourceTable) => getRuleForTable(sourceTable))
                    .filter((rule) => rule.mode !== "skip")
                    .map((rule) => rule.targetTable ?? rule.sourceTable)
            ),
        ];
        const missingTargets = requiredTargets.filter((target) => !newTables.includes(target));
        if (missingTargets.length > 0) {
            const preview = missingTargets.slice(0, 20).join(", ");
            const suffix =
                missingTargets.length > 20
                    ? ` ... (+${missingTargets.length - 20} more)`
                    : "";
            throw new Error(
                `Target schema is not fully applied. Missing required table(s): ${preview}${suffix}. Run \`npm run schema:push\` and retry.`
            );
        }

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
            photos: new Set<string>(),
            carousel: new Set<string>(),
        };
        const adminIds = new Set<string>();
        if (newTables.includes("admins")) {
            const admins = await newPool.query(`SELECT "id" FROM "admins"`);
            for (const row of admins.rows) adminIds.add(String(row.id));
        }

        const idStrategyReport: Record<string, { mode: string; reason: string }> = {};
        const idMapsDir = path.join(config.dataDir, "_id-map");
        await mkdir(idMapsDir, { recursive: true });
        let sourcePropertiesRows: Record<string, unknown>[] | null = null;
        let sourceCancellationsRows: Record<string, unknown>[] | null = null;
        let sourcePropertyPhotosRows: Record<string, unknown>[] | null = null;

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
            if (sourceTable === "properties") {
                // Keep original source rows so the old properties table is split
                // into new properties + propertiesDataSpecificToBrands.
                sourcePropertiesRows = rows;
            }
            if (sourceTable === "cancellations") {
                sourceCancellationsRows = rows;
            }
            if (sourceTable === "propertyPhotos") {
                sourcePropertyPhotosRows = rows;
            }

            let rowsToInsert = rows;
            let generatedIdMap: Record<string, string> = {};
            const idMode = await detectIdMode(newPool, targetTable);
            idStrategyReport[sourceTable] = idMode;

            if (rule.mode === "transform" && sourceTable === "listingUsers") {
                const transformed = transformListingUsersToCustomers(rows);
                rowsToInsert = transformed.transformed;
                generatedIdMap = transformed.idMap;
            } else if (rule.mode === "transform" && sourceTable === "payments") {
                rowsToInsert = transformPaymentsToBookingPayments(rows);
            } else if (rule.mode === "transform" && sourceTable === "cancellations") {
                rowsToInsert = transformCancellationsToBookingCancellation(rows);
            } else if (rule.mode === "transform" && sourceTable === "ownersWallet") {
                rowsToInsert = transformOwnersWalletToOwnerWallet(rows);
            } else if (rule.mode === "transform" && sourceTable === "walletTransactions") {
                rowsToInsert = transformWalletTransactionsToOwnerWalletLedger(rows);
            } else if (rule.mode === "transform" && sourceTable === "walletWithdrawalRequests") {
                rowsToInsert = transformWalletWithdrawalRequestsToOwnerPayouts(rows);
            } else if (idMode.mode === "regenerate") {
                // no-op generic regenerate placeholder for future table-specific mappings
                generatedIdMap = {};
            }

            const targetColumns = new Set(await getTargetColumns(newPool, targetTable));
            const brandIdColumn = resolveColumnName(targetColumns, ["brandId", "brand_id"]);
            const adminIdColumn = resolveColumnName(targetColumns, ["adminId", "admin_id"]);
            const settlementBlockedByColumn = resolveColumnName(targetColumns, [
                "settlementBlockedBy",
                "settlement_blocked_by",
            ]);
            const adminCreatedByColumn = resolveColumnName(targetColumns, [
                "adminCreatedBy",
                "admin_created_by",
            ]);
            const adminUpdatedByColumn = resolveColumnName(targetColumns, [
                "adminUpdatedBy",
                "admin_updated_by",
            ]);
            const cancellationPlanIdColumn = resolveColumnName(targetColumns, [
                "cancellationPlanId",
                "cancellation_plan_id",
            ]);

            const filteredRows = rowsToInsert.map((r) => {
                const out: Record<string, unknown> = {};
                for (const targetColumn of targetColumns) {
                    const value = readRowValueByTargetColumn(r, targetColumn);
                    if (value !== undefined) out[targetColumn] = value;
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
                // Auto-fill brandId from default brand whenever target has brandId and source row is missing it.
                if (
                    defaultBrandId &&
                    brandIdColumn &&
                    (out[brandIdColumn] == null || out[brandIdColumn] === "")
                ) {
                    out[brandIdColumn] = defaultBrandId;
                }
                if (
                    targetTable === "cancellationPercentages" &&
                    cancellationPlanIdColumn &&
                    out[cancellationPlanIdColumn] != null &&
                    cancellationPlanIdMap.has(String(out[cancellationPlanIdColumn]))
                ) {
                    out[cancellationPlanIdColumn] = cancellationPlanIdMap.get(
                        String(out[cancellationPlanIdColumn])
                    );
                }
                if (
                    targetTable === "propertyCancellationPlans" &&
                    cancellationPlanIdColumn &&
                    out[cancellationPlanIdColumn] != null &&
                    cancellationPlanIdMap.has(String(out[cancellationPlanIdColumn]))
                ) {
                    out[cancellationPlanIdColumn] = cancellationPlanIdMap.get(
                        String(out[cancellationPlanIdColumn])
                    );
                }
                if (
                    defaultAdminId &&
                    adminIdColumn &&
                    (out[adminIdColumn] == null ||
                        out[adminIdColumn] === "" ||
                        !adminIds.has(String(out[adminIdColumn])))
                ) {
                    out[adminIdColumn] = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    settlementBlockedByColumn &&
                    (out[settlementBlockedByColumn] == null ||
                        out[settlementBlockedByColumn] === "" ||
                        !adminIds.has(String(out[settlementBlockedByColumn])))
                ) {
                    out[settlementBlockedByColumn] = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    adminCreatedByColumn &&
                    (out[adminCreatedByColumn] == null ||
                        out[adminCreatedByColumn] === "" ||
                        !adminIds.has(String(out[adminCreatedByColumn])))
                ) {
                    out[adminCreatedByColumn] = defaultAdminId;
                }
                if (
                    defaultAdminId &&
                    adminUpdatedByColumn &&
                    (out[adminUpdatedByColumn] == null ||
                        out[adminUpdatedByColumn] === "" ||
                        !adminIds.has(String(out[adminUpdatedByColumn])))
                ) {
                    out[adminUpdatedByColumn] = defaultAdminId;
                }
                if (targetTable === "properties") {
                    applyPropertiesRequiredDefaults(out, targetColumns);
                }
                if (targetTable === "bookings") {
                    applyBookingsEnumNormalization(out, targetColumns);
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
            if (targetTable === "carouselPhotos") {
                if (newTables.includes("photos")) {
                    existingIds.photos = await getIdSet(newPool, "photos");
                }
                if (newTables.includes("carousel")) {
                    existingIds.carousel = await getIdSet(newPool, "carousel");
                }
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
            } else if (targetTable === "carouselPhotos") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const photoId = String(row.photoId ?? "");
                    const carouselId = String(row.carouselId ?? "");
                    return (
                        photoId.length > 0 &&
                        carouselId.length > 0 &&
                        existingIds.photos.has(photoId) &&
                        existingIds.carousel.has(carouselId)
                    );
                });
            } else if (targetTable === "photos") {
                rowsAfterFkValidation = filteredRows.filter((row) => {
                    const originalUrl = String(
                        row.originalUrl ?? row.original_url ?? ""
                    ).trim();
                    return originalUrl.length > 0;
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

        if (!config.dryRun && newTables.includes("bookingRefund")) {
            const cancellationsSource =
                sourceCancellationsRows ??
                (await readTableRows(config.dataDir, "cancellations.json").catch(
                    () => [] as Record<string, unknown>[]
                ));
            if (cancellationsSource.length > 0) {
                const refundRows = transformCancellationsToBookingRefund(cancellationsSource);
                let inserted = 0;
                for (let i = 0; i < refundRows.length; i += config.batchSize) {
                    const batch = refundRows.slice(i, i + config.batchSize);
                    await insertRowsDoNothing(newPool, "bookingRefund", batch);
                    inserted += batch.length;
                }
                log("info", "Derived bookingRefund from cancellations", { rows: inserted });
            }
        }

        // brand-layer derivation
        if (!config.dryRun && newTables.includes("brands")) {
            const adminRes = await newPool.query(`SELECT "id" FROM "admins" LIMIT 1`);
            if ((adminRes.rowCount ?? 0) > 0) {
                const adminId = adminRes.rows[0].id as string;
                const brandId = defaultBrandId;
                if (!brandId) {
                    log("warn", "Skipping brand-layer derivation because default brand could not be resolved");
                } else {
                    const propertiesSource =
                        sourcePropertiesRows ?? (await readTableRows(config.dataDir, "properties.json"));
                    const brandRowsUpserted = await upsertPropertiesDataSpecificToBrandsFromProperties(
                        newPool,
                        propertiesSource,
                        brandId,
                        adminId,
                        newTables
                    );
                    log("info", "Split properties into brand mappings", {
                        rows: brandRowsUpserted,
                    });

                const areaRowsUpserted = await upsertPropertyAreaMappingsFromProperties(
                    newPool,
                    propertiesSource,
                    newTables
                );
                if (areaRowsUpserted > 0) {
                    log("info", "Split properties into property area mappings", {
                        rows: areaRowsUpserted,
                    });
                }

                const bookingSettingsRowsUpserted =
                    await upsertPropertyBrandBookingSettingsFromProperties(
                        newPool,
                        propertiesSource,
                        brandId,
                        adminId,
                        newTables
                    );
                if (bookingSettingsRowsUpserted > 0) {
                    log("info", "Split properties into property brand booking settings", {
                        rows: bookingSettingsRowsUpserted,
                    });
                }

                const pricingRuleRowsUpserted = await upsertPropertyBrandPricingRulesFromProperties(
                    newPool,
                    propertiesSource,
                    brandId,
                    adminId,
                    newTables
                );
                if (pricingRuleRowsUpserted > 0) {
                    log("info", "Split properties into property brand pricing rules", {
                        rows: pricingRuleRowsUpserted,
                    });
                }

                const derivedPropertyCoupons = await derivePropertyCouponsFromCoupons(
                    newPool,
                    newTables,
                    defaultAdminId
                );
                if (derivedPropertyCoupons > 0) {
                    log("info", "Derived propertyCoupons from coupons", {
                        rows: derivedPropertyCoupons,
                    });
                }

                const propertyPhotosSource =
                    sourcePropertyPhotosRows ??
                    (await readTableRows(config.dataDir, "propertyPhotos.json").catch(
                        () => [] as Record<string, unknown>[]
                    ));
                const derivedPhotoPropertyBrandMappings =
                    await derivePhotoPropertyBrandMappingFromPropertyPhotos(
                        newPool,
                        propertyPhotosSource,
                        newTables
                    );
                if (derivedPhotoPropertyBrandMappings > 0) {
                    log("info", "Derived photoPropertyBrandMapping from propertyPhotos", {
                        rows: derivedPhotoPropertyBrandMappings,
                    });
                }

                const propertiesColumns = new Set(await getTargetColumns(newPool, "properties"));
                const propertiesStateIdColumn = resolveColumnName(propertiesColumns, [
                    "stateId",
                    "state_id",
                ]);
                const propertiesCityIdColumn = resolveColumnName(propertiesColumns, [
                    "cityId",
                    "city_id",
                ]);

                // Derive geo-brand mapping tables from imported properties.
                // Cast uuid params explicitly: in INSERT...SELECT, untyped $n are inferred as text.
                if (propertiesStateIdColumn) {
                    await newPool.query(
                        `
                        INSERT INTO "brandsOnStates"
                            ("brandId","stateId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                        SELECT DISTINCT
                            $1::uuid,
                            p."${propertiesStateIdColumn}",
                            lower(regexp_replace($2 || '-state-' || p."${propertiesStateIdColumn}"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                            true,
                            $3::uuid,
                            $3::uuid
                        FROM "properties" p
                        WHERE p."${propertiesStateIdColumn}" IS NOT NULL
                        ON CONFLICT ("brandId","stateId") DO NOTHING
                    `,
                        [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                    );
                }

                if (propertiesCityIdColumn) {
                    await newPool.query(
                        `
                        INSERT INTO "brandsOnCities"
                            ("brandId","cityId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                        SELECT DISTINCT
                            $1::uuid,
                            p."${propertiesCityIdColumn}",
                            lower(regexp_replace($2 || '-city-' || p."${propertiesCityIdColumn}"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                            true,
                            $3::uuid,
                            $3::uuid
                        FROM "properties" p
                        WHERE p."${propertiesCityIdColumn}" IS NOT NULL
                        ON CONFLICT ("brandId","cityId") DO NOTHING
                    `,
                        [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                    );
                }

                const areaMappingsTable = resolveFirstExistingTable(newTables, [
                    "property_area_mappings",
                    "propertyAreaMappings",
                ]);
                if (areaMappingsTable) {
                    const areaMappingColumns = new Set(
                        await getTargetColumns(newPool, areaMappingsTable)
                    );
                    const areaIdColumn = resolveColumnName(areaMappingColumns, ["area_id", "areaId"]);
                    if (areaIdColumn) {
                        await newPool.query(
                            `
                            INSERT INTO "brandsOnAreas"
                                ("brandId","areaId","slug","isActive","adminCreatedBy","adminUpdatedBy")
                            SELECT DISTINCT
                                $1::uuid,
                                pam."${areaIdColumn}",
                                lower(regexp_replace($2 || '-area-' || pam."${areaIdColumn}"::text, '[^a-zA-Z0-9-]+', '-', 'g')),
                                true,
                                $3::uuid,
                                $3::uuid
                            FROM "${areaMappingsTable}" pam
                            WHERE pam."${areaIdColumn}" IS NOT NULL
                            ON CONFLICT ("brandId","areaId") DO NOTHING
                        `,
                            [brandId, process.env.MIGRATION_BRAND_NAME ?? "instafarms", adminId]
                        );
                    }
                }

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
        }

        await seedAdminRolesAndPermissions(newPool, newTables, config.dryRun);

        log("info", "Import complete");
    } finally {
        await newPool.end();
    }
};

run().catch((error) => {
    log("error", "Import failed", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
