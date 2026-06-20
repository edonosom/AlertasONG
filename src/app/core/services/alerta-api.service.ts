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
  paciente_id: string;
  paciente_nombre_completo: string;
  rut: string;
  nivel_alerta: number | null; // null si es personalizada y no SLA
  dias_transcurridos: number; // 0 a 90
  fecha_inicio_sla: string;
  estado_alerta: string;
  tipo: 'SLA' | 'PERSONALIZADA';
}

export interface DetalleDiarioResponse {
  data: DetalleAlertaDia[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertaApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/api/v1/agenda/alertas';

  getResumenMensual(year: number, month: number, extraParams?: any): Observable<CalendarioMensualResponse> {
    const params = { year, month, ...extraParams };
    return this.http.get<CalendarioMensualResponse>(`${this.apiUrl}/mensual`, { params });
  }

  getDetalleDiario(fecha: string, pacienteId?: string | null): Observable<DetalleDiarioResponse> {
    let params = new HttpParams();
    if (pacienteId) {
      params = params.set('paciente_id', pacienteId);
    }
    return this.http.get<DetalleDiarioResponse>(`${this.apiUrl}/fecha/${fecha}`, { params });
  }

  cerrarFase(faseId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/fases/${faseId}/cierre`, {});
  }
}
