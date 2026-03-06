import { getAllRules, getLedgerAccounts } from "@/lib/db/queries";
import { RulesTable } from "./rules-table";

export default async function RulesPage() {
  const [rules, accounts] = await Promise.all([
    getAllRules(),
    getLedgerAccounts(),
  ]);

  return <RulesTable initialRules={rules} accounts={accounts} />;
}
