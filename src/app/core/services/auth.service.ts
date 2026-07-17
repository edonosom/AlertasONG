import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Observable, tap, from, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  must_change_password?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  // Señal reactiva central que almacena el estado de autenticación
  currentUser = signal<User | null>(null);

  constructor() {}

  async init(): Promise<void> {
    const { value: userStr } = await Preferences.get({ key: USER_KEY });
    if (userStr) {
      try {
        this.currentUser.set(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return value;
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(async (response) => {
        if (response.success) {
          await Preferences.set({ key: TOKEN_KEY, value: response.token });
          await Preferences.set({ key: USER_KEY, value: JSON.stringify(response.user) });
          this.currentUser.set(response.user);
        }
      })
    );
  }

  changePassword(password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { password, password_confirmation }).pipe(
      tap(async (response: any) => {
        if (response.success) {
          // Update local user state
          const user = this.currentUser();
          if (user) {
            const updatedUser = { ...user, must_change_password: false };
            await Preferences.set({ key: USER_KEY, value: JSON.stringify(updatedUser) });
            this.currentUser.set(updatedUser);
          }
        }
      })
    );
  }

  logout(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        return this.http.post(`${this.apiUrl}/logout`, {});
      }),
      tap(async () => {
        await this.clearAuth();
      }),
      catchError(async () => {
        // Incluso si falla en el server (ej. sin red), limpiamos localmente
        await this.clearAuth();
      })
    );
  }

  async clearAuth() {
    await Preferences.remove({ key: TOKEN_KEY });
    await Preferences.remove({ key: USER_KEY });
    this.currentUser.set(null);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
