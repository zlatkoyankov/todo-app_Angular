import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map, of } from 'rxjs';
import {
  User,
  UserCredentials,
  UserRegistration,
  UserUpdate,
  PasswordChange,
  LoginResponse,
  RegisterResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = '/api';
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';

  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (userData && token) {
      const user: User = JSON.parse(userData);
      this.currentUserSignal.set(user);
    }
  }

  private saveAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  register(registration: UserRegistration): Promise<{ success: boolean; error?: string }> {
    // Validate passwords match
    if (registration.password !== registration.confirmPassword) {
      return Promise.resolve({ success: false, error: 'Passwords do not match' });
    }

    // Validate password strength
    if (registration.password.length < 6) {
      return Promise.resolve({ success: false, error: 'Password must be at least 6 characters' });
    }

    const payload = {
      username: registration.username,
      password: registration.password,
    };

    return new Promise((resolve) => {
      this.http.post<RegisterResponse>(`${this.API_URL}/register`, payload)
        .pipe(
          tap((response) => {
            this.saveAuthData(response.token, response.user);
          }),
          map(() => ({ success: true })),
          catchError((error: HttpErrorResponse) => {
            const errorMessage = error.error?.message || error.error?.error || 'Registration failed';
            return of({ success: false, error: errorMessage });
          })
        )
        .subscribe(resolve);
    });
  }

  login(credentials: UserCredentials): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
        .pipe(
          tap((response) => {
            this.saveAuthData(response.token, response.user);
          }),
          map(() => ({ success: true })),
          catchError((error: HttpErrorResponse) => {
            const errorMessage = error.error?.message || error.error?.error || 'Login failed';
            return of({ success: false, error: errorMessage });
          })
        )
        .subscribe(resolve);
    });
  }

  logout(): Promise<void> {
    return new Promise((resolve) => {
      this.http.post(`${this.API_URL}/logout`, {})
        .pipe(
          catchError(() => of(null))
        )
        .subscribe(() => {
          this.clearAuthData();
          this.router.navigate(['/']);
          resolve();
        });
    });
  }

  getProfile(): Promise<User | null> {
    return new Promise((resolve) => {
      this.http.get<User>(`${this.API_URL}/profile`)
        .pipe(
          tap((user) => {
            this.currentUserSignal.set(user);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }),
          catchError(() => {
            this.clearAuthData();
            return of(null);
          })
        )
        .subscribe(resolve);
    });
  }

  updateAccount(update: UserUpdate): { success: boolean; error?: string } {
    // For now, this is not supported by the backend
    return { success: false, error: 'Account update not supported by backend' };
  }

  changePassword(passwordChange: PasswordChange): { success: boolean; error?: string } {
    // For now, this is not supported by the backend
    return { success: false, error: 'Password change not supported by backend' };
  }

  deleteAccount(): { success: boolean; error?: string } {
    // For now, this is not supported by the backend
    return { success: false, error: 'Account deletion not supported by backend' };
  }
}
