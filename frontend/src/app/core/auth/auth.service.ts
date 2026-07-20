import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export interface AuthResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:3000/auth';

  // In a real app, you might parse the JWT to get user info. 
  // For simplicity, we just store the token presence as boolean.
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  register(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private hasToken(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  private handleAuthSuccess(response: AuthResponse) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('access_token', response.accessToken);
    }
    this.isAuthenticated.set(true);
  }
}
