import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './usuario-detalle.component.html',
  styleUrls: ['./usuario-detalle.component.scss']
})
export class UsuarioDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private usuarioService = inject(UsuarioService);

  usuario = signal<any>(null);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadUsuario(id);
      } else {
        this.errorMsg.set('ID de usuario no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  loadUsuario(id: string) {
    this.isLoading.set(true);
    this.usuarioService.getUsuario(id).subscribe({
      next: (res) => {
        this.usuario.set(res.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al cargar el usuario');
        this.isLoading.set(false);
      }
    });
  }

  getRoleLabel(rol: any): string {
    const r = typeof rol === 'object' ? rol?.value : rol;
    switch (r) {
      case 'root': return 'Super Admin';
      case 'admin': return 'Administrador Global';
      case 'director': return 'Director';
      case 'funcionario': return 'Funcionario';
      default: return r || '-';
    }
  }

  get directores() {
    const u = this.usuario();
    if (!u) return [];
    return u.historico_directores || u.historicoDirectores || u.directores || [];
  }

  get funcionarios() {
    const u = this.usuario();
    if (!u) return [];
    return u.historico_funcionarios || u.historicoFuncionarios || u.funcionarios || [];
  }

  get centrosDirigidos() {
    const u = this.usuario();
    if (!u) return [];
    return u.historico_centros_dirigidos || u.historicoCentrosDirigidos || u.centros_dirigidos || u.centrosDirigidos || [];
  }

  get nnas() {
    const u = this.usuario();
    if (!u) return [];
    return (u.asignaciones_nnas || u.asignacionesNnas || []).map((a: any) => ({
      ...a.nna,
      asignacion_activa: a.activo,
      fecha_inicio: a.fecha_inicio,
      fecha_fin: a.fecha_fin
    })).filter((n: any) => n.id);
  }
}
