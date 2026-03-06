"use server";

import {
  scheduleCReport,
  selfEmploymentTax,
  federalIncomeTax,
  stateTax,
  getUserSettings,
  quarterlyEstimate,
} from "@/lib/services/tax";
import { parseMoney } from "@/lib/utils/money";

export async function fetchTaxData(year: number) {
  const [scheduleC, quarterly, settings] = await Promise.all([
    scheduleCReport(year),
    quarterlyEstimate(year),
    getUserSettings(),
  ]);

  const state = settings?.state ?? "XX";
  const netProfit = parseMoney(scheduleC.netProfit);
  const se = selfEmploymentTax(netProfit);
  const federal = federalIncomeTax(netProfit);
  const stateResult = stateTax(netProfit, state);

  return {
    scheduleC,
    se,
    federal,
    state: stateResult,
    quarterly,
  };
}
