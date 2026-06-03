import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { bearer } from "better-auth/plugins";
import * as authSchema from "./db/auth-schema.js";
import { sql } from "drizzle-orm";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  account: {
    skipStateCookieCheck: true,
  },
  secondaryStorage: {
    get: async (key) => {
      const result = await db.execute(
        sql`SELECT value::text FROM auth_state WHERE key = ${key} AND expires_at > NOW()`,
      );
      const raw = result.rows[0]?.value;
      if (!raw) return null;
      return typeof raw === "string" ? raw : JSON.stringify(raw);
    },
    set: async (key, value, ttl) => {
      const expiresAt = new Date(Date.now() + (ttl ?? 600) * 1000);
      await db.execute(
        sql`INSERT INTO auth_state (key, value, expires_at) 
            VALUES (${key}, ${value}, ${expiresAt})
            ON CONFLICT (key) DO UPDATE SET value = ${value}, expires_at = ${expiresAt}`,
      );
    },
    delete: async (key) => {
      await db.execute(sql`DELETE FROM auth_state WHERE key = ${key}`);
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    cookieOptions: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    crossSubdomainCookies: {
      enabled: false,
    },
    useSecureCookies: true,
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none", // must be none — OAuth flow is initiated cross-origin (Vercel → Render)
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "https://focus-flow-site.vercel.app",
  ],
  plugins: [bearer()],
});
