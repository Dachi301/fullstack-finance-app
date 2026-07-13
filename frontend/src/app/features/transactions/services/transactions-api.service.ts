import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTransactionRequest,
  Transaction,
  TransactionsSummary,
  UpdateTransactionRequest,
} from '../models/transactions';

@Injectable({
  providedIn: 'root',
})
export class TransactionsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/transactions';

  findAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  findOne(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  getSummary(): Observable<TransactionsSummary> {
    return this.http.get<TransactionsSummary>(`${this.apiUrl}/summary`);
  }

  create(transaction: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  update(id: string,transaction: UpdateTransactionRequest): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}