import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Paciente {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  complejidad?: string;
}

export interface PacientesResponse {
  success: boolean;
  data: Paciente[];
}

export interface CreatePacienteResponse {
  success: boolean;
  message: string;
  data: Paciente;
}

export interface AlertaPersonalizada {
  titulo: string;
  fecha_programada: string;
  descripcion?: string;
  paciente_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPacientes(): Observable<PacientesResponse> {
    return this.http.get<PacientesResponse>(`${this.apiUrl}/pacientes`);
  }

  createPaciente(data: Partial<Paciente>): Observable<CreatePacienteResponse> {
    return this.http.post<CreatePacienteResponse>(`${this.apiUrl}/pacientes`, data);
  }

  updatePaciente(id: string, data: Partial<Paciente>): Observable<CreatePacienteResponse> {
    return this.http.put<CreatePacienteResponse>(`${this.apiUrl}/pacientes/${id}`, data);
  }

  deletePaciente(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/pacientes/${id}`);
  }

  createAlerta(data: AlertaPersonalizada): Observable<any> {
    return this.http.post(`${this.apiUrl}/alertas-personalizadas`, data);
  }
}
