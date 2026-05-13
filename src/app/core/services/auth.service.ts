import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { tap, catchError, of, Observable } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  activeRole: string;
  activeOrganizationId: string;
  globalRole: 'SUPER_ADMIN' | 'SUPPORT' | 'NONE';
  organizations: Organization[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // State
  private currentUser = signal<User | null>(null);
  
  user = computed(() => this.currentUser());
  isAuthenticated = computed(() => !!this.currentUser());
  currentRole = computed(() => this.currentUser()?.activeRole || 'user');
  activeOrganizationId = computed(() => this.currentUser()?.activeOrganizationId);
  isGlobalAdmin = computed(() => this.currentUser()?.globalRole === 'SUPER_ADMIN');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleSuccess(res))
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse | any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.access_token) {
          this.handleSuccess(res);
        }
      })
    );
  }

  switchOrganization(organizationId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/switch-organization`, { organizationId }).pipe(
      tap(res => {
        this.handleSuccess(res);
        // Recargar la página para limpiar estados internos de otros servicios
        window.location.reload();
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']).then(success => {
      if (!success) {
        window.location.href = '/login';
      }
    });
  }

  private handleSuccess(res: AuthResponse) {
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    if (this.router.url === '/login' || this.router.url === '/register') {
      this.router.navigate(['/dashboard']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
