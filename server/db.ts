import * as authSchema from "./db/auth-schema.js";
import * as appSchema from "./db/schema.js";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type AppSchema = typeof authSchema & typeof appSchema;
let db: NeonHttpDatabase<AppSchema> | NodePgDatabase<AppSchema>;

if (process.env.NODE_ENV === "production") {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  db = drizzle(neon(process.env.DATABASE_URL!), {
    schema: { ...authSchema, ...appSchema },
  });
} else {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
    schema: { ...authSchema, ...appSchema },
  });
}

export { db };
