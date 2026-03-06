import { fetchTaxData } from "./actions";
import { TaxView } from "./tax-view";

export default async function TaxPage() {
  const year = new Date().getFullYear();
  const data = await fetchTaxData(year);

  return <TaxView initialData={data} initialYear={year} />;
}
