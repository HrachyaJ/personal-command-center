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
    try {
      const token = authHeader.slice(7);
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
      return null;
    }
  }
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}
