import { createClient } from "@/lib/supabase/server";

/**
 * Check if the current authenticated user is the demo user.
 * Safe to call from server actions / server components.
 */
export async function isCurrentUserDemo(): Promise<boolean> {
  const demoEmail = process.env.DEMO_EMAIL;
  if (!demoEmail) return false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === demoEmail;
  } catch {
    return false;
  }
}
