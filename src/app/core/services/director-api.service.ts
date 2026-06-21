import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DirectorFuncionario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  pacientes_count?: number;
  pivot?: { activo: boolean };
}

export interface DirectorPaciente {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  complejidad: string;
  fases_proceso: Array<{
    id: string;
    numero_fase: number;
    estado: string;
    fecha_inicio: string;
  }>;
  dias_transcurridos?: number;
  dias_restantes?: number;
  alertas_pendientes_count?: number;
}

export interface FuncionariosResponse {
  success: boolean;
  data: DirectorFuncionario[];
}

export interface PacientesResponse {
  success: boolean;
  data: DirectorPaciente[];
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DirectorApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/director`;

  getFuncionarios(): Observable<FuncionariosResponse> {
    return this.http.get<FuncionariosResponse>(`${this.apiUrl}/funcionarios`);
  }

  getPacientesByFuncionario(funcionarioId: string): Observable<PacientesResponse> {
    return this.http.get<PacientesResponse>(`${this.apiUrl}/funcionarios/${funcionarioId}/pacientes`);
  }

  reasignarPaciente(pacienteId: string, nuevoFuncionarioId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/pacientes/${pacienteId}/reasignar`, { nuevo_funcionario_id: nuevoFuncionarioId });
  }
}
