import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { bearer } from "better-auth/plugins";
import * as authSchema from "./db/auth-schema.js";

export const auth = betterAuth({
  baseURL: process.env.BASE_URL ?? "http://localhost:3001",
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
