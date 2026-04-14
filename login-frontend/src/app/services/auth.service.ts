import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  access: string;
  refresh: string;
  user: any;
}

interface RegisterResponse {
  access: string;
  refresh: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';
  private backendUrl = 'http://localhost:8000';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, { username, password }).pipe(
      tap((response: LoginResponse) => {
        if (response?.access && response?.refresh) {
          localStorage.setItem('token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('user', JSON.stringify(response.user || { username }));
          this.currentUserSubject.next(response.user || { username });
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(username: string, email: string, password: string, password2: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, {
      username,
      email,
      password,
      password2,
    });
  }

  getGoogleOAuthUrl(): string {
    return `${this.backendUrl}/accounts/google/login/?process=login`;
  }

  getGitHubOAuthUrl(): string {
    return `${this.backendUrl}/accounts/github/login/?process=login`;
  }

  completeOAuthLogin(access: string, refresh: string): void {
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    this.isAuthenticatedSubject.next(true);

    this.http.get<any>(`${this.apiUrl}/user/`).subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      },
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.currentUserSubject.next(JSON.parse(user));
      this.isAuthenticatedSubject.next(true);
    }
  }
}
