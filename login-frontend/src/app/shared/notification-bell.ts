import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBell {
  svc = inject(NotificationService);
  open = false;

  toggle(): void {
    this.open = !this.open;
  }
}
