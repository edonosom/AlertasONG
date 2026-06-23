import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { UsuarioService, Usuario, UsuariosResponse } from '../../../core/services/usuario.service';
import { CentroService } from '../../../core/services/centro.service';
import { forkJoin } from 'rxjs';
import { UsuarioModalComponent } from './components/usuario-modal/usuario-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  usuarioService = inject(UsuarioService);
  centroService = inject(CentroService);
  modalCtrl = inject(ModalController);
  toastCtrl = inject(ToastController);
  alertCtrl = inject(AlertController);
  authService = inject(AuthService);

  // Raw data (includes trashed when root)
  allUsuarios = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // Active tab: 'activos' | 'inactivos'
  activeTab = signal<string>('activos');

  // Derived computed signals — no extra API calls
  usuariosActivos = computed(() => this.allUsuarios().filter(u => !u.deleted_at));
  usuariosInactivos = computed(() => this.allUsuarios().filter(u => !!u.deleted_at));

  // Convenience: what to show in current tab
  usuarios = computed(() =>
    this.activeTab() === 'activos' ? this.usuariosActivos() : this.usuariosInactivos()
  );

  isRoot(): boolean {
    const user = this.authService.currentUser();
    const rol = (user?.rol as any)?.value ?? user?.rol;
    return rol === 'root';
  }

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.isLoading.set(true);
    forkJoin({
      usuariosRes: this.usuarioService.getUsuarios(),
      centrosRes: this.centroService.getCentros()
    }).subscribe({
      next: ({ usuariosRes, centrosRes }) => {
        const centros = centrosRes.data as any[];
        const usuarios = (usuariosRes.data as any[]).map(u => {
          if (u.centro_id || u.centro?.id) {
            const cId = u.centro_id || u.centro?.id;
            const c = centros.find(c => c.id === cId);
            if (c) {
              u.centro_nombre = c.nombre;
            }
          }
          return u;
        });
        this.allUsuarios.set(usuarios);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onTabChange(event: any) {
    this.activeTab.set(event.detail.value);
  }

  getRoleColor(rol: any): string {
    const r = typeof rol === 'object' ? rol?.value : rol;
    switch (r) {
      case 'root': return 'danger';
      case 'admin': return 'tertiary';
      case 'director': return 'primary';
      case 'funcionario': return 'success';
      default: return 'medium';
    }
  }

  getRoleLabel(rol: any): string {
    const r = typeof rol === 'object' ? rol?.value : rol;
    switch (r) {
      case 'root': return 'Super Admin';
      case 'admin': return 'Administrador';
      case 'director': return 'Director';
      case 'funcionario': return 'Funcionario';
      default: return r || '-';
    }
  }

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: UsuarioModalComponent,
      cssClass: 'clinical-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Usuario creado exitosamente. Contraseña por defecto: RUT sin puntos ni guion.', 'success', 4000);
      this.loadUsuarios();
    } else if (data && data.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async editUsuario(user: any) {
    const modal = await this.modalCtrl.create({
      component: UsuarioModalComponent,
      componentProps: { usuarioData: user },
      cssClass: 'clinical-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Usuario actualizado exitosamente');
      this.loadUsuarios();
    } else if (data?.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async confirmDelete(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Desactivar Usuario',
      message: `¿Estás seguro de que deseas desactivar a ${user.nombre} ${user.apellido}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desactivar',
          role: 'destructive',
          handler: () => { this.deleteUsuario(user.id); }
        }
      ]
    });
    await alert.present();
  }

  deleteUsuario(id: string) {
    this.usuarioService.deleteUsuario(id).subscribe({
      next: () => {
        this.showToast('Usuario desactivado exitosamente');
        this.loadUsuarios();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al desactivar', 'danger');
      }
    });
  }

  async confirmRestore(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Restaurar Usuario',
      message: `¿Estás seguro de que deseas restaurar a ${user.nombre} ${user.apellido}? Volverá a tener acceso al sistema.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restaurar',
          handler: () => { this.restoreUsuario(user.id); }
        }
      ]
    });
    await alert.present();
  }

  restoreUsuario(id: string) {
    this.usuarioService.restoreUsuario(id).subscribe({
      next: () => {
        this.showToast('Usuario restaurado exitosamente', 'success');
        this.activeTab.set('activos');
        this.loadUsuarios();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al restaurar', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'success', duration: number = 2500) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }
}
