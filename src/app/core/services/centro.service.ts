import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Centro {
  id: string;
  nombre: string;
  codigo: string;
  created_at: string;
  updated_at: string;
}

export interface CentrosResponse {
  success: boolean;
  data: Centro[];
}

export interface CreateCentroResponse {
  success: boolean;
  message: string;
  data: Centro;
}

@Injectable({
  providedIn: 'root'
})
export class CentroService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCentros(): Observable<CentrosResponse> {
    return this.http.get<CentrosResponse>(`${this.apiUrl}/centros`);
  }

  createCentro(data: { nombre: string; codigo: string }): Observable<CreateCentroResponse> {
    return this.http.post<CreateCentroResponse>(`${this.apiUrl}/centros`, data);
  }

  updateCentro(id: string, data: { nombre?: string; codigo?: string }): Observable<CreateCentroResponse> {
    return this.http.put<CreateCentroResponse>(`${this.apiUrl}/centros/${id}`, data);
  }

  deleteCentro(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/centros/${id}`);
  }

  restoreCentro(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/centros/${id}/restore`, {});
  }
}
