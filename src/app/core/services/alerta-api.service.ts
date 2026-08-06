import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaResumen {
  id: string;
  tipo: 'SLA' | 'PERSONALIZADA';
  titulo: string;
  nivel?: number;
  hora?: string;
  estado?: string;
}

export interface CalendarioMensualResponse {
  data: {
    year: number;
    month: number;
    dias: Record<string, AlertaResumen[]>;
  };
}

export interface DetalleAlertaDia {
  alerta_id: string;
  nna_id: string;
  nna_nombre_completo: string;
  rut: string;
  edad?: number;
  ciclo?: number;
  dias_nna?: number;
  nivel_alerta: number | null; // null si es personalizada y no SLA
  dias_transcurridos: number; // 0 a 90
  fecha_inicio_sla: string;
  estado_alerta: string;
  tipo: 'SLA' | 'PERSONALIZADA';
}

export interface DetalleDiarioResponse {
  data: DetalleAlertaDia[];
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/agenda/alertas`;

  getResumenMensual(year: number, month: number, extraParams?: any): Observable<CalendarioMensualResponse> {
    const params = { year, month, ...extraParams };
    return this.http.get<CalendarioMensualResponse>(`${this.apiUrl}/mensual`, { params });
  }

  getDetalleDiario(fecha: string, nnaId?: string | null): Observable<DetalleDiarioResponse> {
    let params = new HttpParams();
    if (nnaId) {
      params = params.set('nna_id', nnaId);
    }
    return this.http.get<DetalleDiarioResponse>(`${this.apiUrl}/fecha/${fecha}`, { params });
  }

  cerrarFase(faseId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fases/${faseId}/cierre`, {});
  }
}
