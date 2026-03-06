import { getRules } from "@/lib/db/queries";

type ImportRow = {
  id: string;
  name: string;
  merchantName: string | null;
};

type RuleMatch = {
  ruleId: string;
  accountId: string;
  ruleName: string;
};

export async function matchRule(
  merchantName: string | null,
  description: string
): Promise<RuleMatch | null> {
  const rules = await getRules();

  for (const rule of rules) {
    const pattern = rule.pattern.toLowerCase();
    const field =
      rule.matchField === "merchant_name"
        ? (merchantName ?? "").toLowerCase()
        : description.toLowerCase();

    if (field.includes(pattern)) {
      return {
        ruleId: rule.id,
        accountId: rule.accountId,
        ruleName: rule.name,
      };
    }
  }

  return null;
}

export async function applyRules(
  rows: ImportRow[]
): Promise<Map<string, RuleMatch>> {
  const rules = await getRules();
  const results = new Map<string, RuleMatch>();

  for (const row of rows) {
    for (const rule of rules) {
      const pattern = rule.pattern.toLowerCase();
      const field =
        rule.matchField === "merchant_name"
          ? (row.merchantName ?? "").toLowerCase()
          : row.name.toLowerCase();

      if (field.includes(pattern)) {
        results.set(row.id, {
          ruleId: rule.id,
          accountId: rule.accountId,
          ruleName: rule.name,
        });
        break; // highest priority wins (rules already sorted by priority desc)
      }
    }
  }

  return results;
}
