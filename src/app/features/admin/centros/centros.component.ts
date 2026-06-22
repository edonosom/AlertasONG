import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CentroService, Centro, CentrosResponse } from '../../../core/services/centro.service';
import { CentroModalComponent } from './components/centro-modal/centro-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-centros',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './centros.component.html',
  styleUrls: ['./centros.component.scss']
})
export class CentrosComponent implements OnInit {
  centroService = inject(CentroService);
  modalCtrl = inject(ModalController);
  toastCtrl = inject(ToastController);
  alertCtrl = inject(AlertController);
  authService = inject(AuthService);

  // Raw data (includes trashed when root)
  allCentros = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  // Active tab
  activeTab = signal<string>('activos');

  // Derived computed signals — no extra API calls
  centrosActivos = computed(() => this.allCentros().filter(c => !c.deleted_at));
  centrosInactivos = computed(() => this.allCentros().filter(c => !!c.deleted_at));

  centros = computed(() =>
    this.activeTab() === 'activos' ? this.centrosActivos() : this.centrosInactivos()
  );

  isRoot(): boolean {
    const user = this.authService.currentUser();
    const rol = (user?.rol as any)?.value ?? user?.rol;
    return rol === 'root';
  }

  ngOnInit() {
    this.loadCentros();
  }

  usuarioService = inject(UsuarioService);

  loadCentros() {
    this.isLoading.set(true);
    
    forkJoin({
      centrosRes: this.centroService.getCentros(),
      usuariosRes: this.usuarioService.getUsuarios()
    }).subscribe({
      next: ({ centrosRes, usuariosRes }) => {
        // Encontrar usuarios que son directores
        const directores = (usuariosRes.data as any[]).filter(u => {
          const rolVal = u.rol?.value || u.rol;
          return rolVal === 'director';
        });

        // Mapear cada centro y asignarle su director si existe
        const centrosConDirector = (centrosRes.data as any[]).map(centro => {
          const directorInfo = directores.find(d => 
            d.centro_id === centro.id || 
            d.centro?.id === centro.id || 
            (d.centros && Array.isArray(d.centros) && d.centros.some((c: any) => c.id === centro.id)) ||
            (centro.directores && Array.isArray(centro.directores) && centro.directores.some((dir: any) => dir.id === d.id))
          );
          if (directorInfo) {
            centro.director_nombre = `${directorInfo.nombre} ${directorInfo.apellido}`;
          } else if (centro.directores && Array.isArray(centro.directores) && centro.directores.length > 0) {
            const fallbackDir = centro.directores[0];
            centro.director_nombre = `${fallbackDir.nombre} ${fallbackDir.apellido}`;
          }
          return centro;
        });

        this.allCentros.set(centrosConDirector);
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

  async openAddModal() {
    const modal = await this.modalCtrl.create({
      component: CentroModalComponent,
      cssClass: 'clinical-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Centro agregado exitosamente');
      this.loadCentros();
    } else if (data?.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async editCentro(centro: any) {
    const modal = await this.modalCtrl.create({
      component: CentroModalComponent,
      componentProps: { centroData: centro },
      cssClass: 'clinical-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Centro actualizado exitosamente');
      this.loadCentros();
    } else if (data?.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async confirmDelete(centro: any) {
    const alert = await this.alertCtrl.create({
      header: 'Desactivar Centro',
      message: `¿Estás seguro de que deseas desactivar el centro "${centro.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desactivar',
          role: 'destructive',
          handler: () => { this.deleteCentro(centro.id); }
        }
      ]
    });
    await alert.present();
  }

  deleteCentro(id: string) {
    this.centroService.deleteCentro(id).subscribe({
      next: () => {
        this.showToast('Centro desactivado exitosamente');
        this.loadCentros();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al desactivar', 'danger');
      }
    });
  }

  async confirmRestore(centro: any) {
    const alert = await this.alertCtrl.create({
      header: 'Restaurar Centro',
      message: `¿Estás seguro de que deseas restaurar el centro "${centro.nombre}"? Volverá a estar activo en el sistema.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restaurar',
          handler: () => { this.restoreCentro(centro.id); }
        }
      ]
    });
    await alert.present();
  }

  restoreCentro(id: string) {
    this.centroService.restoreCentro(id).subscribe({
      next: () => {
        this.showToast('Centro restaurado exitosamente', 'success');
        this.activeTab.set('activos');
        this.loadCentros();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al restaurar', 'danger');
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }
}
