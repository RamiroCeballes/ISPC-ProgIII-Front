import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, retry, tap, timer } from 'rxjs';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: number;
  room: string;
  author: string;
  text: string;
  created_at: string;
}

export type ChatServerEvent =
  | { type: 'chat.message'; message: ChatMessage }
  | { type: 'chat.presence'; event: 'join' | 'leave'; user: string }
  | { type: 'chat.typing'; user: string }
  | { type: 'error'; detail: string };

const API_URL = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private socket$?: WebSocketSubject<any>;
  private connected$ = new Subject<boolean>();

  readonly connectionState$ = this.connected$.asObservable();

  history(room: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${API_URL}/chat/rooms/${room}/history/`);
  }

  connect(room: string): Observable<ChatServerEvent> {
    this.disconnect();
    const token = this.auth.getToken();

    this.socket$ = webSocket<any>({
      url: `${WS_URL}/ws/chat/${room}/?token=${token}`,
      openObserver: { next: () => this.connected$.next(true) },
      closeObserver: {
        next: (event) => {
          this.connected$.next(false);
          console.warn('WS de chat cerrado', event.code);
        },
      },
    });

    return this.socket$.pipe(
      // Reconexión con backoff exponencial: 1s, 2s, 4s ... hasta 30s
      retry({ delay: (_err, count) => timer(Math.min(1000 * 2 ** count, 30000)) }),
      tap({ error: (e) => console.error('Error en WS de chat', e) })
    );
  }

  sendMessage(text: string): void {
    this.socket$?.next({ type: 'chat.message', text });
  }

  sendTyping(): void {
    this.socket$?.next({ type: 'chat.typing' });
  }

  disconnect(): void {
    this.socket$?.complete();
    this.socket$ = undefined;
  }
}
