import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import {
  CreateTransactionRequest,
  Transaction,
  TransactionsSummary,
  TransactionType,
  UpdateTransactionRequest,
} from '../../../transactions/models/transactions';
import { TransactionsApiService } from '../../../transactions/services/transactions-api.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly transactionsApi = inject(TransactionsApiService);
  private readonly formBuilder = inject(FormBuilder);

  readonly transactions = signal<Transaction[]>([]);
  readonly summary = signal<TransactionsSummary | null>(null);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly deletingTransactionId = signal<string | null>(null);
  readonly editingTransactionId = signal<string | null>(null);
  readonly errorMessage = signal('');

  readonly transactionForm = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TransactionType, Validators.required],
    transactionDate: [
      new Date().toISOString().slice(0, 10),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      transactions: this.transactionsApi.findAll(),
      summary: this.transactionsApi.getSummary(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ transactions, summary }) => {
          this.transactions.set(transactions);
          this.summary.set(summary);
        },
        error: () => {
          this.errorMessage.set('Dashboard data could not be loaded.');
        },
      });
  }

  submit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    if (this.editingTransactionId()) {
      this.updateTransaction();
      return;
    }

    this.createTransaction();
  }

  startEdit(transaction: Transaction): void {
    this.editingTransactionId.set(transaction.id);
    this.errorMessage.set('');

    this.transactionForm.setValue({
      description: transaction.description,
      amount: transaction.amountMinor / 100,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
    });
  }

  cancelEdit(): void {
    this.editingTransactionId.set(null);
    this.resetForm();
  }

  deleteTransaction(transactionId: string): void {
    this.deletingTransactionId.set(transactionId);
    this.errorMessage.set('');

    this.transactionsApi
      .remove(transactionId)
      .pipe(finalize(() => this.deletingTransactionId.set(null)))
      .subscribe({
        next: () => {
          this.transactions.update((transactions) =>
            transactions.filter(
              (transaction) => transaction.id !== transactionId,
            ),
          );

          this.loadSummary();
        },
        error: () => {
          this.errorMessage.set('Transaction could not be deleted.');
        },
      });
  }

  private createTransaction(): void {
    const request = this.buildCreateRequest();

    this.submitting.set(true);
    this.errorMessage.set('');

    this.transactionsApi
      .create(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (createdTransaction) => {
          this.transactions.update((transactions) => [
            createdTransaction,
            ...transactions,
          ]);

          this.resetForm();
          this.loadSummary();
        },
        error: () => {
          this.errorMessage.set('Transaction could not be created.');
        },
      });
  }

  private updateTransaction(): void {
    const transactionId = this.editingTransactionId();

    if (!transactionId) {
      return;
    }

    const request = this.buildUpdateRequest();

    this.submitting.set(true);
    this.errorMessage.set('');

    this.transactionsApi
      .update(transactionId, request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (updatedTransaction) => {
          this.transactions.update((transactions) =>
            transactions.map((transaction) =>
              transaction.id === updatedTransaction.id
                ? updatedTransaction
                : transaction,
            ),
          );

          this.editingTransactionId.set(null);
          this.resetForm();
          this.loadSummary();
        },
        error: () => {
          this.errorMessage.set('Transaction could not be updated.');
        },
      });
  }

  private loadSummary(): void {
    this.transactionsApi.getSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: () => {
        this.errorMessage.set('Summary could not be refreshed.');
      },
    });
  }

  private buildCreateRequest(): CreateTransactionRequest {
    const formValue = this.transactionForm.getRawValue();

    return {
      description: formValue.description.trim(),
      amountMinor: Math.round(formValue.amount * 100),
      type: formValue.type,
      transactionDate: formValue.transactionDate,
    };
  }

  private buildUpdateRequest(): UpdateTransactionRequest {
    const formValue = this.transactionForm.getRawValue();

    return {
      description: formValue.description.trim(),
      amountMinor: Math.round(formValue.amount * 100),
      type: formValue.type,
      transactionDate: formValue.transactionDate,
    };
  }

  private resetForm(): void {
    this.transactionForm.reset({
      description: '',
      amount: 0,
      type: 'expense',
      transactionDate: new Date().toISOString().slice(0, 10),
    });
  }
}