import { BankStatementDTO } from "./bank-statement";

export interface InternalTransactionDTO {
    id?: number;
    type: string;
    date: string;
    description: string;
    amount: number;
}

export interface ManualReconciliationPayload {
  bankStatementId: number;
  receiptId?: number;
  expenditureId?: number;
}

export interface ReconciliationRowDTO {
  id: number;
  date: string;
  status: string;
  bankStatement?: BankStatementDTO;
  internalTransaction?: InternalTransactionDTO;
}