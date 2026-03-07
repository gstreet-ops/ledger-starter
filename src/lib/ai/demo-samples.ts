/**
 * Pre-generated AI samples for the demo user, per business profile.
 */

import type { DemoProfileId } from "@/lib/services/demo-seed";

type DemoSamples = { narrative: string; comparison: string };

const ACME_SAMPLES: DemoSamples = {
  narrative: `Acme Consulting LLC generated $15,000 in revenue during this period, driven primarily by consulting engagements including a $5,000 website redesign, $2,500 in SEO consulting, two monthly retainers totaling $6,000, and a $1,500 logo design project. Revenue is well-diversified across service types, though retainer income provides a strong recurring base.

Total expenses were $1,805.00, with the largest categories being travel ($832 for a Chicago client visit including flights, hotel, and ground transportation), marketing & advertising ($299 for Meta ads and a Canva Pro subscription), meals & entertainment ($276 for client dinners and meetings), software & subscriptions ($246 for tools like Notion, GitHub Copilot, Adobe Creative Cloud, and Figma), and office supplies ($157 for printer supplies, a monitor stand, and client mailings).

Net profit of $13,195 represents a healthy 88% profit margin, which is strong for a consulting business. At this run rate, estimated annual revenue would be approximately $36,000. Since Texas has no state income tax, the tax liability is entirely federal income tax and self-employment tax (15.3%). Consider setting aside roughly 25-30% of net profit for quarterly estimated tax payments to avoid underpayment penalties.`,
  comparison: `Revenue increased significantly from $7,500 in January-February to $7,500 in March-May, maintaining consistent income levels across both periods. The earlier period saw two large projects (website redesign at $5,000 and SEO consulting at $2,500), while the later period was driven by a monthly retainer ($3,000), logo design ($1,500), and another retainer payment ($3,000).

Expenses shifted notably between periods. Travel spending of $832 was concentrated entirely in the January-February period (the Chicago client visit), while the March-May period saw lower overall spending of $389 versus $1,416 earlier. Marketing costs appeared in both periods, with Meta Ads ($150) in March and the Canva Pro annual subscription ($149) in April.

Overall, the business maintained strong profitability in both periods — $6,084 net profit (81% margin) in Jan-Feb and $7,111 (95% margin) in Mar-May. The improvement was driven primarily by lower travel expenses in the later period. The consulting model's low fixed costs continue to deliver excellent margins.`,
};

const CARWASH_SAMPLES: DemoSamples = {
  narrative: `Sparkling Mobile Car Wash brought in $5,860 in revenue across the period, with fleet contracts making up the lion's share. The Sunshine Realty contract alone generated $4,800 ($1,200/month for 8 vehicles), and a new Coastal Plumbing fleet contract added $500. Residential washes contributed $1,060 from 5 jobs averaging $55-75 each. The recurring fleet revenue is a strong foundation — consider pursuing more contracts to stabilize monthly cash flow.

Expenses totaled $1,579, heavily weighted toward vehicle-related costs. Commercial auto insurance was the single largest expense at $450 (quarterly GEICO premium), followed by $535 in fuel and maintenance (oil change, tires). Cleaning supplies from Chemical Guys and AutoZone ran $334. Marketing spend was modest at $140 between Nextdoor ads and VistaPrint business cards. The water utility bill of $120 is a necessary cost of the mobile wash operation.

Net profit of $4,281 yields a 73% margin, which is healthy for a service business with vehicle overhead. Florida has no state income tax, so the tax burden is federal income + self-employment tax (15.3%). With the Sunshine Realty contract providing predictable monthly income, prioritize building the fleet client base — each new contract significantly improves the revenue-to-expense ratio since fuel and supply costs scale slowly.`,
  comparison: `Revenue grew from $3,925 in January-February to $1,935 in the March-May period (note: only partial data through April). Fleet contracts provided consistent $1,200/month from Sunshine Realty across both periods, with the Coastal Plumbing contract ($500) starting in March. Residential wash volume was steady at 2-3 jobs per period.

Expenses were front-loaded in January-February at $1,039, driven by the $450 quarterly insurance payment and the $245 supply restock from Chemical Guys. The March-May period saw $540 in expenses, with tire replacement ($320) being the standout cost. Fuel spending remained consistent at roughly $70/month. Marketing was split across periods — Nextdoor ads ($75) in February and VistaPrint ($65) in April.

Profitability remained solid in both periods — $2,886 net profit (74% margin) in Jan-Feb and $1,395 (72% margin) in Mar-May. The consistent margins reflect the business's simple cost structure. The biggest opportunity is scaling fleet contracts: each new fleet client adds $500-1,500/month with minimal incremental cost.`,
};

const BOARDGAMES_SAMPLES: DemoSamples = {
  narrative: `Pixel & Dice generated $22,040 in revenue during this period across three channels. Shopify direct sales led with $16,100 from 5 payouts, followed by Amazon Marketplace at $5,490 from 3 disbursements. A local game night event at Emerald City Comics contributed $450. The multi-channel approach provides good diversification, with Shopify margins likely higher after removing Amazon's referral fees.

Cost of goods sold was the largest expense at $5,370, reflecting wholesale purchases from Asmodee Distribution ($3,950) and Alliance Game Distributors ($1,420). Shipping costs ran $985 across USPS and UPS. Platform fees (Shopify monthly + transaction fees) totaled $158. Warehouse storage at Public Storage was $450 for the period. Marketing was limited to a $150 Instagram ad campaign in March.

Net profit of $14,927 represents a 68% margin, which is excellent for a retail/e-commerce business. However, this doesn't account for Washington's B&O tax (0.471% on gross receipts for retailing), which would be approximately $104 on this revenue. Consider tracking inventory more granularly — COGS timing relative to sales affects the true margin picture. At current velocity, annualized revenue projects to roughly $53,000.`,
  comparison: `Revenue was strong across both periods — $10,150 in January-February and $11,890 in March-May. Shopify payouts increased from $6,270 to $9,830, suggesting growing direct sales momentum. Amazon disbursements grew modestly from $3,450 to $2,040 (though March-May may have incomplete data). The game night event ($450) in February was a nice supplemental income source.

COGS purchases tracked closely with sales volume — $1,850 in Jan-Feb from Asmodee and $3,520 in Mar-May (Asmodee spring catalog + Alliance restock). Shipping costs rose from $605 to $380, roughly proportional. Warehouse rent was flat at $225/month. Platform fees held steady at ~$79/month for Shopify.

Gross margin improved slightly from 69% in Jan-Feb to 70% in Mar-May, driven by channel mix shift toward higher-margin Shopify direct sales. The key metric to watch is the COGS-to-revenue ratio — the spring catalog purchase ($2,100) is an investment in Q2-Q3 inventory that should drive future sales. Washington B&O tax liability is estimated at approximately $48 for Jan-Feb and $56 for Mar-May.`,
};

const SAMPLES: Record<DemoProfileId, DemoSamples> = {
  "acme-consulting": ACME_SAMPLES,
  "car-wash": CARWASH_SAMPLES,
  "board-games": BOARDGAMES_SAMPLES,
};

export function getDemoSamples(profileId?: string): DemoSamples {
  const id = (profileId || "acme-consulting") as DemoProfileId;
  return SAMPLES[id] || SAMPLES["acme-consulting"];
}

// Keep backward-compatible named exports for existing imports
export const DEMO_NARRATIVE = ACME_SAMPLES.narrative;
export const DEMO_COMPARISON = ACME_SAMPLES.comparison;
