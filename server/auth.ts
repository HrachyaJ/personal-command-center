import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import * as authSchema from "./db/auth-schema.js";
import { sql } from "drizzle-orm";

const isProd = process.env.NODE_ENV === "production";

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
      maxAge: 60 * 60 * 24 * 7,
    },
    cookieOptions: {
      // In local dev we proxy /api through Vite, so auth requests are
      // same-origin from the browser. Lax is the correct value for non-secure
      // local cookies and allows form/XHR POST flows.
      sameSite: "lax",
      secure: isProd,
      httpOnly: true,
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    crossSubdomainCookies: { enabled: false },
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      secure: isProd,
      httpOnly: true,
      sameSite: "lax",
      partitioned: false,
    },
    redirectMetadata: true,
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
    "http://127.0.0.1:5173",
    "https://focus-flow-site.vercel.app",
  ],
  // No plugins needed: we authenticate purely via the httpOnly session
  // cookie. The bearer()/jwt() plugins were here to support a parallel
  // localStorage-token flow that turned out to be dead code (the custom
  // /api/auth/get-jwt route was shadowed by this handler's own catch-all
  // and never actually ran) — removed rather than fixed, since the cookie
  // already does the whole job across the Vercel/Render origins.
});
