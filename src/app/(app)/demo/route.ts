import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { purgeDemoData, seedDemoData } from "@/lib/services/demo-seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const demoEmail = process.env.DEMO_EMAIL;
  const demoPassword = process.env.DEMO_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!demoEmail || !demoPassword || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      error: "Missing env vars",
      has: { demoEmail: !!demoEmail, demoPassword: !!demoPassword, supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
    }, { status: 503 });
  }

  // Read profile from query param (default: acme-consulting)
  const profileId = request.nextUrl.searchParams.get("profile") || "acme-consulting";

  // Build the redirect response FIRST so cookies attach to it
  const redirectResponse = NextResponse.redirect(new URL("/dashboard", siteUrl));

  // Create Supabase client that reads/writes cookies on the redirect response
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, { ...options, secure: true, sameSite: "lax" as const });
        });
      },
    },
  });

  // Sign in — this sets auth cookies on the redirect response
  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error) {
    return NextResponse.json({ error: "Auth failed", detail: error.message }, { status: 500 });
  }

  // Seed the selected profile
  try {
    await purgeDemoData();
    await seedDemoData(profileId);
  } catch (err) {
    console.error("Demo seed error:", err);
  }

  return redirectResponse;
}
