import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionsState } from './transactions.reducer';

export const selectTransactionsState = createFeatureSelector<TransactionsState>('transactions');

export const selectAllTransactions = createSelector(
  selectTransactionsState,
  (state) => state.items
);

export const selectTransactionsSummary = createSelector(
  selectTransactionsState,
  (state) => state.summary
);

export const selectTransactionsLoading = createSelector(
  selectTransactionsState,
  (state) => state.loading
);

export const selectTransactionsSubmitting = createSelector(
  selectTransactionsState,
  (state) => state.submitting
);

export const selectDeletingTransactionId = createSelector(
  selectTransactionsState,
  (state) => state.deletingTransactionId
);

export const selectTransactionsError = createSelector(
  selectTransactionsState,
  (state) => state.error
);
