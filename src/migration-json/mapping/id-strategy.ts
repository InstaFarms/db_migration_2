import { Pool } from "pg";

export type IdMode = "preserve" | "regenerate";

export const detectIdMode = async (
    pool: Pool,
    tableName: string
): Promise<{ mode: IdMode; reason: string }> => {
    const idColumnRes = await pool.query(
        `
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name='id'
        LIMIT 1
    `,
        [tableName]
    );

    if (idColumnRes.rowCount === 0) {
        return { mode: "preserve", reason: "No id column; preserving composite/natural keys." };
    }

    const row = idColumnRes.rows[0];
    const isUuid = row.data_type === "uuid" || row.udt_name === "uuid";
    if (isUuid) {
        return { mode: "preserve", reason: "UUID id with FK compatibility." };
    }

    return { mode: "regenerate", reason: "Non-UUID id; safer remap for mixed strategy." };
};
