import "dotenv/config";

const parseNumber = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (!value) return fallback;
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
};

export interface JsonMigrationConfig {
    oldDatabaseUrl: string;
    newDatabaseUrl: string;
    batchSize: number;
    dryRun: boolean;
    singleTable?: string;
    dataDir: string;
}

export const getConfig = (): JsonMigrationConfig => {
    const oldDatabaseUrl = process.env.OLD_DATABASE_URL;
    const newDatabaseUrl = process.env.NEW_DATABASE_URL;
    if (!oldDatabaseUrl) throw new Error("OLD_DATABASE_URL is required");
    if (!newDatabaseUrl) throw new Error("NEW_DATABASE_URL is required");

    return {
        oldDatabaseUrl,
        newDatabaseUrl,
        batchSize: parseNumber(process.env.MIGRATION_BATCH_SIZE, 500),
        dryRun: parseBoolean(process.env.MIGRATION_DRY_RUN, false),
        singleTable: process.env.MIGRATION_TABLE,
        dataDir: process.env.MIGRATION_DATA_DIR ?? "data/oldedata",
    };
};
