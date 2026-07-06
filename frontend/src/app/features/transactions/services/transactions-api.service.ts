import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTransactionRequest,
  Transaction,
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

  create(
    transaction: CreateTransactionRequest,
  ): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }
}