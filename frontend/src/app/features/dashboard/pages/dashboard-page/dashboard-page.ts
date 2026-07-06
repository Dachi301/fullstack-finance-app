import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';

import {
  CreateTransactionRequest,
  Transaction,
  TransactionType,
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
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly transactionForm = this.formBuilder.nonNullable.group({
    description: [
      '',
      [Validators.required, Validators.maxLength(120)],
    ],
    amount: [
      0,
      [Validators.required, Validators.min(0.01)],
    ],
    type: [
      'expense' as TransactionType,
      Validators.required,
    ],
    transactionDate: [
      new Date().toISOString().slice(0, 10),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.transactionsApi
      .findAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (transactions) => {
          this.transactions.set(transactions);
        },
        error: () => {
          this.errorMessage.set(
            'Transactions could not be loaded.',
          );
        },
      });
  }

  submit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const formValue = this.transactionForm.getRawValue();

    const request: CreateTransactionRequest = {
      description: formValue.description.trim(),
      amountMinor: Math.round(formValue.amount * 100),
      type: formValue.type,
      transactionDate: formValue.transactionDate,
    };

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

          this.transactionForm.reset({
            description: '',
            amount: 0,
            type: 'expense',
            transactionDate: new Date()
              .toISOString()
              .slice(0, 10),
          });
        },
        error: () => {
          this.errorMessage.set(
            'Transaction could not be created.',
          );
        },
      });
  }
}