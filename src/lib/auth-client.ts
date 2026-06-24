import { createAuthClient } from "better-auth/react";

// In production (Vercel), baseURL is left empty so requests go to the
// current origin (e.g. https://focus-flow-site.vercel.app/api/auth/...),
// which Vercel then rewrites server-side to the Render backend. This keeps
// auth cookies first-party/same-site from the browser's perspective,
// avoiding Chrome's third-party cookie partitioning that blocks
// SameSite=None cookies on genuinely cross-site requests.
//
// Locally there's no such rewrite — Vite serves the frontend on :5173 and
// the API runs separately on :3001 — so we point straight at the API via
// VITE_API_URL instead of letting requests fall through to the Vite dev
// server and 404.
const baseURL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3001" : "");

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
