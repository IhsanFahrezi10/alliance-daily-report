import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isPublic = isAuthPage || request.nextUrl.pathname === "/";

  // ⚠️ TOKEN RUSAK → paksa logout & clear cookies
  if (error && (error.message.includes("refresh_token_not_found") || error.message.includes("Invalid Refresh Token") || error.code === "refresh_token_not_found")) {
    const loginResponse = NextResponse.redirect(new URL("/login", request.url));
    request.cookies.getAll().forEach((c) => {
      if (c.name.startsWith("sb-")) {
        loginResponse.cookies.delete(c.name);
      }
    });
    return loginResponse;
  }

  // ⚠️ RATE LIMIT → jangan loop
  if (error && error.code === "over_request_rate_limit") {
    if (!isPublic) {
      return NextResponse.redirect(new URL("/login?error=rate_limit", request.url));
    }
    return response;
  }

  // Normal redirect logic
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ============ ROLE-BASED ACCESS UNTUK HR APPROVER ============
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role === "hr_approver") {
      const path = request.nextUrl.pathname;

      // Path yang boleh diakses HR Approver
      const allowedPaths = ["/dashboard", "/reviews", "/profile"];
      const isAllowed = allowedPaths.some((p) => path === p || path.startsWith(p + "/"));

      // Boleh lihat detail logbook (read-only view) — /report/[id]
      // TAPI bukan /report/new, /report/[id]/edit, /report/[id]/print
      const isReportView = /^\/report\/[a-f0-9-]+$/.test(path);

      if (!isAllowed && !isReportView) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/report/:path*", "/reports/:path*", "/recap/:path*", "/users/:path*", "/profile/:path*", "/trash/:path*", "/reviews/:path*"],
};
