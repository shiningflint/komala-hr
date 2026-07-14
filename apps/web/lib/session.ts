import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken, type AuthTokenPayload, type Role } from "@komala/shared";

export const SESSION_COOKIE = "komala_token";

export async function getSession(): Promise<AuthTokenPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

export async function requireSession(): Promise<AuthTokenPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "HR_ADMIN"];

/** Roles allowed to see/manage all employees, not just their own record. */
export function isAdmin(session: AuthTokenPayload): boolean {
  return ADMIN_ROLES.includes(session.role as Role);
}

export function isManagerOrAbove(session: AuthTokenPayload): boolean {
  return isAdmin(session) || session.role === "MANAGER";
}

export async function requireAdmin(): Promise<AuthTokenPayload> {
  const session = await requireSession();
  if (!isAdmin(session)) redirect("/me");
  return session;
}

export async function requireManagerOrAbove(): Promise<AuthTokenPayload> {
  const session = await requireSession();
  if (!isManagerOrAbove(session)) redirect("/me");
  return session;
}
