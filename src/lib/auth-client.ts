import { createAuthClient } from "better-auth/react";

// Empty baseURL = requests go to the current origin (e.g.
// https://focus-flow-site.vercel.app/api/auth/...), which Vercel then
// rewrites server-side to the Render backend. This keeps auth cookies
// first-party/same-site from the browser's perspective, avoiding Chrome's
// third-party cookie partitioning that blocks SameSite=None cookies on
// genuinely cross-site requests.
export const authClient = createAuthClient({
  baseURL: "",
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
