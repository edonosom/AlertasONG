import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PacienteService, Nna } from '../../core/services/nna.service';
import { AuthService } from '../../core/services/auth.service';
import { NnaModalComponent } from './components/nna-modal/nna-modal.component';

@Component({
  selector: 'app-nnas',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './nnas.component.html',
  styleUrls: ['./nnas.component.scss']
})
export class PacientesComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  nnas = signal<Nna[]>([]);
  isLoading = signal<boolean>(true);

  // Filtros
  searchQuery = signal<string>('');
  selectedCircular = signal<'' | 'con' | 'sin'>('');

  // Señales Reactivas de Métricas
  totalCount = computed(() => this.nnas().length);
  conCircularCount = computed(() => this.nnas().filter(p => !!p.circular_vigente).length);
  sinCircularCount = computed(() => this.nnas().filter(p => !p.circular_vigente).length);

  // Lista Filtrada
  filteredPacientes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const circularFiltro = this.selectedCircular();
    return this.nnas().filter(p => {
      const matchQuery = !query || 
        p.nombre.toLowerCase().includes(query) || 
        p.apellido.toLowerCase().includes(query) || 
        p.rut.toLowerCase().includes(query) ||
        !!p.circular_vigente?.circular.toLowerCase().includes(query);

      const matchCircular = !circularFiltro ||
        (circularFiltro === 'con') === !!p.circular_vigente;

      return matchQuery && matchCircular;
    });
  });

  // Nnas grouped by Centro for Admin/Root
  groupedNnas = computed(() => {
    const list = this.filteredPacientes();
    const groups = new Map<string, Nna[]>();

    list.forEach(nna => {
      const centroNombre = nna.asignaciones && nna.asignaciones.length > 0 && nna.asignaciones[0].centro 
        ? nna.asignaciones[0].centro.nombre 
        : 'Sin Centro Asignado';
        
      if (!groups.has(centroNombre)) {
        groups.set(centroNombre, []);
      }
      groups.get(centroNombre)!.push(nna);
    });

    return Array.from(groups.entries()).map(([centroNombre, nnas]) => ({ centroNombre, nnas }));
  });

  ngOnInit() {
    this.loadPacientes();
  }

  loadPacientes() {
    this.isLoading.set(true);
    this.pacienteService.getPacientes().subscribe({
      next: (res) => {
        this.nnas.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  calcularEdad(fechaNacimiento: string): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaStr;
  }

  onSearchChange(event: any) {
    this.searchQuery.set(event.target.value);
  }

  onCircularFilterChange(event: any) {
    this.selectedCircular.set(event.target.value);
  }

  filterByCircular(filtro: '' | 'con' | 'sin') {
    // Si ya está seleccionado ese filtro, lo deseleccionamos (toggle)
    this.selectedCircular.set(this.selectedCircular() === filtro ? '' : filtro);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCircular.set('');
  }

  async openModal(nna?: Nna) {
    const modal = await this.modalCtrl.create({
      component: NnaModalComponent,
      componentProps: { nna },
      cssClass: 'clinical-modal-large'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast(nna ? 'NNA actualizado exitosamente' : 'NNA enrolado exitosamente');
      this.loadPacientes();
    } else if (data && data.error) {
      this.showToast(data.error, 'danger');
    }
  }

  onEdit(event: Event, nna: Nna) {
    event.stopPropagation();
    this.openModal(nna);
  }

  async onDelete(event: Event, nna: Nna) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar permanentemente al NNA <strong>${nna.nombre} ${nna.apellido}</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-btn-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-btn-delete',
          handler: () => {
            this.deletePaciente(nna.id);
          }
        }
      ]
    });

    await alert.present();
  }

  deletePaciente(id: string) {
    this.pacienteService.deletePaciente(id).subscribe({
      next: () => {
        this.showToast('NNA eliminado exitosamente');
        this.loadPacientes();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al eliminar el nna', 'danger');
      }
    });
  }

  goToAgenda(pacienteId: string) {
    this.router.navigate(['/nnas', pacienteId, 'agenda']);
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
    });
    toast.present();
  }
}
