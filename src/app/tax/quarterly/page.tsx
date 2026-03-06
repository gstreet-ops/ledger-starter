export const dynamic = "force-dynamic";

import { quarterlyOverview } from "@/lib/services/quarterly-estimates";
import { QuarterlyView } from "./quarterly-view";

export default async function QuarterlyEstimatesPage() {
  const year = new Date().getFullYear();
  const data = await quarterlyOverview(year);

  return <QuarterlyView initialData={data} initialYear={year} />;
}
