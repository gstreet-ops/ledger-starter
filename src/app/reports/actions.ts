"use server";

import { trialBalance, profitAndLoss } from "@/lib/services/reports";

export async function fetchTrialBalance() {
  return trialBalance();
}

export async function fetchPnl(startDate: string, endDate: string) {
  return profitAndLoss(new Date(startDate), new Date(endDate + "T23:59:59"));
}
