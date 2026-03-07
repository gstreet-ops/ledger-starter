/**
 * Pre-generated AI categorization suggestions for demo transactions.
 * Maps transaction description patterns to suggested accounts.
 * Used when the demo user triggers AI categorization.
 */

import type { AiSuggestion } from "./suggest";

type DemoSuggestionEntry = {
  pattern: RegExp;
  accountCode: number;
  accountName: string;
  confidence: number;
  reasoning: string;
};

const DEMO_PATTERNS: DemoSuggestionEntry[] = [
  { pattern: /notion/i, accountCode: 6010, accountName: "Software & Subscriptions", confidence: 0.95, reasoning: "Notion is a productivity/project management SaaS tool" },
  { pattern: /github copilot/i, accountCode: 6010, accountName: "Software & Subscriptions", confidence: 0.94, reasoning: "GitHub Copilot is a software development subscription" },
  { pattern: /adobe creative/i, accountCode: 6010, accountName: "Software & Subscriptions", confidence: 0.93, reasoning: "Adobe Creative Cloud is a software subscription for design tools" },
  { pattern: /figma/i, accountCode: 6010, accountName: "Software & Subscriptions", confidence: 0.92, reasoning: "Figma is a design software subscription" },
  { pattern: /staples/i, accountCode: 6030, accountName: "Office Supplies", confidence: 0.91, reasoning: "Staples is an office supply retailer" },
  { pattern: /amazon.*monitor/i, accountCode: 6030, accountName: "Office Supplies", confidence: 0.87, reasoning: "Monitor stand is office equipment/supplies" },
  { pattern: /usps/i, accountCode: 6030, accountName: "Office Supplies", confidence: 0.85, reasoning: "USPS mailing costs for business correspondence" },
  { pattern: /capital grille|starbucks.*meeting|flores.*lunch/i, accountCode: 6050, accountName: "Meals & Entertainment", confidence: 0.90, reasoning: "Business meal with client or team" },
  { pattern: /southwest|airline/i, accountCode: 6060, accountName: "Travel & Lodging", confidence: 0.95, reasoning: "Business airfare for client visit" },
  { pattern: /hilton|hotel/i, accountCode: 6060, accountName: "Travel & Lodging", confidence: 0.94, reasoning: "Hotel stay for business travel" },
  { pattern: /uber.*airport/i, accountCode: 6060, accountName: "Travel & Lodging", confidence: 0.91, reasoning: "Ground transportation during business travel" },
  { pattern: /meta ads/i, accountCode: 6070, accountName: "Marketing & Promotion", confidence: 0.93, reasoning: "Social media advertising campaign" },
  { pattern: /canva/i, accountCode: 6070, accountName: "Marketing & Promotion", confidence: 0.88, reasoning: "Canva is a design tool commonly used for marketing materials" },
];

/**
 * Look up a demo suggestion by transaction description.
 * Returns null if no pattern matches.
 */
export function getDemoSuggestion(
  description: string,
  accountIdsByCode: Map<number, string>
): AiSuggestion | null {
  for (const entry of DEMO_PATTERNS) {
    if (entry.pattern.test(description)) {
      const accountId = accountIdsByCode.get(entry.accountCode);
      if (!accountId) continue;
      return {
        accountId,
        accountName: entry.accountName,
        confidence: entry.confidence,
        reasoning: entry.reasoning,
      };
    }
  }
  return null;
}
