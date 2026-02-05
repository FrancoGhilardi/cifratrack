import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth", "/api/cron"];

export default auth((req) => {
  const { nextUrl } = req;

  const isPublic = PUBLIC_PATHS.some((path) =>
    nextUrl.pathname.startsWith(path),
  );
  if (isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
