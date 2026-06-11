import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onResponse(ctx) {
      const token = ctx.response.headers.get("set-auth-token");
      console.log("auth response headers token:", token);
      if (token) localStorage.setItem("better-auth-token", token);
    },
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
