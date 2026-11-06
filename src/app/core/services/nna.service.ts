import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Nna {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  fecha_ingreso?: string;
  ciclo?: number;
  dias_transcurridos?: number;
  circular_vigente?: NnaCircular | null;
  circulares?: NnaCircular[];
  asignaciones?: {
    id: string;
    funcionario_id: string;
    centro_id: string;
    activo: boolean;
    funcionario?: {
      id: string;
      nombre: string;
      apellido: string;
    };
    centro?: {
      id: string;
      nombre: string;
      directores?: {
        id: string;
        nombre: string;
        apellido: string;
      }[];
    };
  }[];
}

export interface NnaCircular {
  id: string;
  circular: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface PacientesResponse {
  success: boolean;
  data: Nna[];
}

export interface CreatePacienteResponse {
  success: boolean;
  message: string;
  data: Nna;
}

export interface AlertaPersonalizada {
  titulo: string;
  fecha_programada: string;
  descripcion?: string;
  nna_id?: string;
  es_critica?: boolean;
}

export interface CargaMasivaFila {
  fila: number;
  rut: string | null;
  nombre: string | null;
  apellido: string | null;
  fecha_nacimiento: string | null;
  fecha_ingreso?: string | null;
  circular?: string | null;
  centro_id?: string | null;
  funcionario_id?: string | null;
  adultos_responsables?: { nombre: string | null; apellido: string | null; telefono: string | null; parentesco: string | null }[];
}

export interface CargaMasivaResultado {
  simulacion: boolean;
  resumen: { total: number; validas: number; creadas: number; con_error: number };
  filas: { fila: number; rut: string | null; estado: 'valida' | 'creada' | 'error'; errores: string[]; nna_id?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPacientes(): Observable<PacientesResponse> {
    return this.http.get<PacientesResponse>(`${this.apiUrl}/nnas`);
  }

  getPaciente(id: string): Observable<{ success: boolean; data: Nna }> {
    return this.http.get<{ success: boolean; data: Nna }>(`${this.apiUrl}/nnas/${id}`);
  }

  createPaciente(data: Partial<Nna>): Observable<CreatePacienteResponse> {
    return this.http.post<CreatePacienteResponse>(`${this.apiUrl}/nnas`, data);
  }

  updatePaciente(id: string, data: Partial<Nna>): Observable<CreatePacienteResponse> {
    return this.http.put<CreatePacienteResponse>(`${this.apiUrl}/nnas/${id}`, data);
  }

  deletePaciente(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/nnas/${id}`);
  }

  cargaMasiva(filas: CargaMasivaFila[], simular: boolean): Observable<{ success: boolean; data: CargaMasivaResultado }> {
    return this.http.post<{ success: boolean; data: CargaMasivaResultado }>(`${this.apiUrl}/nnas/carga-masiva`, { filas, simular });
  }

  createAlerta(data: AlertaPersonalizada): Observable<any> {
    return this.http.post(`${this.apiUrl}/alertas-personalizadas`, data);
  }
}
