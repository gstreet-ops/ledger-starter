"use client";

import { useState, useMemo } from "react";

const competitors = [
  {
    id: "ledger-starter",
    name: "Ledger Starter",
    tagline: "Self-hosted, open-source accounting + tax for US small businesses",
    pricing: "Free (self-hosted)",
    pricingNote: "Hosting cost only (~$0-20/mo via Vercel + Supabase free tier)",
    target: "Developer-savvy solo operators, SMLLCs, Schedule C filers",
    stack: "Next.js, Supabase, Drizzle, Plaid, Claude AI",
    hosting: "Self-hosted (Vercel one-click deploy)",
    isOurs: true,
    features: {
      "Double-Entry Accounting": { status: "yes", note: "Full double-entry with balanced debit/credit lines" },
      "Bank Sync (Plaid)": { status: "yes", note: "Plaid integration for auto-import" },
      "AI Categorization": { status: "yes", note: "Claude-powered suggestions (advisory only)" },
      "AI Narrative Reports": { status: "yes", note: "Plain-English P&L summaries via Claude" },
      "Schedule C / Tax Summary": { status: "yes", note: "All 50 states, SE tax, federal, quarterly estimates" },
      "Quarterly Tax Estimates": { status: "yes", note: "Calculates and tracks estimated payments" },
      "Chart of Accounts": { status: "yes", note: "Fully customizable, standard account codes" },
      "Invoicing": { status: "no", note: "Not yet — on roadmap" },
      "Mileage Tracking": { status: "no", note: "Not yet — on roadmap" },
      "Receipt Scanning": { status: "no", note: "Not yet" },
      "Time Tracking": { status: "no", note: "Not in scope" },
      "Payroll": { status: "no", note: "Out of scope" },
      "Multi-Currency": { status: "no", note: "USD only" },
      "Inventory Management": { status: "no", note: "Out of scope" },
      "File Import (CSV/PDF)": { status: "yes", note: "AmEx XLSX, Citi PDF, Truist PDF parsers" },
      "P&L / Balance Sheet": { status: "yes", note: "P&L, trial balance, period comparison" },
      "Mobile App": { status: "no", note: "Responsive web only" },
      "Accountant Access": { status: "no", note: "Single user — no role sharing yet" },
      "1099 Tracking": { status: "no", note: "On long-term roadmap" },
      "Data Ownership": { status: "yes", note: "100% — your database, your server" },
      "Open Source": { status: "yes", note: "MIT-style, fork and customize" },
      "API / Extensibility": { status: "yes", note: "Full codebase access, modular architecture" },
      "Auto-Categorization Rules": { status: "yes", note: "Pattern-based rules engine" },
      "Tax Filing": { status: "no", note: "Generates summaries, does not file" },
      "Setup Wizard": { status: "yes", note: "Guided entity/state/filing/banking setup" },
    }
  },
  {
    id: "quickbooks-se",
    name: "QuickBooks Solopreneur",
    tagline: "Intuit's lite product for side gigs and self-employed",
    pricing: "$20/mo",
    pricingNote: "Discounts available, often bundled with TurboTax",
    target: "Side gig workers, freelancers, Uber/Lyft drivers",
    stack: "Proprietary SaaS",
    hosting: "Cloud (Intuit)",
    features: {
      "Double-Entry Accounting": { status: "no", note: "Simplified — no custom chart of accounts" },
      "Bank Sync (Plaid)": { status: "yes", note: "Connect 1 bank (Solopreneur) or multiple (Online)" },
      "AI Categorization": { status: "yes", note: "Auto-categorizes after learning patterns" },
      "AI Narrative Reports": { status: "no", note: "Basic reports only" },
      "Schedule C / Tax Summary": { status: "yes", note: "Schedule C prep, TurboTax integration" },
      "Quarterly Tax Estimates": { status: "yes", note: "Calculates and reminds" },
      "Chart of Accounts": { status: "partial", note: "Pre-defined categories, not customizable in Solopreneur" },
      "Invoicing": { status: "yes", note: "2/mo (Solopreneur), unlimited (Online plans)" },
      "Mileage Tracking": { status: "yes", note: "GPS-based automatic tracking" },
      "Receipt Scanning": { status: "yes", note: "Photo capture, auto-matching" },
      "Time Tracking": { status: "no", note: "Not in Solopreneur tier" },
      "Payroll": { status: "no", note: "Add-on at $45+/mo" },
      "Multi-Currency": { status: "no", note: "Add-on cost" },
      "Inventory Management": { status: "no", note: "Only in Online Plus+ plans" },
      "File Import (CSV/PDF)": { status: "yes", note: "CSV/QBO import" },
      "P&L / Balance Sheet": { status: "partial", note: "Top 3 reports in Solopreneur" },
      "Mobile App": { status: "yes", note: "Full-featured iOS/Android" },
      "Accountant Access": { status: "partial", note: "Only in paid Online plans" },
      "1099 Tracking": { status: "yes", note: "1 contractor in Solopreneur" },
      "Data Ownership": { status: "no", note: "Intuit owns the infra, export via CSV" },
      "Open Source": { status: "no", note: "Proprietary" },
      "API / Extensibility": { status: "partial", note: "App marketplace, no source access" },
      "Auto-Categorization Rules": { status: "yes", note: "AI learns from corrections" },
      "Tax Filing": { status: "yes", note: "Via TurboTax bundle" },
      "Setup Wizard": { status: "yes", note: "Guided onboarding" },
    }
  },
  {
    id: "wave", name: "Wave", tagline: "Free accounting and invoicing for micro-businesses", pricing: "Free (Starter) / $19/mo (Pro)", pricingNote: "H&R Block owned. Payment processing at 2.9% + $0.60", target: "Freelancers, micro-businesses under $100K revenue", stack: "Proprietary SaaS", hosting: "Cloud (Wave/H&R Block)",
    features: { "Double-Entry Accounting": { status: "yes", note: "Full double-entry bookkeeping" }, "Bank Sync (Plaid)": { status: "partial", note: "Pro plan only ($19/mo)" }, "AI Categorization": { status: "partial", note: "Auto-merge and categorize (Pro only)" }, "AI Narrative Reports": { status: "no", note: "Standard reports only" }, "Schedule C / Tax Summary": { status: "no", note: "No tax-specific features" }, "Quarterly Tax Estimates": { status: "no", note: "Not available" }, "Chart of Accounts": { status: "yes", note: "Customizable" }, "Invoicing": { status: "yes", note: "Unlimited, customizable, free" }, "Mileage Tracking": { status: "no", note: "Not available" }, "Receipt Scanning": { status: "partial", note: "Pro plan only, mixed reviews on quality" }, "Time Tracking": { status: "no", note: "Not available" }, "Payroll": { status: "yes", note: "$20-40/mo + $6/employee" }, "Multi-Currency": { status: "no", note: "Limited" }, "Inventory Management": { status: "no", note: "Not available" }, "File Import (CSV/PDF)": { status: "yes", note: "CSV import, manual entry" }, "P&L / Balance Sheet": { status: "yes", note: "P&L, balance sheet, cash flow, general ledger" }, "Mobile App": { status: "yes", note: "iOS/Android (invoicing focused)" }, "Accountant Access": { status: "yes", note: "Free — viewer/editor roles" }, "1099 Tracking": { status: "no", note: "Not available" }, "Data Ownership": { status: "no", note: "Wave/H&R Block hosted, CSV export" }, "Open Source": { status: "no", note: "Proprietary" }, "API / Extensibility": { status: "no", note: "Very limited integrations" }, "Auto-Categorization Rules": { status: "partial", note: "Basic merge rules" }, "Tax Filing": { status: "no", note: "No — use H&R Block separately" }, "Setup Wizard": { status: "partial", note: "Basic onboarding" } }
  },
  {
    id: "keeper", name: "Keeper Tax", tagline: "AI-powered expense tracking and tax filing for freelancers", pricing: "$99-399/yr", pricingNote: "Just Filing $99, Filing+Deductions $199, Premium $399", target: "Freelancers, 1099 contractors, gig workers", stack: "Proprietary SaaS + Mobile", hosting: "Cloud (Keeper)",
    features: { "Double-Entry Accounting": { status: "no", note: "Not accounting software — expense tracker + tax filer" }, "Bank Sync (Plaid)": { status: "yes", note: "Up to 10 accounts on paid plans" }, "AI Categorization": { status: "yes", note: "Patented AI scans and categorizes deductions" }, "AI Narrative Reports": { status: "no", note: "AI tax assistant for Q&A, not reports" }, "Schedule C / Tax Summary": { status: "yes", note: "Full Schedule C prep and filing" }, "Quarterly Tax Estimates": { status: "yes", note: "Real-time tax estimates" }, "Chart of Accounts": { status: "no", note: "Not accounting software" }, "Invoicing": { status: "no", note: "Not available" }, "Mileage Tracking": { status: "no", note: "Not built-in" }, "Receipt Scanning": { status: "yes", note: "Upload and auto-match" }, "Time Tracking": { status: "no", note: "Not available" }, "Payroll": { status: "no", note: "Not available" }, "Multi-Currency": { status: "no", note: "USD only" }, "Inventory Management": { status: "no", note: "Not available" }, "File Import (CSV/PDF)": { status: "yes", note: "Upload prior returns (PDF)" }, "P&L / Balance Sheet": { status: "no", note: "Tax-focused, not accounting reports" }, "Mobile App": { status: "yes", note: "4.8★ iOS, 4.6★ Android" }, "Accountant Access": { status: "no", note: "Tax pro reviews return (not collaborative)" }, "1099 Tracking": { status: "yes", note: "Multiple income sources" }, "Data Ownership": { status: "no", note: "Keeper-hosted, export to spreadsheet" }, "Open Source": { status: "no", note: "Proprietary" }, "API / Extensibility": { status: "no", note: "Closed platform" }, "Auto-Categorization Rules": { status: "yes", note: "AI learns from user corrections" }, "Tax Filing": { status: "yes", note: "Federal + 2 state returns, expert-reviewed" }, "Setup Wizard": { status: "yes", note: "Onboarding questionnaire" } }
  },
  {
    id: "freshbooks", name: "FreshBooks", tagline: "Cloud accounting built around invoicing for service businesses", pricing: "$19-70/mo", pricingNote: "Lite $19, Plus $33, Premium $70. +$11/extra user", target: "Freelancers, service businesses, agencies", stack: "Proprietary SaaS", hosting: "Cloud (FreshBooks)",
    features: { "Double-Entry Accounting": { status: "partial", note: "Only in Plus plan and above" }, "Bank Sync (Plaid)": { status: "yes", note: "Auto-import and reconciliation" }, "AI Categorization": { status: "partial", note: "Auto-categorize connected transactions" }, "AI Narrative Reports": { status: "no", note: "Standard financial reports" }, "Schedule C / Tax Summary": { status: "no", note: "No tax-specific features" }, "Quarterly Tax Estimates": { status: "no", note: "Not available" }, "Chart of Accounts": { status: "yes", note: "Customizable in Plus+" }, "Invoicing": { status: "yes", note: "Best-in-class — customizable, recurring, estimates" }, "Mileage Tracking": { status: "yes", note: "GPS tracking in all plans" }, "Receipt Scanning": { status: "yes", note: "Photo capture and matching" }, "Time Tracking": { status: "yes", note: "Built-in, billable hours to invoices" }, "Payroll": { status: "partial", note: "Add-on at $40+/mo" }, "Multi-Currency": { status: "yes", note: "Available in Premium" }, "Inventory Management": { status: "no", note: "Very limited" }, "File Import (CSV/PDF)": { status: "yes", note: "CSV, OFX import" }, "P&L / Balance Sheet": { status: "yes", note: "Good reports, not as deep as QB" }, "Mobile App": { status: "yes", note: "Excellent — invoicing, expenses, time" }, "Accountant Access": { status: "partial", note: "Plus plan and above" }, "1099 Tracking": { status: "yes", note: "Contractor management" }, "Data Ownership": { status: "no", note: "FreshBooks-hosted, CSV export" }, "Open Source": { status: "no", note: "Proprietary" }, "API / Extensibility": { status: "yes", note: "REST API, many integrations" }, "Auto-Categorization Rules": { status: "yes", note: "Bank rule engine" }, "Tax Filing": { status: "no", note: "Export to accountant only" }, "Setup Wizard": { status: "yes", note: "Guided onboarding" } }
  },
  {
    id: "hurdlr", name: "Hurdlr", tagline: "Automatic mileage, expense, and tax tracking for freelancers", pricing: "Free / $10-17/mo", pricingNote: "Free basic, Premium $100/yr, Pro $200/yr", target: "Gig workers, rideshare drivers, real estate agents, freelancers", stack: "Proprietary Mobile App", hosting: "Cloud (Hurdlr)",
    features: { "Double-Entry Accounting": { status: "no", note: "Basic accounting in Pro only" }, "Bank Sync (Plaid)": { status: "yes", note: "9,500+ banks, auto-track" }, "AI Categorization": { status: "yes", note: "ML-based deduction finder" }, "AI Narrative Reports": { status: "no", note: "Basic reports and exports" }, "Schedule C / Tax Summary": { status: "yes", note: "Real-time tax breakdown (federal, state, SE)" }, "Quarterly Tax Estimates": { status: "yes", note: "Real-time quarterly estimates" }, "Chart of Accounts": { status: "no", note: "Simplified categories" }, "Invoicing": { status: "partial", note: "Pro plan only, basic" }, "Mileage Tracking": { status: "yes", note: "Best-in-class — GPS, auto, low battery" }, "Receipt Scanning": { status: "yes", note: "Photo capture" }, "Time Tracking": { status: "no", note: "Not available" }, "Payroll": { status: "no", note: "Not available" }, "Multi-Currency": { status: "no", note: "USD only" }, "Inventory Management": { status: "no", note: "Not available" }, "File Import (CSV/PDF)": { status: "no", note: "Bank sync only" }, "P&L / Balance Sheet": { status: "partial", note: "Basic profitability reports" }, "Mobile App": { status: "yes", note: "Mobile-first design" }, "Accountant Access": { status: "yes", note: "Share reports with accountant" }, "1099 Tracking": { status: "yes", note: "Multiple income streams" }, "Data Ownership": { status: "no", note: "Hurdlr-hosted" }, "Open Source": { status: "no", note: "Proprietary" }, "API / Extensibility": { status: "partial", note: "Integrates with Square, Stripe, PayPal" }, "Auto-Categorization Rules": { status: "yes", note: "Learns from user behavior" }, "Tax Filing": { status: "partial", note: "Pro plan includes 1 federal + state filing" }, "Setup Wizard": { status: "yes", note: "Quick onboarding" } }
  },
  {
    id: "akaunting", name: "Akaunting", tagline: "Open-source web accounting with app marketplace", pricing: "Free (self-hosted)", pricingNote: "Cloud hosting available via Elestio. Paid modules in app store.", target: "Small businesses wanting open-source, international", stack: "Laravel, VueJS, Tailwind, MySQL", hosting: "Self-hosted or cloud",
    features: { "Double-Entry Accounting": { status: "yes", note: "Full double-entry" }, "Bank Sync (Plaid)": { status: "no", note: "Manual import or paid module" }, "AI Categorization": { status: "no", note: "Not available" }, "AI Narrative Reports": { status: "no", note: "Not available" }, "Schedule C / Tax Summary": { status: "no", note: "Generic tax rates, not US Schedule C" }, "Quarterly Tax Estimates": { status: "no", note: "Not available" }, "Chart of Accounts": { status: "yes", note: "Fully customizable" }, "Invoicing": { status: "yes", note: "Unlimited, client portal, online payments" }, "Mileage Tracking": { status: "no", note: "Not built-in" }, "Receipt Scanning": { status: "no", note: "Not built-in" }, "Time Tracking": { status: "no", note: "Not built-in" }, "Payroll": { status: "no", note: "Not built-in" }, "Multi-Currency": { status: "yes", note: "Full multi-currency support" }, "Inventory Management": { status: "yes", note: "Built-in inventory tracking" }, "File Import (CSV/PDF)": { status: "yes", note: "CSV import" }, "P&L / Balance Sheet": { status: "yes", note: "P&L, balance sheet, cash flow" }, "Mobile App": { status: "no", note: "Responsive web only" }, "Accountant Access": { status: "yes", note: "Multi-user with roles" }, "1099 Tracking": { status: "no", note: "Not US-specific" }, "Data Ownership": { status: "yes", note: "100% — your server" }, "Open Source": { status: "yes", note: "BSL license, app marketplace" }, "API / Extensibility": { status: "yes", note: "RESTful API, 100+ modules" }, "Auto-Categorization Rules": { status: "no", note: "Manual categorization" }, "Tax Filing": { status: "no", note: "Not available" }, "Setup Wizard": { status: "yes", note: "Company setup flow" } }
  }
];

const featureCategories: Record<string, string[]> = {
  "Core Accounting": ["Double-Entry Accounting", "Chart of Accounts", "P&L / Balance Sheet", "Auto-Categorization Rules"],
  "Banking & Import": ["Bank Sync (Plaid)", "File Import (CSV/PDF)", "Receipt Scanning"],
  "Tax & Compliance": ["Schedule C / Tax Summary", "Quarterly Tax Estimates", "Tax Filing", "1099 Tracking"],
  "AI Features": ["AI Categorization", "AI Narrative Reports"],
  "Business Operations": ["Invoicing", "Mileage Tracking", "Time Tracking", "Payroll", "Inventory Management", "Multi-Currency"],
  "Platform & Access": ["Mobile App", "Accountant Access", "Setup Wizard", "Data Ownership", "Open Source", "API / Extensibility"],
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "yes") return <span style={{ color: "#16a34a", fontSize: 16, fontWeight: 700 }}>●</span>;
  if (status === "partial") return <span style={{ color: "#ca8a04", fontSize: 16, fontWeight: 700 }}>◐</span>;
  return <span style={{ color: "#d4d4d8", fontSize: 16 }}>○</span>;
};

function countFeatures(comp: typeof competitors[0]) {
  const f = comp.features;
  let yes = 0, partial = 0, no = 0;
  Object.values(f).forEach(v => { if (v.status === "yes") yes++; else if (v.status === "partial") partial++; else no++; });
  return { yes, partial, no, score: yes + partial * 0.5 };
}

export default function CompetitiveAnalysis() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");
  const [showOnlyGaps, setShowOnlyGaps] = useState(false);
  const allFeatures = Object.values(featureCategories).flat();

  const sortedCompetitors = useMemo(() => {
    let sorted = [...competitors];
    if (sortBy === "score") sorted.sort((a, b) => countFeatures(b).score - countFeatures(a).score);
    if (sortBy === "price") sorted.sort((a, b) => {
      const pa = a.pricing.includes("Free") ? 0 : parseInt(a.pricing.replace(/[^0-9]/g, '')) || 999;
      const pb = b.pricing.includes("Free") ? 0 : parseInt(b.pricing.replace(/[^0-9]/g, '')) || 999;
      return pa - pb;
    });
    return sorted;
  }, [sortBy]);

  const gaps = useMemo(() => {
    const ls = competitors.find(c => c.id === "ledger-starter")!;
    return allFeatures.filter(f => {
      const ourStatus = ls.features[f as keyof typeof ls.features]?.status;
      if (ourStatus === "yes") return false;
      return competitors.filter(c => !c.isOurs && c.features[f as keyof typeof c.features]?.status === "yes").length >= 2;
    }).map(f => {
      const othersWithIt = competitors.filter(c => !c.isOurs && c.features[f as keyof typeof c.features]?.status === "yes").map(c => c.name);
      return { feature: f, ourStatus: ls.features[f as keyof typeof ls.features]?.status || "no", competitorsWithIt: othersWithIt };
    });
  }, []);

  const prioritizedGaps = useMemo(() => {
    const priority: Record<string, { impact: number; effort: number; reason: string }> = {
      "Invoicing": { impact: 9, effort: 7, reason: "Table-stakes for any accounting tool. Every paid competitor has it." },
      "Mileage Tracking": { impact: 7, effort: 5, reason: "Key deduction driver for freelancers. QBS, FreshBooks, and Hurdlr all have it." },
      "Receipt Scanning": { impact: 6, effort: 6, reason: "4 of 6 competitors offer it. Could start with manual upload, add OCR later." },
      "Mobile App": { impact: 7, effort: 9, reason: "4 of 6 competitors have native apps. Responsive web covers most cases." },
      "Tax Filing": { impact: 8, effort: 9, reason: "3 competitors file directly. Very complex (IRS e-file). Better to export + recommend TurboTax." },
      "1099 Tracking": { impact: 6, effort: 4, reason: "Track contractor payments, generate 1099 summary. Moderate effort, high value." },
      "Time Tracking": { impact: 4, effort: 3, reason: "Only FreshBooks has this built-in. Low priority unless targeting agencies." },
      "Accountant Access": { impact: 5, effort: 4, reason: "Read-only role for CPA. Wave and Akaunting offer this free." },
    };
    return gaps.map(g => ({ ...g, ...(priority[g.feature] || { impact: 3, effort: 3, reason: "Lower priority for current target user." }) })).sort((a, b) => (b.impact - b.effort) - (a.impact - a.effort));
  }, [gaps]);

  const differentiators = [
    { title: "100% Data Ownership", desc: "Only Ledger Starter and Akaunting let you own your financial data.", vs: "vs. QBS, Wave, Keeper, FreshBooks, Hurdlr" },
    { title: "AI-Powered Narratives", desc: "No competitor generates plain-English explanations of your P&L. Unique to Ledger Starter.", vs: "vs. everyone" },
    { title: "US Tax Built-In (All 50 States)", desc: "Schedule C, SE tax, federal + state calculations, quarterly estimates — all computed locally.", vs: "vs. Wave, FreshBooks, Akaunting (no tax)" },
    { title: "Open Source + Forkable", desc: "Clone, customize, extend. Modern JS (Next.js) with no paywalls.", vs: "vs. Akaunting (BSL license, paid modules)" },
    { title: "One-Click Deploy", desc: "Vercel deploy button with Supabase auto-provisioning. Zero DevOps.", vs: "vs. Akaunting (manual deploy)" },
    { title: "AI Advisory Model", desc: "Claude suggests, human approves. No auto-applying.", vs: "vs. Keeper, QBS (auto-apply)" },
  ];

  const tabs = [{ id: "matrix", label: "Feature Matrix" }, { id: "gaps", label: "Gap Analysis" }, { id: "strengths", label: "Where We Win" }, { id: "roadmap", label: "Roadmap Input" }];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", padding: "28px 16px", color: "#18181b" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#0ea5e9", marginBottom: 4 }}>Competitive Intelligence</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.2, color: "#09090b" }}>Ledger Starter vs. The Market</h1>
        <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>Feature comparison across 7 small-business accounting tools — with gap analysis and roadmap recommendations</p>
      </div>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "2px solid #e4e4e7" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500, color: activeTab === t.id ? "#0ea5e9" : "#71717a", background: "none", border: "none", borderBottom: activeTab === t.id ? "2px solid #0ea5e9" : "2px solid transparent", cursor: "pointer", marginBottom: -2 }}>{t.label}</button>
        ))}
      </div>

      {activeTab === "matrix" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: "#71717a" }}>Sort:</div>
            {([["default","Default"],["score","Feature Count"],["price","Price"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setSortBy(v)} style={{ padding: "4px 12px", fontSize: 11, borderRadius: 20, border: sortBy === v ? "1px solid #0ea5e9" : "1px solid #d4d4d8", background: sortBy === v ? "#e0f2fe" : "#fff", color: sortBy === v ? "#0369a1" : "#52525b", cursor: "pointer", fontWeight: 600 }}>{l}</button>
            ))}
            <label style={{ fontSize: 11, color: "#71717a", display: "flex", alignItems: "center", gap: 4, marginLeft: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showOnlyGaps} onChange={e => setShowOnlyGaps(e.target.checked)} style={{ accentColor: "#0ea5e9" }} />
              Show only our gaps
            </label>
          </div>
          <div style={{ overflowX: "auto" }}>
            {Object.entries(featureCategories).map(([cat, features]) => {
              const filtered = showOnlyGaps ? features.filter(f => competitors.find(c => c.isOurs)?.features[f as keyof typeof competitors[0]["features"]]?.status !== "yes") : features;
              if (filtered.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0ea5e9", padding: "6px 0", borderBottom: "1px solid #e4e4e7", marginBottom: 4 }}>{cat}</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 600, color: "#52525b", width: 180, fontSize: 11 }}>Feature</th>
                      {sortedCompetitors.map(c => <th key={c.id} style={{ textAlign: "center", padding: "6px 4px", fontWeight: c.isOurs ? 800 : 600, color: c.isOurs ? "#0ea5e9" : "#52525b", fontSize: 11, minWidth: 90, background: c.isOurs ? "#f0f9ff" : "transparent" }}>{c.name.replace("QuickBooks Solopreneur", "QB Solo")}</th>)}
                    </tr></thead>
                    <tbody>
                      {filtered.map(f => (
                        <tr key={f} style={{ borderBottom: "1px solid #f4f4f5" }}>
                          <td style={{ padding: "5px 8px", color: "#3f3f46", fontSize: 12 }}>{f}</td>
                          {sortedCompetitors.map(c => {
                            const feat = c.features[f as keyof typeof c.features];
                            const key = `${c.id}-${f}`;
                            return (
                              <td key={c.id} style={{ textAlign: "center", padding: "5px 4px", cursor: "pointer", background: c.isOurs ? "#f0f9ff" : hoveredCell === key ? "#fafafa" : "transparent", position: "relative" }} onMouseEnter={() => setHoveredCell(key)} onMouseLeave={() => setHoveredCell(null)}>
                                <StatusIcon status={feat?.status || "no"} />
                                {hoveredCell === key && feat?.note && <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "#18181b", color: "#fafafa", padding: "6px 10px", borderRadius: 6, fontSize: 11, zIndex: 10, maxWidth: 220, whiteSpace: "normal", lineHeight: 1.4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{feat.note}</div>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: "#71717a" }}>
            <span><span style={{ color: "#16a34a" }}>●</span> Yes</span>
            <span><span style={{ color: "#ca8a04" }}>◐</span> Partial</span>
            <span><span style={{ color: "#d4d4d8" }}>○</span> No</span>
            <span style={{ marginLeft: 8 }}>Hover cells for details</span>
          </div>
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            {sortedCompetitors.map(c => { const { score } = countFeatures(c); return (
              <div key={c.id} style={{ padding: "10px 12px", borderRadius: 8, border: c.isOurs ? "2px solid #0ea5e9" : "1px solid #e4e4e7", background: c.isOurs ? "#f0f9ff" : "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.isOurs ? "#0ea5e9" : "#3f3f46", marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#09090b" }}>{score.toFixed(1)}<span style={{ fontSize: 11, color: "#a1a1aa", fontWeight: 500 }}>/{allFeatures.length}</span></div>
                <div style={{ fontSize: 10, color: "#71717a" }}>{c.pricing}</div>
              </div>
            ); })}
          </div>
        </div>
      )}

      {activeTab === "gaps" && (
        <div>
          <p style={{ fontSize: 13, color: "#52525b", marginBottom: 16, lineHeight: 1.6 }}>Features where Ledger Starter is missing or partial, but 2+ competitors have it. Sorted by best ROI.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prioritizedGaps.map((g, i) => (
              <div key={g.feature} style={{ border: "1px solid #e4e4e7", borderRadius: 10, padding: "14px 16px", background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div><span style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", marginRight: 8 }}>#{i + 1}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{g.feature}</span><span style={{ marginLeft: 8 }}><StatusIcon status={g.ourStatus} /></span></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: g.impact >= 7 ? "#dcfce7" : g.impact >= 5 ? "#fef9c3" : "#f4f4f5", color: g.impact >= 7 ? "#166534" : g.impact >= 5 ? "#854d0e" : "#52525b", fontWeight: 600 }}>Impact: {g.impact}/10</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: g.effort >= 7 ? "#fee2e2" : g.effort >= 5 ? "#fef9c3" : "#dcfce7", color: g.effort >= 7 ? "#991b1b" : g.effort >= 5 ? "#854d0e" : "#166534", fontWeight: 600 }}>Effort: {g.effort}/10</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "#52525b", margin: "0 0 6px", lineHeight: 1.5 }}>{g.reason}</p>
                <div style={{ fontSize: 11, color: "#a1a1aa" }}>Competitors with this: {g.competitorsWithIt.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "strengths" && (
        <div>
          <p style={{ fontSize: 13, color: "#52525b", marginBottom: 16, lineHeight: 1.6 }}>Where Ledger Starter has a genuine competitive advantage.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {differentiators.map((d, i) => (
              <div key={i} style={{ border: "1px solid #e4e4e7", borderRadius: 10, padding: 16, background: "#fff" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#09090b", marginBottom: 6 }}>{d.title}</div>
                <p style={{ fontSize: 12, color: "#52525b", margin: "0 0 8px", lineHeight: 1.5 }}>{d.desc}</p>
                <div style={{ fontSize: 10, color: "#0ea5e9", fontWeight: 600 }}>{d.vs}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 6 }}>The Positioning Story</div>
            <p style={{ fontSize: 13, color: "#15803d", margin: 0, lineHeight: 1.6 }}>Ledger Starter is the only open-source, self-hosted accounting tool with US tax intelligence (Schedule C, all 50 states) AND AI-powered financial narratives. It combines the data ownership of Akaunting with the tax smarts of QuickBooks Solopreneur — at zero recurring cost.</p>
          </div>
        </div>
      )}

      {activeTab === "roadmap" && (
        <div>
          <p style={{ fontSize: 13, color: "#52525b", marginBottom: 16, lineHeight: 1.6 }}>Recommended feature priorities based on competitive gap analysis.</p>
          {[
            { phase: "Phase 1 — Table Stakes", color: "#dc2626", items: [
              { feature: "Invoicing", why: "Every competitor has it. Start with basic: create, send, mark paid." },
              { feature: "1099 Contractor Tracking", why: "Low effort, high value. Track payments to contractors, generate 1099 summary." },
              { feature: "Accountant Access", why: "Read-only role so CPA can review books. Simple Supabase role addition." },
            ]},
            { phase: "Phase 2 — Differentiation", color: "#0ea5e9", items: [
              { feature: "Receipt Upload + OCR", why: "Start with manual photo upload. Add OCR later via Claude vision API." },
              { feature: "Mileage Tracking (Manual)", why: "Manual trip logging, IRS standard rate calculation. GPS requires native app." },
              { feature: "Multi-Provider AI", why: "Abstract AI layer — Anthropic, OpenAI, or Google. Widens accessibility." },
            ]},
            { phase: "Phase 3 — Growth", color: "#7c3aed", items: [
              { feature: "Tax Filing Export", why: "Generate TurboTax-compatible export or Schedule C PDF. Partner, don't compete." },
              { feature: "Module System", why: "Feature flags in user_settings. Activate features per-instance without code changes." },
              { feature: "Mobile PWA", why: "Progressive Web App before native. Receipt capture, quick entry, dashboard." },
            ]},
          ].map(phase => (
            <div key={phase.phase} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: phase.color, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: phase.color }} />{phase.phase}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {phase.items.map(item => (
                  <div key={item.feature} style={{ border: "1px solid #e4e4e7", borderRadius: 8, padding: "12px 16px", background: "#fff", borderLeft: `3px solid ${phase.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.feature}</div>
                    <p style={{ fontSize: 12, color: "#52525b", margin: 0, lineHeight: 1.5 }}>{item.why}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20, padding: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>Key Insight</div>
            <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.6 }}>Invoicing is the single biggest gap. It is table-stakes for every competitor, and it blocks the multi-business demo concept. Prioritize a basic invoicing module before anything else.</p>
          </div>
        </div>
      )}
    </div>
  );
}
