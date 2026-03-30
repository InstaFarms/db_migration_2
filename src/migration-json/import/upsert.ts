import { Pool } from "pg";

const quote = (name: string): string => `"${name.replace(/"/g, "\"\"")}"`;

type ColumnMeta = {
    columnName: string;
    dataType: string;
    udtName: string;
};

export const getTargetColumns = async (pool: Pool, tableName: string): Promise<string[]> => {
    const res = await pool.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1
        ORDER BY ordinal_position
    `,
        [tableName]
    );
    return res.rows.map((r) => r.column_name as string);
};

const getTargetColumnMeta = async (pool: Pool, tableName: string): Promise<ColumnMeta[]> => {
    const res = await pool.query(
        `
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1
    `,
        [tableName]
    );
    return res.rows.map((r) => ({
        columnName: r.column_name as string,
        dataType: r.data_type as string,
        udtName: r.udt_name as string,
    }));
};

export const insertRowsDoNothing = async (
    pool: Pool,
    tableName: string,
    rows: Record<string, unknown>[]
): Promise<number> => {
    if (rows.length === 0) return 0;
    const columns = Object.keys(rows[0]);
    if (columns.length === 0) return 0;
    const meta = await getTargetColumnMeta(pool, tableName);
    const metaByCol = new Map(meta.map((m) => [m.columnName, m]));

    const colSql = columns.map(quote).join(", ");
    const params: unknown[] = [];
    const valuesSql: string[] = [];
    let paramIndex = 1;

    const normalizeValue = (column: string, value: unknown): unknown => {
        const m = metaByCol.get(column);
        if (!m) return value;
        const isJson = m.dataType === "json" || m.udtName === "json" || m.udtName === "jsonb";
        if (!isJson) return value;
        if (value == null) return value;
        if (typeof value === "string") {
            if (value.trim() === "") return null;
            try {
                return JSON.stringify(JSON.parse(value));
            } catch {
                return null;
            }
        }
        if (typeof value === "object") {
            try {
                return JSON.stringify(value);
            } catch {
                return null;
            }
        }
        return JSON.stringify(value);
    };

    for (const row of rows) {
        const rowParams: string[] = [];
        for (const col of columns) {
            rowParams.push(`$${paramIndex++}`);
            params.push(normalizeValue(col, row[col]));
        }
        valuesSql.push(`(${rowParams.join(", ")})`);
    }

    const sql = `
        INSERT INTO ${quote(tableName)} (${colSql})
        VALUES ${valuesSql.join(", ")}
        ON CONFLICT DO NOTHING
    `;
    try {
        await pool.query(sql, params);
    } catch (error) {
        // Fallback row-by-row for better diagnostics on problematic payloads.
        for (const row of rows) {
            const rowCols = Object.keys(row).filter((c) => columns.includes(c));
            const rowColSql = rowCols.map(quote).join(", ");
            const rowParams: unknown[] = [];
            const rowPlaceholders: string[] = [];
            for (let i = 0; i < rowCols.length; i += 1) {
                rowPlaceholders.push(`$${i + 1}`);
                rowParams.push(normalizeValue(rowCols[i], row[rowCols[i]]));
            }
            const rowSql = `
                INSERT INTO ${quote(tableName)} (${rowColSql})
                VALUES (${rowPlaceholders.join(", ")})
                ON CONFLICT DO NOTHING
            `;
            try {
                await pool.query(rowSql, rowParams);
            } catch (rowError) {
                const sampleId = row.id ?? row.slug ?? row.code ?? null;
                throw new Error(
                    `Row insert failed for table=${tableName}, key=${String(
                        sampleId
                    )}, error=${rowError instanceof Error ? rowError.message : String(rowError)}`
                );
            }
        }
    }
    return rows.length;
};

/** Normalize values for jsonb query parameters (string result for pg). */
export const jsonbParamOr = (value: unknown, fallbackJson: string): string => {
    if (value == null) return fallbackJson;
    if (typeof value === "string") {
        const t = value.trim();
        if (t === "") return fallbackJson;
        try {
            return JSON.stringify(JSON.parse(t));
        } catch {
            return fallbackJson;
        }
    }
    if (typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return fallbackJson;
        }
    }
    try {
        return JSON.stringify(value);
    } catch {
        return fallbackJson;
    }
};

/**
 * Old `areas` rows carried slug, faqs, areaInfo, meta, etc. New schema stores those on `brandsOnAreas`
 * (`areaInfo` -> `info`). Property-derived inserts only create stubs; this upsert fills real content.
 */
export const upsertBrandsOnAreasFromExportedAreas = async (
    pool: Pool,
    brandId: string,
    defaultAdminId: string,
    adminIds: Set<string>,
    rows: Record<string, unknown>[]
): Promise<number> => {
    let n = 0;
    for (const row of rows) {
        const areaId = row.id;
        if (areaId == null || areaId === "") continue;

        let adminCreatedBy = row.adminCreatedBy;
        let adminUpdatedBy = row.adminUpdatedBy;
        if (
            adminCreatedBy == null ||
            adminCreatedBy === "" ||
            !adminIds.has(String(adminCreatedBy))
        ) {
            adminCreatedBy = defaultAdminId;
        }
        if (
            adminUpdatedBy == null ||
            adminUpdatedBy === "" ||
            !adminIds.has(String(adminUpdatedBy))
        ) {
            adminUpdatedBy = defaultAdminId;
        }

        const slug = row.slug ?? null;
        const heading = row.heading ?? null;
        const description = row.description ?? null;
        const isActive = row.isActive == null ? true : Boolean(row.isActive);
        const weight = row.weight != null ? String(row.weight) : "0";
        const featured = row.featured == null ? false : Boolean(row.featured);
        const icon = row.icon ?? null;
        const faqsJson = jsonbParamOr(row.faqs, "[]");
        const infoJson = jsonbParamOr(row.areaInfo, "{}");
        const metaJson = jsonbParamOr(row.meta, "{}");
        const createdAt =
            (row.createdAt as string | undefined) ?? new Date().toISOString();
        const updatedAt =
            (row.updatedAt as string | undefined) ?? createdAt;

        await pool.query(
            `
            INSERT INTO "brandsOnAreas" (
                "brandId","areaId","slug","heading","description","isActive","weight","featured","icon",
                "faqs","info","meta","createdAt","updatedAt","adminCreatedBy","adminUpdatedBy"
            ) VALUES (
                $1::uuid,$2::uuid,$3,$4,$5,$6,$7::numeric,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15::uuid,$16::uuid
            )
            ON CONFLICT ("brandId","areaId") DO UPDATE SET
                "slug" = EXCLUDED."slug",
                "heading" = EXCLUDED."heading",
                "description" = EXCLUDED."description",
                "isActive" = EXCLUDED."isActive",
                "weight" = EXCLUDED."weight",
                "featured" = EXCLUDED."featured",
                "icon" = EXCLUDED."icon",
                "faqs" = EXCLUDED."faqs",
                "info" = EXCLUDED."info",
                "meta" = EXCLUDED."meta",
                "updatedAt" = EXCLUDED."updatedAt",
                "adminUpdatedBy" = EXCLUDED."adminUpdatedBy"
        `,
            [
                brandId,
                areaId,
                slug,
                heading,
                description,
                isActive,
                weight,
                featured,
                icon,
                faqsJson,
                infoJson,
                metaJson,
                createdAt,
                updatedAt,
                adminCreatedBy,
                adminUpdatedBy,
            ]
        );
        n += 1;
    }
    return n;
};

/**
 * Old `cities` rows carried slug, faqs, info, meta, etc.
 * New schema stores those on `brandsOnCities`.
 */
export const upsertBrandsOnCitiesFromExportedCities = async (
    pool: Pool,
    brandId: string,
    defaultAdminId: string,
    adminIds: Set<string>,
    rows: Record<string, unknown>[]
): Promise<number> => {
    let n = 0;
    for (const row of rows) {
        const cityId = row.id;
        if (cityId == null || cityId === "") continue;

        let adminCreatedBy = row.adminCreatedBy;
        let adminUpdatedBy = row.adminUpdatedBy;
        if (
            adminCreatedBy == null ||
            adminCreatedBy === "" ||
            !adminIds.has(String(adminCreatedBy))
        ) {
            adminCreatedBy = defaultAdminId;
        }
        if (
            adminUpdatedBy == null ||
            adminUpdatedBy === "" ||
            !adminIds.has(String(adminUpdatedBy))
        ) {
            adminUpdatedBy = defaultAdminId;
        }

        const slug = row.slug ?? null;
        const heading = row.heading ?? null;
        const description = row.description ?? null;
        const isActive = row.isActive == null ? true : Boolean(row.isActive);
        const weight = row.weight != null ? String(row.weight) : "0";
        const featured = row.featured == null ? false : Boolean(row.featured);
        const icon = row.icon ?? null;

        const faqsJson = jsonbParamOr(row.faqs, "[]");
        const infoJson = jsonbParamOr(row.info, "{}");
        const metaJson = jsonbParamOr(row.meta, "{}");

        const createdAt =
            (row.createdAt as string | undefined) ?? new Date().toISOString();
        const updatedAt =
            (row.updatedAt as string | undefined) ?? createdAt;

        await pool.query(
            `
            INSERT INTO "brandsOnCities" (
                "brandId","cityId","slug","heading","description","isActive","weight","featured","icon",
                "faqs","info","meta","createdAt","updatedAt","adminCreatedBy","adminUpdatedBy"
            ) VALUES (
                $1::uuid,$2::uuid,$3,$4,$5,$6,$7::numeric,$8,$9,
                $10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15::uuid,$16::uuid
            )
            ON CONFLICT ("brandId","cityId") DO UPDATE SET
                "slug" = EXCLUDED."slug",
                "heading" = EXCLUDED."heading",
                "description" = EXCLUDED."description",
                "isActive" = EXCLUDED."isActive",
                "weight" = EXCLUDED."weight",
                "featured" = EXCLUDED."featured",
                "icon" = EXCLUDED."icon",
                "faqs" = EXCLUDED."faqs",
                "info" = EXCLUDED."info",
                "meta" = EXCLUDED."meta",
                "updatedAt" = EXCLUDED."updatedAt",
                "adminUpdatedBy" = EXCLUDED."adminUpdatedBy"
        `,
            [
                brandId,
                cityId,
                slug,
                heading,
                description,
                isActive,
                weight,
                featured,
                icon,
                faqsJson,
                infoJson,
                metaJson,
                createdAt,
                updatedAt,
                adminCreatedBy,
                adminUpdatedBy,
            ]
        );
        n += 1;
    }
    return n;
};

/**
 * Old `states` rows carried slug, faqs, info, meta, etc.
 * New schema stores those on `brandsOnStates`.
 */
export const upsertBrandsOnStatesFromExportedStates = async (
    pool: Pool,
    brandId: string,
    defaultAdminId: string,
    adminIds: Set<string>,
    rows: Record<string, unknown>[]
): Promise<number> => {
    let n = 0;
    for (const row of rows) {
        const stateId = row.id;
        if (stateId == null || stateId === "") continue;

        let adminCreatedBy = row.adminCreatedBy;
        let adminUpdatedBy = row.adminUpdatedBy;
        if (
            adminCreatedBy == null ||
            adminCreatedBy === "" ||
            !adminIds.has(String(adminCreatedBy))
        ) {
            adminCreatedBy = defaultAdminId;
        }
        if (
            adminUpdatedBy == null ||
            adminUpdatedBy === "" ||
            !adminIds.has(String(adminUpdatedBy))
        ) {
            adminUpdatedBy = defaultAdminId;
        }

        const slug = row.slug ?? null;
        const heading = row.heading ?? null;
        const description = row.description ?? null;
        const isActive = row.isActive == null ? true : Boolean(row.isActive);
        const weight = row.weight != null ? String(row.weight) : "0";
        const featured = row.featured == null ? false : Boolean(row.featured);
        const icon = row.icon ?? null;

        const faqsJson = jsonbParamOr(row.faqs, "[]");
        const infoJson = jsonbParamOr(row.info, "{}");
        const metaJson = jsonbParamOr(row.meta, "{}");

        const createdAt =
            (row.createdAt as string | undefined) ?? new Date().toISOString();
        const updatedAt =
            (row.updatedAt as string | undefined) ?? createdAt;

        await pool.query(
            `
            INSERT INTO "brandsOnStates" (
                "brandId","stateId","slug","heading","description","isActive","weight","featured","icon",
                "faqs","info","meta","createdAt","updatedAt","adminCreatedBy","adminUpdatedBy"
            ) VALUES (
                $1::uuid,$2::uuid,$3,$4,$5,$6,$7::numeric,$8,$9,
                $10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15::uuid,$16::uuid
            )
            ON CONFLICT ("brandId","stateId") DO UPDATE SET
                "slug" = EXCLUDED."slug",
                "heading" = EXCLUDED."heading",
                "description" = EXCLUDED."description",
                "isActive" = EXCLUDED."isActive",
                "weight" = EXCLUDED."weight",
                "featured" = EXCLUDED."featured",
                "icon" = EXCLUDED."icon",
                "faqs" = EXCLUDED."faqs",
                "info" = EXCLUDED."info",
                "meta" = EXCLUDED."meta",
                "updatedAt" = EXCLUDED."updatedAt",
                "adminUpdatedBy" = EXCLUDED."adminUpdatedBy"
        `,
            [
                brandId,
                stateId,
                slug,
                heading,
                description,
                isActive,
                weight,
                featured,
                icon,
                faqsJson,
                infoJson,
                metaJson,
                createdAt,
                updatedAt,
                adminCreatedBy,
                adminUpdatedBy,
            ]
        );
        n += 1;
    }
    return n;
};
