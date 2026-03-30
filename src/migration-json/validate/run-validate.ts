import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../shared/config";
import { createNewPool, createOldPool } from "../shared/db";
import { log } from "../shared/logger";

const quote = (name: string): string => `"${name.replace(/"/g, "\"\"")}"`;

const run = async (): Promise<void> => {
    const config = getConfig();
    const oldPool = createOldPool(config);
    const newPool = createNewPool(config);

    try {
        const manifestRaw = await import("node:fs/promises").then((fs) =>
            fs.readFile(path.join(config.dataDir, "_manifest.json"), "utf8")
        );
        const manifest = JSON.parse(manifestRaw) as {
            tables: { table: string; rowCount: number }[];
        };

        const counts: Array<{ table: string; source: number; target: number; delta: number }> = [];
        for (const item of manifest.tables) {
            const table = item.table;
            const targetExists = await newPool.query(
                `
                SELECT 1 FROM information_schema.tables
                WHERE table_schema='public' AND table_name=$1
                LIMIT 1
            `,
                [table]
            );
            if (targetExists.rowCount === 0) continue;

            const [sourceRes, targetRes] = await Promise.all([
                oldPool.query(`SELECT COUNT(*)::bigint AS c FROM ${quote(table)}`),
                newPool.query(`SELECT COUNT(*)::bigint AS c FROM ${quote(table)}`),
            ]);
            const source = Number(sourceRes.rows[0].c);
            const target = Number(targetRes.rows[0].c);
            counts.push({ table, source, target, delta: target - source });
        }

        const orphanChecks = [
            {
                check: "payments.bookingId -> bookings.id",
                sql: `SELECT COUNT(*)::bigint AS c FROM "payments" p LEFT JOIN "bookings" b ON b."id"=p."bookingId" WHERE p."bookingId" IS NOT NULL AND b."id" IS NULL`,
            },
            {
                check: "bookings.propertyId -> properties.id",
                sql: `SELECT COUNT(*)::bigint AS c FROM "bookings" b LEFT JOIN "properties" p ON p."id"=b."propertyId" WHERE b."propertyId" IS NOT NULL AND p."id" IS NULL`,
            },
            {
                check: "propertyPhotos.photoId -> photos.id",
                sql: `SELECT COUNT(*)::bigint AS c FROM "propertyPhotos" pp LEFT JOIN "photos" p ON p."id"=pp."photoId" WHERE p."id" IS NULL`,
            },
        ];
        const fkOrphans: Array<{ check: string; orphanRows: number }> = [];
        for (const check of orphanChecks) {
            try {
                const res = await newPool.query(check.sql);
                fkOrphans.push({ check: check.check, orphanRows: Number(res.rows[0].c) });
            } catch {
                fkOrphans.push({ check: check.check, orphanRows: -1 });
            }
        }

        const sampleTables = ["users", "properties", "bookings", "payments"];
        const sampleHash: Array<{ table: string; sourceDigest: string | null; targetDigest: string | null; matched: boolean }> = [];
        for (const table of sampleTables) {
            try {
                const sql = `
                    SELECT md5(coalesce(string_agg(md5(row_to_json(t)::text), ''), '')) AS digest
                    FROM (SELECT * FROM ${quote(table)} ORDER BY 1 LIMIT 500) t
                `;
                const [sourceRes, targetRes] = await Promise.all([
                    oldPool.query(sql),
                    newPool.query(sql),
                ]);
                const sourceDigest = sourceRes.rows[0]?.digest ?? null;
                const targetDigest = targetRes.rows[0]?.digest ?? null;
                sampleHash.push({
                    table,
                    sourceDigest,
                    targetDigest,
                    matched: sourceDigest != null && sourceDigest === targetDigest,
                });
            } catch {
                sampleHash.push({
                    table,
                    sourceDigest: null,
                    targetDigest: null,
                    matched: false,
                });
            }
        }

        const reportsDir = path.join(config.dataDir, "_reports");
        await mkdir(reportsDir, { recursive: true });
        await writeFile(path.join(reportsDir, "counts.json"), JSON.stringify(counts, null, 2), "utf8");
        await writeFile(
            path.join(reportsDir, "fk-orphans.json"),
            JSON.stringify(fkOrphans, null, 2),
            "utf8"
        );
        await writeFile(
            path.join(reportsDir, "sample-hash.json"),
            JSON.stringify(sampleHash, null, 2),
            "utf8"
        );

        const summary = [
            "# JSON Migration Validation Summary",
            "",
            `GeneratedAt: ${new Date().toISOString()}`,
            `CountChecks: ${counts.length}`,
            `FkChecks: ${fkOrphans.length}`,
            `SampleHashChecks: ${sampleHash.length}`,
        ].join("\n");
        await writeFile(path.join(reportsDir, "summary.md"), `${summary}\n`, "utf8");

        log("info", "Validation complete", { reportsDir });
    } finally {
        await oldPool.end();
        await newPool.end();
    }
};

run().catch((error) => {
    log("error", "Validation failed", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
