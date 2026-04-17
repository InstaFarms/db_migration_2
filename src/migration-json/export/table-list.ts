import { Pool } from "pg";
import { BOOKING_DATA_SOURCE_TABLES } from "../mapping/schema-map";

export const EXCLUDED_TABLES = new Set<string>([
    ...BOOKING_DATA_SOURCE_TABLES,
    "entities",
    "entityProperties",
    "entityBlockedDates",
    "entitySpecialDates",
    "activitiesOnEntities",
    "amenitiesOnEntities",
    "safetyHygieneOnEntities",
    "ownersOnEntities",
    "managersOnEntities",
    "caretakersOnEntities",
    "entityDiscountPlans",
    "entityCancellationPlans",
    "spaceEntities",
    "collectionEntities",
    "entityCoupons",
    "reviewsOnEntities",
    "entityPhotos",
    "entityBulkUpdateLogs",
    "entityPermanentPriceUpdateLogs",
    "tableHistory",
    "rooms",
    "roomBasedPricingTiers",
    "bookingRooms",
    "bookingConfirmations",
]);

export const getOldTables = async (pool: Pool): Promise<string[]> => {
    const result = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);

    return result.rows
        .map((row) => row.table_name as string)
        .filter((tableName) => !EXCLUDED_TABLES.has(tableName));
};
