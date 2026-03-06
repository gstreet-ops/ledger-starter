import { getAccountBalances } from "@/lib/db/queries";
import { AccountsTable } from "./accounts-table";
import { parseMoney } from "@/lib/utils/money";

function computeBalance(
  type: string,
  totalDebit: string,
  totalCredit: string
): string {
  const debit = parseMoney(totalDebit);
  const credit = parseMoney(totalCredit);
  if (type === "asset" || type === "expense") {
    return (debit - credit).toFixed(2);
  }
  return (credit - debit).toFixed(2);
}

export default async function AccountsPage() {
  const raw = await getAccountBalances();

  const accounts = raw.map((a) => ({
    ...a,
    type: a.type as "asset" | "liability" | "equity" | "income" | "expense",
    balance: computeBalance(a.type, a.totalDebit, a.totalCredit),
  }));

  return <AccountsTable accounts={accounts} />;
}
