import type { NextRequest } from "next/server";
import { verifyAuthToken, type AuthTokenPayload } from "@komala/shared";
import { SESSION_COOKIE } from "./session";

/**
 * Resolves the caller's identity for API route handlers, supporting both the
 * web app (httpOnly cookie) and the mobile app (Authorization: Bearer <jwt>),
 * so a single set of REST routes can serve both clients.
 */
export async function getAuthContext(req: NextRequest): Promise<AuthTokenPayload | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return verifyAuthToken(authHeader.slice("Bearer ".length));
  }
  const cookieToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookieToken) return verifyAuthToken(cookieToken);
  return null;
}
