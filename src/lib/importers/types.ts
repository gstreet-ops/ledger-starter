export type ParsedRow = {
  rawData: Record<string, unknown>;
  parsedDate: Date;
  parsedDescription: string;
  parsedAmount: string; // numeric string, positive = expense/outflow, negative = income/inflow
  parsedCategory: string | null;
  externalId: string;
  section: string | null;
};

export type BatchMeta = {
  source: "amex" | "citi" | "truist";
  fileName: string;
  fileType: string;
  accountLast4: string | null;
  statementPeriodStart: Date | null;
  statementPeriodEnd: Date | null;
};

export type ParseResult = {
  batch: BatchMeta;
  rows: ParsedRow[];
};
