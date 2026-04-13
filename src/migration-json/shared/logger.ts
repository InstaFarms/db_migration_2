import { inspect } from "node:util";

type LogLevel = "info" | "warn" | "error";

const LOG_FORMAT = (process.env.MIGRATION_LOG_FORMAT ?? "").toLowerCase();
const FORCE_JSON = LOG_FORMAT === "json";
const FORCE_PRETTY = LOG_FORMAT === "pretty";
const USE_PRETTY = FORCE_PRETTY || (!FORCE_JSON && Boolean(process.stdout.isTTY));
const USE_COLORS = USE_PRETTY && process.env.NO_COLOR == null;

const COLORS = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};

const withColor = (value: string, color: string): string =>
    USE_COLORS ? `${color}${value}${COLORS.reset}` : value;

const levelLabel = (level: LogLevel): string => {
    if (level === "error") return withColor("ERROR", COLORS.red);
    if (level === "warn") return withColor("WARN ", COLORS.yellow);
    return withColor("INFO ", COLORS.blue);
};

const formatPrettyTime = (date: Date): string =>
    date.toTimeString().slice(0, 8);

const formatMeta = (meta: unknown): string => {
    if (meta == null) return "";
    const rendered = inspect(meta, {
        depth: 6,
        colors: USE_COLORS,
        compact: false,
        breakLength: 120,
        sorted: true,
    });
    return `\n${withColor("  meta:", COLORS.dim)} ${rendered}`;
};

export const log = (level: LogLevel, message: string, meta?: unknown): void => {
    const now = new Date();

    if (USE_PRETTY) {
        const line =
            `${withColor(`[${formatPrettyTime(now)}]`, COLORS.cyan)} ` +
            `${levelLabel(level)} ` +
            `${message}` +
            `${formatMeta(meta)}`;

        if (level === "error") console.error(line);
        else if (level === "warn") console.warn(line);
        else console.log(line);
        return;
    }

    const payload = {
        ts: now.toISOString(),
        level,
        message,
        ...(meta ? { meta } : {}),
    };
    const line = JSON.stringify(payload);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
};
