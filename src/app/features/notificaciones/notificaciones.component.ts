import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificacionService, Notificacion } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="notif-page">

  <!-- Header -->
  <div class="notif-header">
    <div class="notif-header-left">
      <div class="notif-icon-wrap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h1 class="notif-title">Notificaciones</h1>
        <p class="notif-subtitle">
          @if (service.unreadCount() > 0) {
            {{ service.unreadCount() }} sin leer
          } @else {
            Todas leídas
          }
        </p>
      </div>
    </div>
    @if (service.unreadCount() > 0) {
      <button class="btn-mark-all" (click)="marcarTodas()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Marcar todas como leídas
      </button>
    }
  </div>

  <!-- Lista -->
  @if (loading()) {
    <div class="notif-empty">
      <div class="notif-spinner"></div>
      <p>Cargando notificaciones...</p>
    </div>
  } @else if (allNotifications().length === 0) {
    <div class="notif-empty">
      <div class="notif-empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <h3>Sin notificaciones</h3>
      <p>No tienes notificaciones en este momento.</p>
    </div>
  } @else {
    <div class="notif-list">
      @for (n of allNotifications(); track n.id) {
        <div class="notif-item" [class.notif-unread]="!n.leida" (click)="onClickNotificacion(n)">
          <div class="notif-item-icon" [class.icon-ciclo]="n.tipo === 'ciclo'" [class.icon-alerta]="n.tipo === 'alerta_personalizada'">
            @if (n.tipo === 'ciclo') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            }
          </div>
          <div class="notif-item-body">
            <div class="notif-item-title">{{ n.titulo }}</div>
            <div class="notif-item-cuerpo">{{ n.cuerpo }}</div>
            <div class="notif-item-time">{{ formatRelative(n.created_at) }}</div>
          </div>
          @if (!n.leida) {
            <div class="notif-unread-dot"></div>
          }
        </div>
      }

      @if (hasMorePages()) {
        <div class="notif-load-more">
          <button class="btn-load-more" (click)="loadMore()" [disabled]="loadingMore()">
            @if (loadingMore()) { Cargando... } @else { Cargar más }
          </button>
        </div>
      }
    </div>
  }

</div>
  `,
  styles: [`
    .notif-page {
      max-width: 720px;
      margin: 0 auto;
      animation: fadeSlideIn 0.35s ease both;
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .notif-header-left { display: flex; align-items: center; gap: 14px; }
    .notif-icon-wrap {
      width: 46px; height: 46px;
      border-radius: 14px;
      background: rgba(13,146,136,0.12);
      border: 1px solid rgba(13,146,136,0.22);
      display: flex; align-items: center; justify-content: center;
      color: #0D9288;
      flex-shrink: 0;
    }
    .notif-title {
      font-size: 1.5rem; font-weight: 900;
      color: var(--clr-text); letter-spacing: -0.03em; margin: 0;
    }
    .notif-subtitle {
      font-size: 0.8rem; color: var(--clr-text-secondary);
      font-weight: 600; margin: 2px 0 0;
    }
    .btn-mark-all {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 10px;
      background: rgba(13,146,136,0.1);
      border: 1px solid rgba(13,146,136,0.22);
      color: #0D9288; font-size: 0.8rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-mark-all:hover { background: rgba(13,146,136,0.18); }

    /* List */
    .notif-list { display: flex; flex-direction: column; gap: 8px; }

    .notif-item {
      display: flex; align-items: flex-start; gap: 14px;
      background: var(--clr-card);
      border: 1px solid var(--clr-border);
      border-radius: 14px; padding: 16px;
      cursor: pointer; transition: all 0.2s ease;
      position: relative;
    }
    .notif-item:hover {
      border-color: rgba(13,146,136,0.28);
      background: var(--clr-card-hover);
      transform: translateX(3px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    .notif-unread {
      border-left: 3px solid #0D9288 !important;
    }

    .notif-item-icon {
      width: 36px; height: 36px; flex-shrink: 0;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon-ciclo { background: rgba(239,68,68,0.12); color: #EF4444; border: 1px solid rgba(239,68,68,0.2); }
    .icon-alerta { background: rgba(13,146,136,0.12); color: #0D9288; border: 1px solid rgba(13,146,136,0.2); }

    .notif-item-body { flex: 1; min-width: 0; }
    .notif-item-title {
      font-size: 0.88rem; font-weight: 700; color: var(--clr-text);
      margin-bottom: 4px; line-height: 1.3;
    }
    .notif-item-cuerpo {
      font-size: 0.8rem; color: var(--clr-text-secondary);
      line-height: 1.5; margin-bottom: 6px;
    }
    .notif-item-time {
      font-size: 0.72rem; color: var(--clr-text-secondary);
      font-weight: 600; opacity: 0.6;
    }
    .notif-unread-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #0D9288; flex-shrink: 0; margin-top: 4px;
    }

    /* Empty */
    .notif-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 60px 20px; gap: 12px;
      color: var(--clr-text-secondary); text-align: center;
    }
    .notif-empty-icon {
      width: 72px; height: 72px; border-radius: 20px;
      background: rgba(13,146,136,0.07);
      border: 1px solid rgba(13,146,136,0.12);
      display: flex; align-items: center; justify-content: center;
      color: rgba(13,146,136,0.5); margin-bottom: 8px;
    }
    .notif-empty h3 { font-size: 1rem; font-weight: 700; color: var(--clr-text); margin: 0; }
    .notif-empty p { font-size: 0.85rem; margin: 0; }
    .notif-spinner {
      width: 32px; height: 32px; border-radius: 50%;
      border: 3px solid rgba(13,146,136,0.2);
      border-top-color: #0D9288;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Load more */
    .notif-load-more { display: flex; justify-content: center; padding: 16px 0; }
    .btn-load-more {
      padding: 10px 24px; border-radius: 10px;
      background: var(--clr-card);
      border: 1px solid var(--clr-border);
      color: var(--clr-text-secondary); font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-load-more:hover:not(:disabled) { color: #0D9288; border-color: rgba(13,146,136,0.3); }
    .btn-load-more:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class NotificacionesComponent implements OnInit {
  service = inject(NotificacionService);
  private router = inject(Router);

  loading = signal(true);
  loadingMore = signal(false);
  allNotifications = signal<Notificacion[]>([]);
  currentPage = signal(1);
  hasMorePages = signal(false);

  ngOnInit() {
    this.loadPage(1);
    this.service.cargarRecientes().subscribe();
  }

  loadPage(page: number) {
    this.service.getAll(page).subscribe({
      next: (res: any) => {
        const incoming: Notificacion[] = res.data?.data ?? [];
        if (page === 1) {
          this.allNotifications.set(incoming);
        } else {
          this.allNotifications.update(list => [...list, ...incoming]);
        }
        const meta = res.data;
        this.hasMorePages.set(meta.current_page < meta.last_page);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }

  loadMore() {
    const next = this.currentPage() + 1;
    this.currentPage.set(next);
    this.loadingMore.set(true);
    this.loadPage(next);
  }

  onClickNotificacion(n: Notificacion) {
    if (!n.leida) {
      this.service.marcarLeida(n.id).subscribe();
      this.allNotifications.update(list => list.map(item => item.id === n.id ? { ...item, leida: true } : item));
    }
    if (n.url_accion) {
      this.router.navigateByUrl(n.url_accion);
    }
  }

  marcarTodas() {
    this.service.marcarTodas().subscribe(() => {
      this.allNotifications.update(list => list.map(n => ({ ...n, leida: true })));
    });
  }

  formatRelative(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 2) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
