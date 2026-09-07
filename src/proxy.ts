import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/session-token";

/** Что видит каждая роль. Ученик: только таймлайны и тесты. */
const STUDENT_ALLOWED = ["/timelines", "/tests", "/cabinet", "/api/auth"];
const PUBLIC = ["/login", "/api/auth", "/api/telegram", "/_next", "/favicon.ico"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const claims = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (claims.role === "student" && !STUDENT_ALLOWED.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/timelines";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
