import { mkdir } from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../shared/config";
import { createOldPool } from "../shared/db";
import { log } from "../shared/logger";
import { getOldTables } from "./table-list";
import { checksum, ManifestItem, TableExportEnvelope, writeJsonFile } from "./writer";

const quoteIdent = (name: string): string => `"${name.replace(/"/g, "\"\"")}"`;

const run = async (): Promise<void> => {
    const config = getConfig();
    const oldPool = createOldPool(config);
    const manifest: ManifestItem[] = [];

    try {
        const tables = await getOldTables(oldPool);
        const exportTables = config.singleTable
            ? tables.filter((t) => t === config.singleTable)
            : tables;

        await mkdir(config.dataDir, { recursive: true });
        await mkdir(path.join(config.dataDir, "_id-map"), { recursive: true });
        await mkdir(path.join(config.dataDir, "_reports"), { recursive: true });

        for (const tableName of exportTables) {
            log("info", "Exporting table", { tableName });
            const res = await oldPool.query(`SELECT * FROM ${quoteIdent(tableName)}`);
            const envelope: TableExportEnvelope = {
                table: tableName,
                schemaVersion: "old-schema",
                rowCount: res.rowCount ?? 0,
                rows: res.rows,
            };
            const fileName = `${tableName}.json`;
            await writeJsonFile(config.dataDir, fileName, envelope);
            manifest.push({
                table: tableName,
                file: fileName,
                rowCount: envelope.rowCount,
                checksumSha256: checksum(envelope.rows),
                exportedAt: new Date().toISOString(),
            });
        }

        await writeJsonFile(config.dataDir, "_manifest.json", {
            generatedAt: new Date().toISOString(),
            tables: manifest,
        });
        log("info", "Export complete", { tableCount: manifest.length, dataDir: config.dataDir });
        console.log(`Successfully exported ${manifest.length} tables to ${config.dataDir}`);
    } finally {
        await oldPool.end();
    }
};

run().catch((error) => {
    log("error", "Export failed", { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
