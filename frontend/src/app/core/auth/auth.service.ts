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

  readonly isAuthenticated = signal<boolean>(this.hasToken());

  login(credentials: { email: string; password: string; remember?: boolean }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setTokenCookie(response.accessToken, !!credentials.remember);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        this.setTokenCookie(response.accessToken, false);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    this.removeTokenCookie();
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.getTokenCookie();
  }

  private hasToken(): boolean {
    return !!this.getTokenCookie();
  }

  private setTokenCookie(token: string, remember: boolean) {
    if (typeof document === 'undefined') return;
    
    let expires = '';
    if (remember) {
      const date = new Date();
      // 30 days expiration
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    
    document.cookie = `access_token=${token}${expires}; path=/; SameSite=Strict`;
  }

  private getTokenCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const name = 'access_token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  private removeTokenCookie() {
    if (typeof document === 'undefined') return;
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
