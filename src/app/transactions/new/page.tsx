import { getLedgerAccounts } from "@/lib/db/queries";
import { TransactionForm } from "./transaction-form";

export default async function NewTransactionPage() {
  const accounts = await getLedgerAccounts();
  return <TransactionForm accounts={accounts} />;
}
