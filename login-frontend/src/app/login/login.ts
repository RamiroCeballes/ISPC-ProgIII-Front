import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  isSubmitted = false;
  loginError: string | null = null;

  onSubmit() {
    this.isSubmitted = true;
    this.loginError = null;

    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login failed', error);
          
          if (error.status === 401) {
            this.loginError = 'Usuario o contraseña incorrectos';
          } else if (error.status === 0) {
            this.loginError = 'No se puede conectar con el servidor';
          } else {
            this.loginError = error.error?.detail || 'Error al iniciar sesión';
          }
        }
      });
    }
  }
}
