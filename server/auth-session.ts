import { Request } from "express";
import { auth } from "./auth.js";
import { fromNodeHeaders } from "better-auth/node";

export async function getSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}
