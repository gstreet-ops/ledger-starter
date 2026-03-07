import { NextResponse } from "next/server";
import { syncAllItems } from "@/lib/plaid/sync";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await syncAllItems();

    const summary = {
      itemsSynced: results.length,
      totalAdded: results.reduce((s, r) => s + r.added, 0),
      totalModified: results.reduce((s, r) => s + r.modified, 0),
      totalRemoved: results.reduce((s, r) => s + r.removed, 0),
      errors: results.filter((r) => r.error).map((r) => ({
        institution: r.institutionName,
        error: r.error,
      })),
      results,
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Sync failed" },
      { status: 500 }
    );
  }
}
