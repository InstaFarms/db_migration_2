import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface TableExportEnvelope {
    table: string;
    schemaVersion: string;
    rowCount: number;
    rows: Record<string, unknown>[];
}

export interface ManifestItem {
    table: string;
    file: string;
    rowCount: number;
    checksumSha256: string;
    exportedAt: string;
    skipped?: boolean;
}

export const writeJsonFile = async (
    baseDir: string,
    fileName: string,
    value: unknown
): Promise<string> => {
    await mkdir(baseDir, { recursive: true });
    const targetPath = path.join(baseDir, fileName);
    await writeFile(targetPath, JSON.stringify(value, null, 2), "utf8");
    return targetPath;
};

export const checksum = (value: unknown): string =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
