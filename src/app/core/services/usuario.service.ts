import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface UsuariosResponse {
  success: boolean;
  data: Usuario[];
}

export interface CreateUsuarioResponse {
  success: boolean;
  message: string;
  data: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsuarios(): Observable<UsuariosResponse> {
    return this.http.get<UsuariosResponse>(`${this.apiUrl}/usuarios`);
  }

  createUsuario(data: any): Observable<CreateUsuarioResponse> {
    return this.http.post<CreateUsuarioResponse>(`${this.apiUrl}/usuarios`, data);
  }

  updateUsuario(id: string, data: any): Observable<CreateUsuarioResponse> {
    return this.http.put<CreateUsuarioResponse>(`${this.apiUrl}/usuarios/${id}`, data);
  }

  deleteUsuario(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/usuarios/${id}`);
  }

  restoreUsuario(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/usuarios/${id}/restore`, {});
  }
}
