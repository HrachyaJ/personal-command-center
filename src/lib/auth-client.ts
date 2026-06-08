import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onRequest(ctx) {},
    onResponse(ctx) {
      // Capture JWT issued after sign-in (email/password or social)
      // No client-side JWT persistence is required for browser auth.
      // The server sets an HttpOnly session cookie and requests are
      // authenticated using credentials: "include".
    },
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
