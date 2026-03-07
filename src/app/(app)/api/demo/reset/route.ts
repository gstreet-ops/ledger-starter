import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserDemo } from "@/lib/ai/demo-check";
import { purgeDemoData, seedDemoData } from "@/lib/services/demo-seed";

export async function POST(request: NextRequest) {
  if (!(await isCurrentUserDemo())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profileId = request.nextUrl.searchParams.get("profile") || undefined;

  try {
    await purgeDemoData();
    const result = await seedDemoData(profileId);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Demo reset error:", err);
    return NextResponse.json(
      { error: "Failed to reset demo data" },
      { status: 500 }
    );
  }
}
