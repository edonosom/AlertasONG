import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface Notificacion {
  id: string;
  tipo: 'ciclo' | 'alerta_personalizada';
  titulo: string;
  cuerpo: string;
  leida: boolean;
  url_accion: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface RecientesResponse {
  recientes: Notificacion[];
  total_no_leidas: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private api = inject(ApiService);

  unreadCount = signal<number>(0);
  recientes = signal<Notificacion[]>([]);

  cargarRecientes(): Observable<any> {
    return this.api.get<RecientesResponse>('/notificaciones/recientes').pipe(
      tap(res => {
        if (res.success) {
          this.unreadCount.set(res.data.total_no_leidas);
          this.recientes.set(res.data.recientes);
        }
      })
    );
  }

  getAll(page = 1): Observable<any> {
    return this.api.get<any>('/notificaciones', { page });
  }

  marcarLeida(id: string): Observable<any> {
    return this.api.put<any>(`/notificaciones/${id}/leer`, {}).pipe(
      tap(() => {
        this.recientes.update(list => list.map(n => n.id === id ? { ...n, leida: true } : n));
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  marcarTodas(): Observable<any> {
    return this.api.put<any>('/notificaciones/leer-todas', {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
        this.recientes.set([]);
      })
    );
  }
}
