import Link from "next/link";
import {
  BookOpen,
  Landmark,
  Calculator,
  Sparkles,
  Rocket,
  ArrowRight,
} from "lucide-react";

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md";

const features = [
  {
    icon: BookOpen,
    title: "Double-Entry Accounting",
    description:
      "Balanced debits and credits, chart of accounts, full audit trail. Every transaction is correct by construction.",
  },
  {
    icon: Landmark,
    title: "Bank Sync",
    description:
      "Connect your bank accounts via Plaid, or import CSV/PDF statements from AmEx, Citi, and Truist.",
  },
  {
    icon: Calculator,
    title: "Tax Ready",
    description:
      "Schedule C summary, state tax estimates, quarterly payment tracking, and CPA export — all from your data.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description:
      "Claude suggests account categories and writes plain-English financial summaries. You always approve.",
  },
];

const steps = [
  {
    num: "1",
    title: "Deploy",
    description: "One-click Vercel deploy with Supabase auto-provisioned. No infrastructure to manage.",
  },
  {
    num: "2",
    title: "Configure",
    description: "Setup wizard for your entity type, state, filing method, and tax year.",
  },
  {
    num: "3",
    title: "Start Tracking",
    description: "Connect your bank via Plaid or import statements. AI helps categorize everything.",
  },
];

const techStack = [
  "Next.js 15",
  "Supabase",
  "Drizzle ORM",
  "Plaid",
  "Claude AI",
  "Tailwind CSS",
  "shadcn/ui",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ledger Starter
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Open-source accounting &amp; tax tool for US small businesses.
          Double-entry ledger, bank sync, Schedule C support, AI categorization.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try the Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            <Rocket className="h-4 w-4" />
            Deploy Your Own
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-6 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                {s.num}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
          Built With
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {techStack.map((t) => (
            <span
              key={t}
              className="rounded-full border px-4 py-1.5 text-sm"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-4xl px-6 py-12 text-center border-t">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://github.com/gstreet-ops/ledger-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <span>MIT License</span>
          <Link href="/login" className="hover:text-foreground">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
