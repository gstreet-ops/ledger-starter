"use server";

import {
  scheduleCReport,
  selfEmploymentTax,
  federalIncomeTax,
  georgiaIncomeTax,
  quarterlyEstimate,
} from "@/lib/services/tax";
import { parseMoney } from "@/lib/utils/money";

export async function fetchTaxData(year: number) {
  const [scheduleC, quarterly] = await Promise.all([
    scheduleCReport(year),
    quarterlyEstimate(year),
  ]);

  const netProfit = parseMoney(scheduleC.netProfit);
  const se = selfEmploymentTax(netProfit);
  const federal = federalIncomeTax(netProfit);
  const ga = georgiaIncomeTax(netProfit);

  return {
    scheduleC,
    se,
    federal,
    ga,
    quarterly,
  };
}
