export interface TableMapRule {
    sourceTable: string;
    targetTable?: string;
    mode: "copy" | "transform" | "derive" | "skip";
    reason?: string;
}

const skip = (sourceTable: string, reason: string): TableMapRule => ({
    sourceTable,
    mode: "skip",
    reason,
});

export const fixedRules: TableMapRule[] = [
    { sourceTable: "listingUsers", targetTable: "customers", mode: "transform" },
    skip("ezeeSyncData", "Excluded by migration decision"),
    skip("entities", "Excluded by migration decision"),
    skip("rooms", "Excluded by migration decision"),
    skip("bookingRooms", "Excluded by migration decision"),
    skip("bookingConfirmations", "Excluded by migration decision"),
];

export const getRuleForTable = (sourceTable: string): TableMapRule => {
    const fixed = fixedRules.find((r) => r.sourceTable === sourceTable);
    if (fixed) return fixed;
    return { sourceTable, targetTable: sourceTable, mode: "copy" };
};
