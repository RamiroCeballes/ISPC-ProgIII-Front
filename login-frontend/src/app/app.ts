import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('login-frontend');

  private auth = inject(AuthService);
  private notifications = inject(NotificationService);

  constructor() {
    // El socket de notificaciones vive durante toda la sesión, no ligado a
    // un componente: se abre al loguearse y se cierra al desloguearse.
    this.auth.isAuthenticated$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.notifications.start();
      } else {
        this.notifications.stop();
      }
    });
  }
}
