import { Request } from "express";
import { auth } from "./auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    `${process.env.BETTER_AUTH_URL ?? "http://localhost:3001"}/api/auth/jwks`,
  ),
);

export async function getSession(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    // Only attempt JWT verification for actual JWTs (not session tokens)
    if (token.startsWith("eyJ")) {
      try {
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
          audience: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
        });
        return {
          user: {
            id: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string,
            image: (payload.image as string) ?? null,
          },
          session: null,
        };
      } catch (err) {
        console.error("JWT verification failed:", err);
        // Fall through to cookie auth
      }
    }
    // Session tokens (non-JWT) fall through to cookie auth below
  }
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}
