import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { LoginResponse, Role } from './models';

const STORAGE_KEY = 'asset-mgmt-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<LoginResponse | null>(this.restore());

  get token(): string | null {
    return this.user()?.token ?? null;
  }

  hasRole(...roles: Role[]): boolean {
    const u = this.user();
    return !!u && roles.includes(u.role);
  }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
        this.user.set(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private restore(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
