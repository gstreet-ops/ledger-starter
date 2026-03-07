import Anthropic from "@anthropic-ai/sdk";
import { getUserSettings } from "@/lib/db/queries";
import { STATE_TAX_RATES } from "@/lib/services/tax";
import { isCurrentUserDemo } from "./demo-check";
import { getDemoSamples } from "./demo-samples";
import { DEMO_PROFILES } from "@/lib/services/demo-seed";

async function resolveCurrentDemoProfile(): Promise<string> {
  const settings = await getUserSettings();
  const name = settings?.businessName;
  if (name) {
    for (const p of Object.values(DEMO_PROFILES)) {
      if (p.businessName === name) return p.id;
    }
  }
  return "acme-consulting";
}

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

type PnlData = {
  income: Array<{ name: string; balance: string }>;
  expenses: Array<{ name: string; balance: string }>;
  totalIncome: string;
  totalExpenses: string;
  netProfit: string;
};

type PeriodLabel = string; // e.g. "January 2026"

const AI_NOT_CONFIGURED_MESSAGE =
  "AI narrative reports require an Anthropic API key. Add your key in Settings to enable AI-powered financial summaries.";

export async function narratePnL(
  pnlData: PnlData,
  period: PeriodLabel
): Promise<string | null> {
  if (await isCurrentUserDemo()) {
    const profileId = await resolveCurrentDemoProfile();
    return getDemoSamples(profileId).narrative;
  }

  const anthropic = getClient();
  if (!anthropic) {
    console.warn("ANTHROPIC_API_KEY not set — AI narrative disabled");
    return AI_NOT_CONFIGURED_MESSAGE;
  }

  const incomeLines = pnlData.income
    .map((a) => `  ${a.name}: $${a.balance}`)
    .join("\n");
  const expenseLines = pnlData.expenses
    .map((a) => `  ${a.name}: $${a.balance}`)
    .join("\n");

  const settings = await getUserSettings();
  const stateCode = settings?.state ?? "XX";
  const stateLabel = STATE_TAX_RATES[stateCode]?.label ?? stateCode;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a financial advisor for a US single-member LLC (Schedule C filer, ${stateLabel}).
Write a concise, plain-English narrative summary of the given P&L data.
Highlight key drivers of revenue and expenses, notable trends, and anything the business owner should pay attention to.
Keep it to 2-3 short paragraphs. Use dollar amounts. Do not use markdown headers.`,
      messages: [
        {
          role: "user",
          content: `Summarize the Profit & Loss for ${period}:

Income ($${pnlData.totalIncome} total):
${incomeLines || "  (none)"}

Expenses ($${pnlData.totalExpenses} total):
${expenseLines || "  (none)"}

Net Profit: $${pnlData.netProfit}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text || null;
  } catch (err) {
    console.error("AI narrative error:", err);
    return null;
  }
}

export async function explainTransaction(
  transaction: { description: string; date: string; memo?: string | null },
  lines: Array<{
    accountName: string;
    debit: string;
    credit: string;
  }>
): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const lineDescriptions = lines
    .map(
      (l) =>
        `  ${l.accountName}: debit=$${l.debit} credit=$${l.credit}`
    )
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: `You are a bookkeeping assistant for a US single-member LLC (Schedule C filer).
Explain what this transaction means in plain English, including its tax implications.
Keep it to 2-3 sentences.`,
      messages: [
        {
          role: "user",
          content: `Transaction: "${transaction.description}" on ${transaction.date}
${transaction.memo ? `Memo: ${transaction.memo}` : ""}
Journal lines:
${lineDescriptions}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text || null;
  } catch (err) {
    console.error("AI explain error:", err);
    return null;
  }
}

export async function periodComparison(
  currentPeriod: { label: string; data: PnlData },
  previousPeriod: { label: string; data: PnlData }
): Promise<string | null> {
  if (await isCurrentUserDemo()) {
    const profileId = await resolveCurrentDemoProfile();
    return getDemoSamples(profileId).comparison;
  }

  const anthropic = getClient();
  if (!anthropic) {
    console.warn("ANTHROPIC_API_KEY not set — AI narrative disabled");
    return AI_NOT_CONFIGURED_MESSAGE;
  }

  function summarizePnl(label: string, data: PnlData) {
    const income = data.income
      .map((a) => `  ${a.name}: $${a.balance}`)
      .join("\n");
    const expenses = data.expenses
      .map((a) => `  ${a.name}: $${a.balance}`)
      .join("\n");
    return `${label}:
  Total Income: $${data.totalIncome}
${income || "  (none)"}
  Total Expenses: $${data.totalExpenses}
${expenses || "  (none)"}
  Net Profit: $${data.netProfit}`;
  }

  const settings = await getUserSettings();
  const stateCode = settings?.state ?? "XX";
  const stateLabel = STATE_TAX_RATES[stateCode]?.label ?? stateCode;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are a financial advisor for a US single-member LLC (Schedule C filer, ${stateLabel}).
Compare two periods and highlight significant changes. Note percentage changes for key items.
Keep it to 2-3 short paragraphs. Use dollar amounts. Do not use markdown headers.`,
      messages: [
        {
          role: "user",
          content: `Compare these two periods:

${summarizePnl(previousPeriod.label, previousPeriod.data)}

${summarizePnl(currentPeriod.label, currentPeriod.data)}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    return text || null;
  } catch (err) {
    console.error("AI comparison error:", err);
    return null;
  }
}
