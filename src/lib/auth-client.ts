import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const TOKEN_KEY = "focusflow:token";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onRequest(ctx) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
    },
    onResponse(ctx) {
      // Capture JWT issued after sign-in (email/password or social)
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem(TOKEN_KEY, token);
    },
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
