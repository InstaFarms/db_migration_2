import "dotenv/config";
import { rm } from "node:fs/promises";
import path from "node:path";

const run = async (): Promise<void> => {
    const dataDir = process.env.MIGRATION_DATA_DIR ?? "data/oldedata";
    const targets = [
        path.join(dataDir, "_checkpoint.json"),
        path.join(dataDir, "_id-map", "_strategy-report.json"),
    ];

    for (const target of targets) {
        await rm(target, { force: true });
    }

    console.log(
        JSON.stringify({
            ts: new Date().toISOString(),
            level: "info",
            message: "Migration cache removed",
            cleared: targets,
        })
    );
};

run().catch((error) => {
    console.error(
        JSON.stringify({
            ts: new Date().toISOString(),
            level: "error",
            message: error instanceof Error ? error.message : String(error),
        })
    );
    process.exit(1);
});
