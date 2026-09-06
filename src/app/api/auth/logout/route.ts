import { NextResponse, type NextRequest } from "next/server";
import { endSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await endSession();
  return NextResponse.redirect(new URL("/login", req.nextUrl.origin), 303);
}
