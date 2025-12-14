import { FinanceItem } from "./finance-item";
import { AccountResp } from "./account";


export interface ExpenditureReqDTO {
  expenditureDate: string;
  amount: number;
  financeItemId: number;
  reconciled: boolean;
  accountId: number;
  note: string;
}

export interface ExpenditureDTO {
  id: number;
  expenditureDate: string;
  amount: number;
  financeItem: FinanceItem;
  reconciled: boolean;
  account: AccountResp;
  note: string;
}





