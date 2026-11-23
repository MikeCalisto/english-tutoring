import { NextResponse, type NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { COOKIE, verifySession } from "@/lib/session-token";

/** Что видит каждая роль. Ученик: только таймлайны и тесты. */
const STUDENT_ALLOWED = ["/timelines", "/tests", "/cabinet", "/api/auth"];
const PUBLIC = ["/login", "/api/auth", "/api/telegram", "/api/zenedu", "/_next", "/favicon.ico", "/pack", "/oferta", "/politika"];

/** Учень бачить лише таймлайни, доки адміністратор не відкрив йому повний доступ. Дивимось у базу, бо роль у cookie не змінюється до нового входу. */
async function studentHasFullAccess(uid: string): Promise<boolean> {
  try {
    const rows = await neon(process.env.DATABASE_URL!)`select full_access from users where id = ${uid} and role = 'student' limit 1`;
    return rows[0]?.full_access === true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/" || PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const claims = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (claims.role === "student" && !STUDENT_ALLOWED.some((p) => pathname.startsWith(p)) && !(await studentHasFullAccess(claims.uid))) {
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
