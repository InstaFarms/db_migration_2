import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ImportCheckpoint {
    [table: string]: {
        done: boolean;
        processedRows: number;
        updatedAt: string;
    };
}

const checkpointPath = (dataDir: string): string => path.join(dataDir, "_checkpoint.json");

export const readCheckpoint = async (dataDir: string): Promise<ImportCheckpoint> => {
    try {
        const raw = await readFile(checkpointPath(dataDir), "utf8");
        return JSON.parse(raw) as ImportCheckpoint;
    } catch {
        return {};
    }
};

export const writeCheckpoint = async (
    dataDir: string,
    cp: ImportCheckpoint
): Promise<void> => {
    await mkdir(dataDir, { recursive: true });
    await writeFile(checkpointPath(dataDir), JSON.stringify(cp, null, 2), "utf8");
};
