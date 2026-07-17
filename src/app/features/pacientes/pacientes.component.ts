import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PacienteService, Paciente } from '../../core/services/paciente.service';
import { PacienteModalComponent } from './components/paciente-modal/paciente-modal.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly alertCtrl = inject(AlertController);
  private readonly router = inject(Router);

  pacientes = signal<Paciente[]>([]);
  isLoading = signal<boolean>(true);

  // Filtros
  searchQuery = signal<string>('');
  selectedComplexity = signal<string>('');

  // Señales Reactivas de Métricas
  totalCount = computed(() => this.pacientes().length);
  altaCount = computed(() => this.pacientes().filter(p => p.complejidad?.toLowerCase() === 'alta').length);
  mediaCount = computed(() => this.pacientes().filter(p => p.complejidad?.toLowerCase() === 'media').length);
  bajaCount = computed(() => this.pacientes().filter(p => p.complejidad?.toLowerCase() === 'baja').length);

  // Lista Filtrada
  filteredPacientes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const comp = this.selectedComplexity().toLowerCase().trim();
    return this.pacientes().filter(p => {
      const matchQuery = !query || 
        p.nombre.toLowerCase().includes(query) || 
        p.apellido.toLowerCase().includes(query) || 
        p.rut.toLowerCase().includes(query);
      
      const pComp = (p.complejidad || 'No definida').toLowerCase();
      // Si el filtro es "No definida", busca que sea vacío o "no definida"
      const matchComp = !comp || 
        (comp === 'no definida' && (pComp === 'no definida' || pComp === '')) ||
        pComp === comp;

      return matchQuery && matchComp;
    });
  });

  ngOnInit() {
    this.loadPacientes();
  }

  loadPacientes() {
    this.isLoading.set(true);
    this.pacienteService.getPacientes().subscribe({
      next: (res) => {
        this.pacientes.set(res.data);
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

  getComplexityBadgeClass(complejidad?: string): string {
    switch (complejidad?.toLowerCase()) {
      case 'baja': return 'badge-success';
      case 'media': return 'badge-warning';
      case 'alta': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  getComplejidadColor(complejidad?: string): string {
    switch (complejidad?.toLowerCase()) {
      case 'baja': return 'success';
      case 'media': return 'warning';
      case 'alta': return 'danger';
      default: return 'medium';
    }
  }

  onSearchChange(event: any) {
    this.searchQuery.set(event.target.value);
  }

  onComplexityChange(event: any) {
    this.selectedComplexity.set(event.target.value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedComplexity.set('');
  }

  async openModal(paciente?: Paciente) {
    const modal = await this.modalCtrl.create({
      component: PacienteModalComponent,
      componentProps: { paciente },
      cssClass: 'clinical-modal-large'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast(paciente ? 'Paciente actualizado exitosamente' : 'Paciente enrolado exitosamente');
      this.loadPacientes();
    } else if (data && data.error) {
      this.showToast(data.error, 'danger');
    }
  }

  onEdit(event: Event, paciente: Paciente) {
    event.stopPropagation();
    this.openModal(paciente);
  }

  async onDelete(event: Event, paciente: Paciente) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar permanentemente al paciente <strong>${paciente.nombre} ${paciente.apellido}</strong>? Esta acción no se puede deshacer.`,
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
            this.deletePaciente(paciente.id);
          }
        }
      ]
    });

    await alert.present();
  }

  deletePaciente(id: string) {
    this.pacienteService.deletePaciente(id).subscribe({
      next: () => {
        this.showToast('Paciente eliminado exitosamente');
        this.loadPacientes();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error al eliminar el paciente', 'danger');
      }
    });
  }

  goToAgenda(pacienteId: string) {
    this.router.navigate(['/pacientes', pacienteId, 'agenda']);
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
