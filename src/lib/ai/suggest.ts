import Anthropic from "@anthropic-ai/sdk";
import { getAccountsWithTaxCategories } from "@/lib/db/queries";

type ImportRowInput = {
  id: string;
  name: string;
  merchantName: string | null;
  amount: string;
  category: unknown;
};

export type AiSuggestion = {
  accountId: string;
  accountName: string;
  confidence: number;
  reasoning: string;
};

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export async function suggestCategory(
  row: ImportRowInput
): Promise<AiSuggestion | null> {
  const results = await suggestCategoriesBatch([row]);
  return results.get(row.id) ?? null;
}

export async function suggestCategoriesBatch(
  rows: ImportRowInput[]
): Promise<Map<string, AiSuggestion>> {
  const anthropic = getClient();
  if (!anthropic) return new Map();

  const { accounts, taxCategories } = await getAccountsWithTaxCategories();

  const accountList = accounts
    .map((a) => `${a.code} - ${a.name} (${a.type}) [Schedule C: ${a.scheduleCLine ?? "N/A"}]`)
    .join("\n");

  const taxCatList = taxCategories
    .map((t) => `${t.name} — ${t.formLine} (${t.form})`)
    .join("\n");

  const rowDescriptions = rows
    .map(
      (r, i) =>
        `[${i}] id=${r.id} | merchant="${r.merchantName ?? ""}" | description="${r.name}" | amount=${r.amount} | plaid_category=${JSON.stringify(r.category)}`
    )
    .join("\n");

  const systemPrompt = `You are a bookkeeping assistant for a US single-member LLC (Schedule C filer, Georgia).
Given bank transactions, suggest the best ledger account for each.

CHART OF ACCOUNTS:
${accountList}

TAX CATEGORIES:
${taxCatList}

Respond with a JSON array. Each element must have:
- index: number (matching the [index] in the input)
- accountId: string (the account UUID)
- accountName: string (the account name)
- confidence: number (0 to 1)
- reasoning: string (brief explanation)

Only output the JSON array, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Categorize these transactions:\n${rowDescriptions}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return new Map();

    const suggestions: Array<{
      index: number;
      accountId: string;
      accountName: string;
      confidence: number;
      reasoning: string;
    }> = JSON.parse(jsonMatch[0]);

    const results = new Map<string, AiSuggestion>();
    for (const s of suggestions) {
      const row = rows[s.index];
      if (row) {
        results.set(row.id, {
          accountId: s.accountId,
          accountName: s.accountName,
          confidence: s.confidence,
          reasoning: s.reasoning,
        });
      }
    }

    return results;
  } catch (err) {
    console.error("AI suggestion error:", err);
    return new Map();
  }
}
