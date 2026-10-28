import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Cek keberadaan cookie auth (tanpa network call — super cepat)
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isPublic = isAuthPage || request.nextUrl.pathname === "/";

  if (!hasAuthCookie && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasAuthCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/report/:path*", "/reports/:path*", "/recap/:path*", "/users/:path*", "/profile/:path*", "/trash/:path*", "/reviews/:path*"],
};
