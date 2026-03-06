export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const faqEntries: FaqEntry[] = [
  // --- Importing Data ---
  {
    id: "import-how",
    category: "Importing Data",
    question: "How do I import bank statements?",
    answer:
      "Go to the **Imports** page from the sidebar. Click **Upload Statement** or drag and drop. Supported formats:\n\n- AmEx (`.xlsx`, `.csv`)\n- Citi (`.pdf` monthly statements)\n- Truist (`.pdf` monthly statements)\n\nThe system auto-detects which bank based on the filename. After upload, you'll see parsed transactions saved to the import rows table.",
    keywords: ["upload", "csv", "xlsx", "pdf", "bank", "statement", "amex", "citi", "truist"],
  },
  {
    id: "import-naming",
    category: "Importing Data",
    question: "What file naming convention should I use?",
    answer:
      "The parser detects the bank from the filename prefix. Use the original filenames from your bank downloads:\n\n- `AmEx_...` for American Express\n- `Citi_...` for Citi statements\n- `Truist_...` for Truist statements\n\nFiles are in Google Drive at **Finance > Taxes > 2025 > Deductions**.",
    keywords: ["filename", "naming", "format", "convention"],
  },
  {
    id: "import-duplicates",
    category: "Importing Data",
    question: "How do I avoid importing duplicates?",
    answer:
      "Each imported row gets a unique `external_id` (from the bank's reference number or a generated hash). If you re-upload the same file, duplicates are automatically skipped. The batch list shows row counts so you can verify.",
    keywords: ["duplicate", "dedup", "re-import", "twice"],
  },
  {
    id: "import-pdf-error",
    category: "Importing Data",
    question: "What if a PDF doesn't parse correctly?",
    answer:
      "PDF parsing can be tricky with multi-line descriptions (especially flight bookings on Citi). Check the import rows view for any rows with missing data. You can skip bad rows and manually enter those transactions. File an issue on GitHub if a whole statement fails.",
    keywords: ["parse error", "pdf", "broken", "missing", "failed"],
  },

  // --- Transactions ---
  {
    id: "txn-manual",
    category: "Transactions",
    question: "How do I manually enter a transaction?",
    answer:
      "Go to **New Transaction** from the sidebar. Enter the date, description, and add line items with debit/credit amounts. The system enforces double-entry: total debits must equal total credits before you can save.",
    keywords: ["manual", "entry", "add", "create", "new transaction"],
  },
  {
    id: "txn-void",
    category: "Transactions",
    question: "How do I void a transaction?",
    answer:
      "In the **Journal** view, expand a transaction and click **Void**. This creates a reversing entry rather than deleting — keeping your audit trail intact.",
    keywords: ["void", "delete", "reverse", "undo", "cancel"],
  },
  {
    id: "txn-review-vs-journal",
    category: "Transactions",
    question: "What's the difference between the Review and Journal pages?",
    answer:
      "**Review** shows uncategorized/unmatched imported transactions that need your attention. **Journal** shows all posted transactions in the ledger. Think of Review as your inbox and Journal as your permanent record.",
    keywords: ["review", "journal", "difference", "inbox", "posted"],
  },

  // --- Accounts & Categories ---
  {
    id: "acct-coa",
    category: "Accounts & Categories",
    question: "How is the Chart of Accounts organized?",
    answer:
      "Accounts are grouped by type:\n\n- **Assets** (1000s)\n- **Liabilities** (2000s)\n- **Equity** (3000s)\n- **Income** (4000s)\n- **Expenses** (5000s–6000s)\n\nEach expense account maps to a Schedule C line for tax reporting. You can add custom accounts but keep the numbering convention.",
    keywords: ["chart of accounts", "COA", "account types", "numbering"],
  },
  {
    id: "acct-tax-tags",
    category: "Accounts & Categories",
    question: "How do tax tags work?",
    answer:
      "Tax tags map transactions to IRS Schedule C lines and Georgia tax categories. When you categorize a transaction, the tax tag determines where it shows up on your tax return. The **Tax** page shows your current totals by category.",
    keywords: ["tax tags", "schedule c", "irs", "georgia", "categorize"],
  },

  // --- Tax & Reporting ---
  {
    id: "tax-liability",
    category: "Tax & Reporting",
    question: "How do I see my tax liability?",
    answer:
      "The **Dashboard** shows YTD tax estimates. The **Tax** page breaks it down by federal income, self-employment (15.3%), and Georgia state (5.19% flat). **Quarterly Estimates** shows upcoming 1040-ES and GA payment deadlines.",
    keywords: ["tax", "liability", "estimate", "quarterly", "1040", "self-employment", "georgia"],
  },
  {
    id: "tax-export",
    category: "Tax & Reporting",
    question: "How do I export data for filing?",
    answer:
      "Go to **Reports** and generate P&L or Trial Balance for your desired date range. These can be exported. The **Tax** page also has a year-end summary formatted for Schedule C line items.",
    keywords: ["export", "cpa", "accountant", "year-end", "schedule c", "report"],
  },
  {
    id: "tax-georgia",
    category: "Tax & Reporting",
    question: "What's the Georgia tax rate?",
    answer:
      "Georgia uses a **5.19% flat income tax rate** with a **$12,000 standard deduction**. The app calculates this automatically from your net business profit.",
    keywords: ["georgia", "state tax", "5.19", "flat rate", "deduction"],
  },

  // --- Bank Connections (Plaid) ---
  {
    id: "plaid-connect",
    category: "Bank Connections",
    question: "How do I connect a bank account?",
    answer:
      "Go to **Bank Connections** and click **Connect a Bank**. This opens Plaid Link where you log into your bank. Note: Plaid production access is required for real bank connections. If you see sandbox mode, we're still waiting for Plaid approval.",
    keywords: ["plaid", "connect", "bank", "link", "sandbox", "production"],
  },
  {
    id: "plaid-vs-import",
    category: "Bank Connections",
    question: "What's the difference between Plaid sync and file import?",
    answer:
      "**Plaid** pulls transactions automatically from connected banks. **File import** is for manually uploading CSV/PDF statements. Use file import for historical data or banks not supported by Plaid. Both end up in the same ledger.",
    keywords: ["plaid", "sync", "import", "difference", "automatic", "manual"],
  },

  // --- General ---
  {
    id: "general-data",
    category: "General",
    question: "Where is my data stored?",
    answer:
      "All data is stored in **Supabase** (PostgreSQL). The app is hosted on **Vercel**. Your bank credentials are handled by Plaid and never stored in our database — we only store a secure access token.",
    keywords: ["data", "storage", "supabase", "postgres", "security", "plaid"],
  },
  {
    id: "general-multiuser",
    category: "General",
    question: "Is this multi-user?",
    answer:
      "No — this is a single-user personal accounting tool designed for one LLC. Authentication exists to protect your data, not to support multiple users.",
    keywords: ["multi-user", "single user", "sharing", "access"],
  },
  {
    id: "general-purge",
    category: "General",
    question: "How do I purge test/demo data?",
    answer:
      "Run `npm run db:purge-synthetic` from the project root. This clears all transactions and import data while keeping your chart of accounts and tax categories intact.",
    keywords: ["purge", "clear", "reset", "demo", "test", "synthetic", "seed"],
  },
];

const categories = [...new Set(faqEntries.map((e) => e.category))];
export { categories };
