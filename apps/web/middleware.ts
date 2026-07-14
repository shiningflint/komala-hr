import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthToken } from "@komala/shared";
import { SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyAuthToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminArea = pathname.startsWith("/dashboard");
  const isAdminRole = session.role === "SUPER_ADMIN" || session.role === "HR_ADMIN" || session.role === "MANAGER";
  if (isAdminArea && !isAdminRole) {
    return NextResponse.redirect(new URL("/me", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
