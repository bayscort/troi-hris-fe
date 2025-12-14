import { FinanceItem } from "./finance-item";

export interface FundRequestItemCreate {
  id?: number;
  financeItemId: number;
  description: string;
  amount: number;
  bankAccountNumber: string;
}

export interface FundRequestItem {
  id?: number;
  financeItem: FinanceItem;
  description: string;
  amount: number;
  bankAccountNumber: string;
}

export interface FundRequestApprovalLog {
  id?: number;
  approvalStage: string;
  stageTimestamp: string;
  notes: string;
  createdBy: string;
}

export interface FundRequest {
  id?: number;
  fundRequestCode: string;
  date: string;
  totalAmount: number;
  totalAmountInWords: string;
  fundRequestApprovalLogList: FundRequestApprovalLog[];
  fundRequestItemList: FundRequestItem[];
}

export interface FundRequestCreate {
  id?: number;
  fundRequestCode: string;
  date: string;
  totalAmount: number;
  totalAmountInWords: string;
  fundRequestApprovalLogList: FundRequestApprovalLog[];
  fundRequestItemList: FundRequestItemCreate[];
}

export interface ApprovalLogPayload {
  approvalStage: string;
  stageTimestamp: string | null;
  notes: string;
  fundRequestId: number | undefined;
};
