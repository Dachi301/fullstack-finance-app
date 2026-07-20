import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import {
  CreateTransactionRequest,
  Transaction,
  TransactionType,
  UpdateTransactionRequest,
} from '../../../transactions/models/transactions';
import { TransactionActions } from '../../../../store/transactions/transactions.actions';
import {
  selectAllTransactions,
  selectDeletingTransactionId,
  selectTransactionsError,
  selectTransactionsLoading,
  selectTransactionsSubmitting,
  selectTransactionsSummary,
} from '../../../../store/transactions/transactions.selectors';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly transactions = this.store.selectSignal(selectAllTransactions);
  readonly summary = this.store.selectSignal(selectTransactionsSummary);

  readonly loading = this.store.selectSignal(selectTransactionsLoading);
  readonly submitting = this.store.selectSignal(selectTransactionsSubmitting);
  readonly deletingTransactionId = this.store.selectSignal(selectDeletingTransactionId);
  readonly errorMessage = this.store.selectSignal(selectTransactionsError);

  // Local UI state
  readonly editingTransactionId = signal<string | null>(null);
  readonly transactionToDelete = signal<Transaction | null>(null);

  readonly transactionForm = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TransactionType, Validators.required],
    transactionDate: [
      new Date().toISOString().slice(0, 10),
      Validators.required,
    ],
  });

  readonly editTransactionForm = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required, Validators.maxLength(120)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    type: ['expense' as TransactionType, Validators.required],
    transactionDate: [
      new Date().toISOString().slice(0, 10),
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.store.dispatch(TransactionActions.loadDashboard());
  }

  submit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    const request = this.buildCreateRequest();
    this.store.dispatch(TransactionActions.createTransaction({ request }));
    this.resetForm();
  }

  submitEdit(): void {
    if (this.editTransactionForm.invalid) {
      this.editTransactionForm.markAllAsTouched();
      return;
    }

    const transactionId = this.editingTransactionId();
    if (!transactionId) return;

    const request = this.buildUpdateRequest();
    this.store.dispatch(TransactionActions.updateTransaction({ id: transactionId, request }));
    
    this.editingTransactionId.set(null);
    this.editTransactionForm.reset();
  }

  startEdit(transaction: Transaction): void {
    this.editingTransactionId.set(transaction.id);

    this.editTransactionForm.setValue({
      description: transaction.description,
      amount: transaction.amountMinor / 100,
      type: transaction.type,
      transactionDate: transaction.transactionDate,
    });
  }

  cancelEdit(): void {
    this.editingTransactionId.set(null);
    this.editTransactionForm.reset();
  }

  requestDelete(transaction: Transaction): void {
    this.transactionToDelete.set(transaction);
  }

  cancelDelete(): void {
    this.transactionToDelete.set(null);
  }

  confirmDelete(): void {
    const transaction = this.transactionToDelete();
    if (!transaction) return;

    this.store.dispatch(TransactionActions.deleteTransaction({ id: transaction.id }));
    this.transactionToDelete.set(null);
  }

  logout(): void {
    this.authService.logout();
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
    const formValue = this.editTransactionForm.getRawValue();

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