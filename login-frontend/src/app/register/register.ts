import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const password2 = control.get('password2')?.value;

  if (password && password2 && password !== password2) {
    return { passwordMismatch: true };
  }

  return null;
};

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  isSubmitted = false;
  isLoading = false;
  formError: string | null = null;
  successMessage: string | null = null;

  onSubmit(): void {
    this.isSubmitted = true;
    this.formError = null;
    this.clearServerErrors();

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { username, email, password, password2 } = this.registerForm.value;

    this.authService.register(username, email, password, password2).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Cuenta creada con éxito. Ahora inicia sesión.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 900);
      },
      error: (error) => {
        this.isLoading = false;
        this.applyServerErrors(error?.error);
        this.formError = this.getBackendErrorMessage(error);
      },
    });
  }

  private clearServerErrors(): void {
    ['username', 'email', 'password', 'password2'].forEach((field) => {
      const control = this.registerForm.get(field);
      if (!control?.errors?.['server']) {
        return;
      }

      const nextErrors = { ...control.errors };
      delete nextErrors['server'];
      control.setErrors(Object.keys(nextErrors).length ? nextErrors : null);
    });
  }

  private applyServerErrors(payload: any): void {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    this.setFieldServerError('username', payload.username);
    this.setFieldServerError('email', payload.email);
    this.setFieldServerError('password', payload.password);
    this.setFieldServerError('password2', payload.password2);
  }

  private setFieldServerError(field: string, messages: any): void {
    if (!Array.isArray(messages) || !messages.length) {
      return;
    }

    const control = this.registerForm.get(field);
    if (!control) {
      return;
    }

    control.setErrors({ ...control.errors, server: messages.join(' ') });
  }

  private getBackendErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'No se puede conectar con el servidor';
    }

    const payload = error?.error;

    if (typeof payload === 'string') {
      return payload;
    }

    if (Array.isArray(payload?.username) && payload.username.length) {
      return this.translateValidationMessage(payload.username.join(' '));
    }

    if (Array.isArray(payload?.email) && payload.email.length) {
      return this.translateValidationMessage(payload.email.join(' '));
    }

    if (Array.isArray(payload?.password) && payload.password.length) {
      return this.translateValidationMessage(payload.password.join(' '));
    }

    if (Array.isArray(payload?.non_field_errors) && payload.non_field_errors.length) {
      return this.translateValidationMessage(payload.non_field_errors.join(' '));
    }

    if (payload && typeof payload === 'object') {
      const fieldMessages = Object.values(payload)
        .flatMap((value) => (Array.isArray(value) ? value : [String(value)]))
        .filter(Boolean);

      if (fieldMessages.length) {
        return this.translateValidationMessage(fieldMessages.join(' '));
      }
    }

    return 'No se pudo completar el registro';
  }

  private translateValidationMessage(message: string): string {
    return message
      .replaceAll('A user with that username already exists.', 'El nombre de usuario ya existe.')
      .replaceAll('A user with that email already exists.', 'El email ya está registrado.')
      .replaceAll('This password is too common.', 'La contraseña es demasiado común.')
      .replaceAll('This password is entirely numeric.', 'La contraseña no puede ser solo numérica.')
      .replaceAll('This password is too short. It must contain at least 8 characters.', 'La contraseña debe tener al menos 8 caracteres.')
      .replaceAll("Password fields didn't match.", 'Las contraseñas no coinciden.');
  }
}
