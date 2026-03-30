import { randomUUID } from "node:crypto";

export const transformListingUsersToCustomers = (
    rows: Record<string, unknown>[]
): {
    transformed: Record<string, unknown>[];
    idMap: Record<string, string>;
} => {
    const idMap: Record<string, string> = {};
    const transformed = rows.map((row) => {
        const sourceId = String(row.id ?? "");
        const newId = randomUUID();
        idMap[sourceId] = newId;

        const mobile =
            (row.mobileNumber as string | undefined) ??
            (row.phone as string | undefined) ??
            `missing-${newId.slice(0, 8)}`;

        return {
            id: newId,
            brandId: null,
            firstName: (row.firstName as string | undefined) ?? "Unknown",
            lastName: (row.lastName as string | undefined) ?? null,
            email: (row.email as string | undefined) ?? null,
            dob: (row.dob as string | undefined) ?? null,
            mobileNumber: mobile,
            gender: (row.gender as string | undefined) ?? "Other",
            favorites: Array.isArray(row.favorites) ? row.favorites : [],
            expoPushToken: (row.expoPushToken as string | undefined) ?? null,
            createdAt: row.createdAt ?? new Date().toISOString(),
            updatedAt: row.updatedAt ?? new Date().toISOString(),
        };
    });

    return { transformed, idMap };
};
