export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amountMinor: number;
  type: TransactionType;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  description: string;
  amountMinor: number;
  type: TransactionType;
  transactionDate: string;
}