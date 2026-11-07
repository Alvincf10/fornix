import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from './auth.models';

const ACCESS_TOKEN_KEY = 'fornix_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(this.readStoredToken());

  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.accessTokenSignal());

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.persistSession(res)), map((res) => res.user));
  }

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, payload, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.persistSession(res)), map((res) => res.user));
  }

  logout(): Observable<unknown> {
    return this.http
      .post(`${environment.apiBaseUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null)),
        tap(() => this.clearSession()),
        tap(() => void this.router.navigateByUrl('/login')),
      );
  }

  refreshAccessToken(): Observable<string> {
    return this.http
      .post<{ accessToken: string }>(
        `${environment.apiBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((res) => {
          this.accessTokenSignal.set(res.accessToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
        }),
        map((res) => res.accessToken),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  loadMe(): Observable<AuthUser | null> {
    if (!this.accessTokenSignal()) {
      return of(null);
    }

    return this.http.get<AuthUser>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap((user) => this.userSignal.set(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  private persistSession(res: AuthResponse) {
    this.userSignal.set(res.user);
    this.accessTokenSignal.set(res.accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
  }

  private clearSession() {
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
}
