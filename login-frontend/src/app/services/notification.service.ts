import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription, retry, timer } from 'rxjs';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

type NotificationEvent =
  | { type: 'notification.new'; notification: AppNotification }
  | { type: 'notification.unread'; count: number };

const API_URL = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000';
const TOAST_DURATION_MS = 5000;

/**
 * El socket se abre una sola vez al iniciar sesión y vive durante toda la
 * aplicación (ver App), no ligado a un componente en particular.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private socket$?: WebSocketSubject<any>;
  private sub?: Subscription;

  readonly unreadCount = signal(0);
  readonly latest = signal<AppNotification[]>([]);
  readonly toast = signal<AppNotification | null>(null);

  start(): void {
    if (this.sub) return;
    const token = this.auth.getToken();
    if (!token) return;

    // Rehidratar la lista con lo que ya existía en la base (por si el
    // usuario tenía notificaciones de una sesión anterior); se combina por
    // id con lo que ya haya podido llegar en vivo por WS mientras tanto.
    this.http
      .get<PaginatedResponse<AppNotification>>(`${API_URL}/notifications/`)
      .subscribe((page) => {
        this.latest.update((current) => this.mergeById(current, page.results));
      });

    this.socket$ = webSocket<NotificationEvent>({
      url: `${WS_URL}/ws/notifications/?token=${token}`,
    });

    this.sub = this.socket$
      .pipe(retry({ delay: (_err, count) => timer(Math.min(1000 * 2 ** count, 30000)) }))
      .subscribe((event) => {
        if (event.type === 'notification.unread') {
          this.unreadCount.set(event.count);
        }
        if (event.type === 'notification.new') {
          this.latest.update((list) => [event.notification, ...list].slice(0, 20));
          this.unreadCount.update((count) => count + 1);
          this.showToast(event.notification);
        }
      });
  }

  markRead(id: number): void {
    this.socket$?.next({ type: 'notification.read', id });
  }

  markAllRead(): void {
    this.socket$?.next({ type: 'notification.read_all' });
  }

  stop(): void {
    this.sub?.unsubscribe();
    this.sub = undefined;
    this.socket$?.complete();
    this.socket$ = undefined;
    this.unreadCount.set(0);
    this.latest.set([]);
  }

  private showToast(notification: AppNotification): void {
    this.toast.set(notification);
    setTimeout(() => this.toast.set(null), TOAST_DURATION_MS);
  }

  private mergeById(current: AppNotification[], incoming: AppNotification[]): AppNotification[] {
    const byId = new Map(current.map((n) => [n.id, n]));
    for (const n of incoming) {
      if (!byId.has(n.id)) byId.set(n.id, n);
    }
    return [...byId.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 20);
  }
}
