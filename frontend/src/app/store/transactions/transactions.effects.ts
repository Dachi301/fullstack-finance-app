import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, forkJoin, map, mergeMap, of } from 'rxjs';
import { TransactionActions } from './transactions.actions';
import { TransactionsApiService } from '../../features/transactions/services/transactions-api.service';

@Injectable()
export class TransactionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TransactionsApiService);

  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.loadDashboard),
      mergeMap(() =>
        forkJoin({
          transactions: this.api.findAll(),
          summary: this.api.getSummary()
        }).pipe(
          map(({ transactions, summary }) => TransactionActions.loadDashboardSuccess({ transactions, summary })),
          catchError(error => of(TransactionActions.loadDashboardFailure({ error: 'Dashboard data could not be loaded.' })))
        )
      )
    )
  );

  loadSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.loadSummary),
      mergeMap(() =>
        this.api.getSummary().pipe(
          map((summary) => TransactionActions.loadSummarySuccess({ summary })),
          catchError(error => of(TransactionActions.loadSummaryFailure({ error: 'Summary could not be loaded.' })))
        )
      )
    )
  );

  createTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.createTransaction),
      mergeMap(({ request }) =>
        this.api.create(request).pipe(
          map((transaction) => TransactionActions.createTransactionSuccess({ transaction })),
          catchError(error => of(TransactionActions.createTransactionFailure({ error: 'Transaction could not be created.' })))
        )
      )
    )
  );

  updateTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.updateTransaction),
      mergeMap(({ id, request }) =>
        this.api.update(id, request).pipe(
          map((transaction) => TransactionActions.updateTransactionSuccess({ transaction })),
          catchError(error => of(TransactionActions.updateTransactionFailure({ error: 'Transaction could not be updated.' })))
        )
      )
    )
  );

  deleteTransaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TransactionActions.deleteTransaction),
      mergeMap(({ id }) =>
        this.api.remove(id).pipe(
          map(() => TransactionActions.deleteTransactionSuccess({ id })),
          catchError(error => of(TransactionActions.deleteTransactionFailure({ error: 'Transaction could not be deleted.' })))
        )
      )
    )
  );

  // When a transaction is created, updated, or deleted successfully, reload the summary
  refreshSummaryAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TransactionActions.createTransactionSuccess,
        TransactionActions.updateTransactionSuccess,
        TransactionActions.deleteTransactionSuccess
      ),
      map(() => TransactionActions.loadSummary())
    )
  );
}
