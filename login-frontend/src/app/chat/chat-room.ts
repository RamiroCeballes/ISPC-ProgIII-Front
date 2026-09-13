import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ChatMessage, ChatService } from '../services/chat.service';

const TYPING_DEBOUNCE_MS = 1500;
const TYPING_EXPIRY_MS = 3000;

@Component({
  selector: 'app-chat-room',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.css',
})
export class ChatRoom implements OnInit {
  private chat = inject(ChatService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private typing$ = new Subject<void>();

  room = this.route.snapshot.paramMap.get('room') ?? 'general';
  messages = signal<ChatMessage[]>([]);
  systemEvents = signal<string[]>([]);
  typingUsers = signal<Set<string>>(new Set());
  online = signal(false);
  draft = '';

  list = viewChild<ElementRef<HTMLDivElement>>('list');

  typingLabel = computed(() => {
    const users = [...this.typingUsers()];
    return users.length ? `${users.join(', ')} está escribiendo...` : '';
  });

  constructor() {
    effect(() => {
      this.messages();
      queueMicrotask(() => this.list()?.nativeElement.scrollTo({ top: 1e9, behavior: 'smooth' }));
    });
  }

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.chat.history(this.room).subscribe((history) => this.messages.set(history));

    this.chat.connectionState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((connected) => this.online.set(connected));

    this.chat
      .connect(this.room)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        switch (event.type) {
          case 'chat.message':
            this.messages.update((list) => [...list, event.message]);
            this.typingUsers.update((users) => {
              const next = new Set(users);
              next.delete(event.message.author);
              return next;
            });
            break;
          case 'chat.presence':
            this.systemEvents.update((events) => [
              ...events,
              `${event.user} ${event.event === 'join' ? 'entró' : 'salió'}`,
            ]);
            break;
          case 'chat.typing':
            this.typingUsers.update((users) => new Set(users).add(event.user));
            setTimeout(() => {
              this.typingUsers.update((users) => {
                const next = new Set(users);
                next.delete(event.user);
                return next;
              });
            }, TYPING_EXPIRY_MS);
            break;
          case 'error':
            console.warn(event.detail);
            break;
        }
      });

    this.typing$
      .pipe(debounceTime(TYPING_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.chat.sendTyping());

    this.destroyRef.onDestroy(() => this.chat.disconnect());
  }

  onInput(): void {
    this.typing$.next();
  }

  trackById(_index: number, message: ChatMessage): number {
    return message.id;
  }

  send(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.chat.sendMessage(text);
    this.draft = '';
  }
}
