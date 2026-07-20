import { createReducer, on } from '@ngrx/store';
import { TransactionActions } from './transactions.actions';
import { Transaction, TransactionsSummary } from '../../features/transactions/models/transactions';

export interface TransactionsState {
  items: Transaction[];
  summary: TransactionsSummary | null;
  loading: boolean;
  submitting: boolean;
  deletingTransactionId: string | null;
  error: string | null;
}

export const initialState: TransactionsState = {
  items: [],
  summary: null,
  loading: false,
  submitting: false,
  deletingTransactionId: null,
  error: null
};

export const transactionsReducer = createReducer(
  initialState,
  
  // Load Dashboard
  on(TransactionActions.loadDashboard, (state) => ({ 
    ...state, loading: true, error: null 
  })),
  on(TransactionActions.loadDashboardSuccess, (state, { transactions, summary }) => ({
    ...state, loading: false, items: transactions, summary
  })),
  on(TransactionActions.loadDashboardFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Load Summary
  on(TransactionActions.loadSummarySuccess, (state, { summary }) => ({
    ...state, summary
  })),

  // Create
  on(TransactionActions.createTransaction, (state) => ({
    ...state, submitting: true, error: null
  })),
  on(TransactionActions.createTransactionSuccess, (state, { transaction }) => ({
    ...state, submitting: false, items: [transaction, ...state.items]
  })),
  on(TransactionActions.createTransactionFailure, (state, { error }) => ({
    ...state, submitting: false, error
  })),

  // Update
  on(TransactionActions.updateTransaction, (state) => ({
    ...state, submitting: true, error: null
  })),
  on(TransactionActions.updateTransactionSuccess, (state, { transaction }) => ({
    ...state, 
    submitting: false, 
    items: state.items.map(t => t.id === transaction.id ? transaction : t)
  })),
  on(TransactionActions.updateTransactionFailure, (state, { error }) => ({
    ...state, submitting: false, error
  })),

  // Delete
  on(TransactionActions.deleteTransaction, (state, { id }) => ({
    ...state, deletingTransactionId: id, error: null
  })),
  on(TransactionActions.deleteTransactionSuccess, (state, { id }) => ({
    ...state,
    deletingTransactionId: null,
    items: state.items.filter(t => t.id !== id)
  })),
  on(TransactionActions.deleteTransactionFailure, (state, { error }) => ({
    ...state, deletingTransactionId: null, error
  }))
);
