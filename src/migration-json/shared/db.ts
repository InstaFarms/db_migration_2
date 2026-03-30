import { Pool } from "pg";
import { JsonMigrationConfig } from "./config";

export const createOldPool = (config: JsonMigrationConfig): Pool =>
    new Pool({ connectionString: config.oldDatabaseUrl });

export const createNewPool = (config: JsonMigrationConfig): Pool =>
    new Pool({ connectionString: config.newDatabaseUrl });
