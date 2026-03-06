import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/drizzle";
import { userSettings } from "@/lib/db/schema";

const publicPaths = ["/login", "/setup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    publicPaths.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Not authenticated → /login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated but setup not complete → /setup
  // We do a lightweight DB check here. Runs only on non-public, non-API routes.
  try {
    const [settings] = await db.select().from(userSettings).limit(1);
    if (!settings || !settings.setupComplete) {
      const setupUrl = request.nextUrl.clone();
      setupUrl.pathname = "/setup";
      return NextResponse.redirect(setupUrl);
    }
  } catch {
    // If the DB isn't reachable (e.g. env not set up yet), let the request through
    // so the user can see the error rather than a redirect loop.
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
