import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  viewMode: 'login' | 'otp' | 'forgot' | 'reset' = 'login';
  isLoading = false;
  errorMessage = '';
  
  currentUsername = '';

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  otpForm = this.fb.group({
    otp_code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm = this.fb.group({
    token: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]]
  });

  setView(mode: 'login' | 'otp' | 'forgot' | 'reset') {
    this.viewMode = mode;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      
      const { username, password } = this.loginForm.value;
      
      this.http.post<any>('http://127.0.0.1:8000/api/login/', { username, password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.otp_required) {
            this.currentUsername = res.username;
            this.setView('otp');
          } else if (res.access) {
            this.handleSuccessfulAuth(res);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Credenciales inválidas, intenta probar de nuevo.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onVerifyOTP() {
    if (this.otpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      
      const otp_code = this.otpForm.value.otp_code;
      
      this.http.post<any>('http://127.0.0.1:8000/api/verify-otp/', { 
        username: this.currentUsername, 
        otp_code 
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.handleSuccessfulAuth(res);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Código OTP inválido o expirado';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onForgot() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      
      const email = this.forgotForm.value.email;
      
      this.http.post<any>('http://127.0.0.1:8000/api/forgot-password/', { email }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Revisa tu consola/email para obtener el token de recuperación');
          this.setView('reset');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'No se pudo procesar la solicitud';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onReset() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
      
      const email = this.forgotForm.value.email;
      const { token, new_password } = this.resetForm.value;
      
      this.http.post<any>('http://127.0.0.1:8000/api/reset-password/', { 
        email, token, new_password 
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          alert('Contraseña restablecida con éxito. Puedes iniciar sesión.');
          this.setView('login');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Token inválido o expirado';
          this.cdr.detectChanges();
        }
      });
    }
  }

  private handleSuccessfulAuth(res: any) {
    const rememberMe = this.loginForm.value.rememberMe;
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('access', res.access);
    storage.setItem('refresh', res.refresh);
    
    this.router.navigate(['/home']);
  }
}
