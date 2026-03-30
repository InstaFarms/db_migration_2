import "dotenv/config";
import { spawn } from "node:child_process";

const run = async (): Promise<void> => {
    if (!process.env.NEW_DATABASE_URL) {
        throw new Error("NEW_DATABASE_URL is required in .env");
    }

    const command = process.platform === "win32" ? "cmd" : "sh";
    const args =
        process.platform === "win32"
            ? ["/c", "npx drizzle-kit push"]
            : ["-lc", "npx drizzle-kit push"];

    console.log(
        JSON.stringify({
            ts: new Date().toISOString(),
            level: "info",
            message: "Pushing schema to NEW_DATABASE_URL",
        })
    );

    await new Promise<void>((resolve, reject) => {
        const child = spawn(command, args, { stdio: "inherit" });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            reject(new Error(`drizzle-kit push failed with exit code ${code ?? -1}`));
        });
    });

    console.log(
        JSON.stringify({
            ts: new Date().toISOString(),
            level: "info",
            message: "Schema push complete",
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
