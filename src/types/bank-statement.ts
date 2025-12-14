export interface BankStatementDTO {
  id: number;
  currency: string;
  postDate: string;
  remarks: string;
  additionalDesc: string;
  debitAmount: number;
  creditAmount: number;
  closingBalance: number;
}