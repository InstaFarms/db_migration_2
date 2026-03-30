import { Pool } from "pg";

export const buildDependencyOrder = async (pool: Pool, tables: string[]): Promise<string[]> => {
    const tableSet = new Set(tables);
    const depRes = await pool.query(
        `
        SELECT
          tc.table_name AS child_table,
          ccu.table_name AS parent_table
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public'
    `
    );

    const indegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const t of tables) {
        indegree.set(t, 0);
        adj.set(t, []);
    }

    for (const row of depRes.rows) {
        const child = row.child_table as string;
        const parent = row.parent_table as string;
        if (!tableSet.has(child) || !tableSet.has(parent)) continue;
        adj.get(parent)?.push(child);
        indegree.set(child, (indegree.get(child) ?? 0) + 1);
    }

    const queue: string[] = [];
    for (const [table, deg] of indegree.entries()) {
        if (deg === 0) queue.push(table);
    }

    const ordered: string[] = [];
    while (queue.length > 0) {
        const cur = queue.shift() as string;
        ordered.push(cur);
        for (const nxt of adj.get(cur) ?? []) {
            indegree.set(nxt, (indegree.get(nxt) ?? 0) - 1);
            if ((indegree.get(nxt) ?? 0) === 0) queue.push(nxt);
        }
    }

    if (ordered.length !== tables.length) {
        const remaining = tables.filter((t) => !ordered.includes(t));
        return [...ordered, ...remaining];
    }
    return ordered;
};
