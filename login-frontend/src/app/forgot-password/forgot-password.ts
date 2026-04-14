import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/api';

  // Form de email
  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // Form de OTP
  otpForm: FormGroup = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  // Form de nueva contraseña
  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  // Estados
  step: 'email' | 'otp' | 'password' = 'email';
  isLoading = false;
  isSubmitted = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  userEmail: string = '';
  private otpToken: string = '';

  // Paso 1: Enviar email
  submitEmail() {
    this.isSubmitted = true;
    this.errorMessage = null;

    if (this.emailForm.valid) {
      this.isLoading = true;
      const { email } = this.emailForm.value;
      this.userEmail = email;

      this.http.post(`${this.apiUrl}/password-reset-request/`, { email }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Se ha enviado un código a tu email';
          this.step = 'otp';
          this.isSubmitted = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 404) {
            this.errorMessage = 'Email no encontrado en el sistema';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar con el servidor';
          } else {
            this.errorMessage = error.error?.detail || 'Error al procesar solicitud';
          }
        }
      });
    }
  }

  // Paso 2: Verificar OTP
  submitOtp() {
    this.isSubmitted = true;
    this.errorMessage = null;

    if (this.otpForm.valid) {
      this.isLoading = true;
      const { otp } = this.otpForm.value;

      this.http.post(`${this.apiUrl}/password-reset-verify-otp/`, { 
        email: this.userEmail, 
        otp 
      }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.otpToken = response.token;
          this.successMessage = 'OTP verificado correctamente';
          this.step = 'password';
          this.isSubmitted = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'Código OTP inválido o expirado';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar con el servidor';
          } else {
            this.errorMessage = error.error?.detail || 'Error al verificar OTP';
          }
        }
      });
    }
  }

  // Paso 3: Establecer nueva contraseña
  submitPassword() {
    this.isSubmitted = true;
    this.errorMessage = null;

    if (this.passwordForm.valid) {
      this.isLoading = true;
      const { password } = this.passwordForm.value;

      this.http.post(`${this.apiUrl}/password-reset-confirm/`, { 
        email: this.userEmail,
        token: this.otpToken,
        new_password: password
      }).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Contraseña actualizada correctamente. Redirigiendo al login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.errorMessage = 'La contraseña no cumple con los requisitos';
          } else if (error.status === 0) {
            this.errorMessage = 'No se puede conectar con el servidor';
          } else {
            this.errorMessage = error.error?.detail || 'Error al actualizar contraseña';
          }
        }
      });
    }
  }

  goBack() {
    if (this.step === 'email') {
      this.router.navigate(['/login']);
    } else if (this.step === 'otp') {
      this.step = 'email';
      this.isSubmitted = false;
      this.errorMessage = null;
      this.successMessage = null;
    } else if (this.step === 'password') {
      this.step = 'otp';
      this.isSubmitted = false;
      this.errorMessage = null;
      this.successMessage = null;
    }
  }
}
