import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
export class Login implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private readonly oauthMessageType = 'oauth_tokens';

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  isSubmitted = false;
  loginError: string | null = null;

  private handleOAuthMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    const data = event.data as { type?: string; access?: string; refresh?: string };
    if (data?.type !== this.oauthMessageType || !data.access || !data.refresh) {
      return;
    }

    this.authService.completeOAuthLogin(data.access, data.refresh);
    this.router.navigate(['/home']);
  };

  ngOnInit(): void {
    window.addEventListener('message', this.handleOAuthMessage);

    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(
          {
            type: this.oauthMessageType,
            access,
            refresh,
          },
          window.location.origin
        );
        window.close();
        return;
      }

      this.authService.completeOAuthLogin(access, refresh);
      this.clearOAuthQueryFromUrl();
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleOAuthMessage);
  }

  private clearOAuthQueryFromUrl(): void {
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  private openOAuthPopup(url: string): void {
    const width = 520;
    const height = 720;
    const left = Math.max((window.screen.width - width) / 2, 0);
    const top = Math.max((window.screen.height - height) / 2, 0);
    const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;

    const popup = window.open(url, 'oauth-login', features);

    if (!popup) {
      window.location.href = url;
      return;
    }

    popup.focus();
  }

  onSubmit() {
    this.isSubmitted = true;
    this.loginError = null;

    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: () => {
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

  onGoogleLogin() {
    this.openOAuthPopup(this.authService.getGoogleOAuthUrl());
  }

  onGitHubLogin() {
    this.openOAuthPopup(this.authService.getGitHubOAuthUrl());
  }
}
