import { Estate } from "./location";

export interface Account {
  id?: number | undefined;
  name: string;
  balance: number;
  accountType: string;
  estateId: number | null

}

export interface AccountResp {
  id?: number | undefined;
  name: string;
  balance: number;
  accountType: string;
  estate: Estate
}

export interface TransactionLedgerItemDTO {
  date: string;
  description: string;
  debit: number;
  credit: number;
  note: string;
  runningBalance: number;
}

export interface AccountLedgerDTO {
  accountId?: number | undefined;
  accountName: string;
  openingBalance: number;
  finalBalance: number;
  transactions: TransactionLedgerItemDTO[];

}