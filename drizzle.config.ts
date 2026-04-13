import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema_new/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEW_DATABASE_URL!,
  },
});
