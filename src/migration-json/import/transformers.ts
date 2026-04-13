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

const toUpper = (value: unknown): string => String(value ?? "").toUpperCase();

const mapPaymentChannel = (value: unknown): "RAZORPAY" | "BANK_TRANSFER" => {
    const normalized = toUpper(value);
    if (normalized === "ONLINE") return "RAZORPAY";
    return "BANK_TRANSFER";
};

const mapRefundStatus = (value: unknown): "REFUND_INITIATED" | "REFUNDED" | "FAILED" => {
    const normalized = toUpper(value);
    if (normalized === "COMPLETED") return "REFUNDED";
    if (normalized === "FAILED") return "FAILED";
    return "REFUND_INITIATED";
};

const mapOwnerPayoutStatus = (
    value: unknown
): "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" => {
    const normalized = toUpper(value);
    if (
        normalized === "PENDING" ||
        normalized === "PROCESSING" ||
        normalized === "COMPLETED" ||
        normalized === "FAILED" ||
        normalized === "CANCELLED"
    ) {
        return normalized as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
    }
    return "PENDING";
};

const mapOwnerWalletLedger = (
    value: unknown
): { type: "BOOKING_EARNING" | "MILESTONE_ADJUSTMENT"; direction: "CREDIT" | "DEBIT" } => {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized.includes("credit")) {
        if (normalized === "booking_credit") {
            return { type: "BOOKING_EARNING", direction: "CREDIT" };
        }
        return { type: "MILESTONE_ADJUSTMENT", direction: "CREDIT" };
    }
    return { type: "MILESTONE_ADJUSTMENT", direction: "DEBIT" };
};

export const transformPaymentsToBookingPayments = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows.map((row) => ({
        id: row.id,
        bookingId: row.bookingId,
        isAdvancePayment: row.isAdvancePayment ?? false,
        amount: row.amount ?? 0,
        paymentDate: row.paymentDate ?? row.createdAt ?? new Date().toISOString(),
        paymentChannel: mapPaymentChannel(row.paymentMode),
        razorpayPaymentId: row.razorpayPaymentId ?? null,
        razorpayOrderId: row.razorpayOrderId ?? null,
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        createdBy: row.createdBy ?? null,
        updatedBy: row.updatedBy ?? null,
        adminCreatedBy: row.adminCreatedBy ?? null,
        adminUpdatedBy: row.adminUpdatedBy ?? null,
    }));

export const transformCancellationsToBookingCancellation = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows.map((row) => ({
        id: row.id,
        bookingId: row.bookingId,
        refundAmount: row.refundAmount ?? 0,
        cancelledBy: row.cancelledBy ?? null,
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        createdBy: row.createdBy ?? null,
        updatedBy: row.updatedBy ?? null,
        adminCreatedBy: row.adminCreatedBy ?? null,
        adminUpdatedBy: row.adminUpdatedBy ?? null,
    }));

export const transformCancellationsToBookingRefund = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows.map((row) => ({
        id: row.id,
        bookingId: row.bookingId,
        refundAmount: row.refundAmount ?? 0,
        refundStatus: mapRefundStatus(row.refundStatus),
        razorpayRefundId: row.razorpayRefundId ?? null,
        refundError: row.refundError ?? null,
        refundAttempts: row.refundAttempts ?? 0,
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        createdBy: row.createdBy ?? null,
        updatedBy: row.updatedBy ?? null,
        adminCreatedBy: row.adminCreatedBy ?? null,
        adminUpdatedBy: row.adminUpdatedBy ?? null,
    }));

export const transformOwnersWalletToOwnerWallet = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows.map((row) => ({
        id: row.id,
        ownerId: row.ownerId,
        currentBalance: row.currentBalance ?? 0,
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
    }));

export const transformWalletTransactionsToOwnerWalletLedger = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows
        .filter((row) => row.bookingId != null && String(row.bookingId).trim() !== "")
        .map((row) => {
            const mapped = mapOwnerWalletLedger(row.transactionType);
            return {
                id: row.id,
                bookingId: row.bookingId,
                ownerId: row.ownerId,
                type: mapped.type,
                direction: mapped.direction,
                amount: row.amount ?? 0,
                createdAt: row.createdAt ?? new Date().toISOString(),
                updatedAt: row.updatedAt ?? new Date().toISOString(),
            };
        });

export const transformWalletWithdrawalRequestsToOwnerPayouts = (
    rows: Record<string, unknown>[]
): Record<string, unknown>[] =>
    rows.map((row) => ({
        id: row.id,
        amount: row.requestedAmount ?? 0,
        ownerId: row.ownerId,
        status: mapOwnerPayoutStatus(row.status),
        payoutDetail: row.failureReason ?? null,
        createdAt: row.createdAt ?? row.requestedAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
    }));
