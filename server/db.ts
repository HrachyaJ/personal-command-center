import * as authSchema from "./db/auth-schema.js";
import * as appSchema from "./db/schema.js";

let db: any;

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
