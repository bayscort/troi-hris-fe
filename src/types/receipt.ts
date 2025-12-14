import { FinanceItem } from "./finance-item";
import {  AccountResp } from "./account";


export interface ReceiptReqDTO {
  receiptDate: string;
  amount: number;
  financeItemId: number;
  reconciled: boolean;
  accountId: number;
  note: string;
}

export interface ReceiptDTO {
  id: number;
  receiptDate: string;
  amount: number;
  financeItem: FinanceItem;
  reconciled: boolean;
  account: AccountResp;
  note: string;
}





