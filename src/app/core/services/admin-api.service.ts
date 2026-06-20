import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminMetrics {
  centros_activos: number;
  directores_activos: number;
  funcionarios_activos: number;
  pacientes_totales: number;
  alertas_criticas: number;
  recent_users: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  getDashboardMetrics(): Observable<{ data: AdminMetrics }> {
    return this.http.get<{ data: AdminMetrics }>(`${this.apiUrl}/dashboard`);
  }

  getPacientesTotales(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/pacientes`);
  }

  asignarDirectorCentro(centroId: string, directorId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/centros/${centroId}/directores`, { director_id: directorId });
  }

  asignarFuncionarioDirector(directorId: string, funcionarioId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/directores/${directorId}/funcionarios`, { funcionario_id: funcionarioId });
  }

  asignarPacienteFuncionario(funcionarioId: string, pacienteId: string, centroId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/funcionarios/${funcionarioId}/pacientes`, { 
        paciente_id: pacienteId,
        centro_id: centroId
    });
  }
}
