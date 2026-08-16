import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectorApiService, DirectorFuncionario, DirectorPaciente } from '../../../core/services/director-api.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PacienteService } from '../../../core/services/nna.service';
import { NnaModalComponent } from '../../nnas/components/nna-modal/nna-modal.component';
import { UsuarioModalComponent } from '../../admin/usuarios/components/usuario-modal/usuario-modal.component';

@Component({
  selector: 'app-director',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './director.component.html',
  styleUrls: ['./director.component.scss']
})

export class DirectorComponent implements OnInit {
  private readonly directorApi = inject(DirectorApiService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly usuarioService = inject(UsuarioService);
  private readonly pacienteService = inject(PacienteService);

  funcionarios = signal<DirectorFuncionario[]>([]);
  selectedFuncionarioId = signal<string | null>(null);
  nnas = signal<DirectorPaciente[]>([]);

  // Reassignment Modal State
  isReassignModalOpen = signal(false);
  selectedPacienteId = signal<string | null>(null);
  targetFuncionarioId = signal<string>('');

  loadingFuncionarios = signal(true);
  loadingPacientes = signal(false);
  isSubmitting = signal(false);

  // Computed: available targets for reassignment (exclude current)
  availableFuncionarios = computed(() => {
    const currentId = this.selectedFuncionarioId();
    return this.funcionarios().filter(f => f.id !== currentId);
  });

  // Search
  searchQueryFuncionarios = signal<string>('');
  searchQueryNnas = signal<string>('');

  filteredFuncionarios = computed(() => {
    const q = this.searchQueryFuncionarios().toLowerCase().trim();
    if (!q) return this.funcionarios();
    return this.funcionarios().filter(f => 
      `${f.nombre} ${f.apellido}`.toLowerCase().includes(q) ||
      (f.email && f.email.toLowerCase().includes(q))
    );
  });

  filteredNnas = computed(() => {
    const q = this.searchQueryNnas().toLowerCase().trim();
    if (!q) return this.nnas();
    return this.nnas().filter(n => 
      `${n.nombre} ${n.apellido}`.toLowerCase().includes(q) ||
      (n.rut && n.rut.toLowerCase().includes(q))
    );
  });

  ngOnInit() {
    this.cargarFuncionarios();
  }

  cargarFuncionarios() {
    this.loadingFuncionarios.set(true);
    this.directorApi.getFuncionarios().subscribe({
      next: (res: any) => {
        this.funcionarios.set(res.data);
        this.loadingFuncionarios.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar funcionarios', err);
        this.loadingFuncionarios.set(false);
      }
    });
  }

  seleccionarFuncionario(funcionario: DirectorFuncionario) {
    this.selectedFuncionarioId.set(funcionario.id);
    this.cargarPacientes(funcionario.id);
  }

  cargarPacientes(funcionarioId: string) {
    this.loadingPacientes.set(true);
    this.nnas.set([]);
    this.directorApi.getPacientesByFuncionario(funcionarioId).subscribe({
      next: (res: any) => {
        this.nnas.set(res.data ? res.data : res);
        this.loadingPacientes.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar nnas', err);
        this.loadingPacientes.set(false);
      }
    });
  }

  abrirReasignacion(nna: DirectorPaciente) {
    this.selectedPacienteId.set(nna.id);
    this.targetFuncionarioId.set(''); // reset selection
    this.isReassignModalOpen.set(true);
  }

  cerrarModal() {
    this.isReassignModalOpen.set(false);
    this.selectedPacienteId.set(null);
  }

  confirmarReasignacion() {
    const pacienteId = this.selectedPacienteId();
    const nuevoId = this.targetFuncionarioId();
    
    if (!pacienteId || !nuevoId) return;

    this.isSubmitting.set(true);
    this.directorApi.reasignarPaciente(pacienteId, nuevoId).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.cerrarModal();
        this.showToast('Nna reasignado exitosamente');
        // Recargar la lista de nnas del funcionario actual
        const currentFuncionario = this.selectedFuncionarioId();
        if (currentFuncionario) {
          this.cargarPacientes(currentFuncionario);
        }
      },
      error: (err: any) => {
        console.error('Error al reasignar', err);
        this.isSubmitting.set(false);
        this.showToast('Error al reasignar el nna', 'danger');
      }
    });
  }

  getSemanticColor(nna: DirectorPaciente): string {
    const dias = nna.dias_transcurridos || 0;
    if (dias >= 80) return 'bg-red-500';
    if (dias >= 75) return 'bg-orange-400';
    return 'bg-green-400';
  }

  getTotalAlertas(): number {
    return this.funcionarios().reduce((sum, f) => sum + (f.alertas_count || 0), 0);
  }

  async openCrearFuncionarioModal() {
    const modal = await this.modalCtrl.create({
      component: UsuarioModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        preselectedRole: 'funcionario' 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Funcionario creado exitosamente');
      this.cargarFuncionarios();
    }
  }

  async openEditarFuncionarioModal(funcionario: DirectorFuncionario) {
    const modal = await this.modalCtrl.create({
      component: UsuarioModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        usuarioData: funcionario 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Funcionario actualizado exitosamente');
      this.cargarFuncionarios();
    }
  }

  desactivarFuncionario(funcionario: DirectorFuncionario) {
    if (confirm(`¿Estás seguro de desactivar/eliminar al funcionario ${funcionario.nombre}?`)) {
      this.usuarioService.deleteUsuario(funcionario.id).subscribe({
        next: () => {
          this.showToast('Funcionario desactivado');
          this.cargarFuncionarios();
          if (this.selectedFuncionarioId() === funcionario.id) {
            this.selectedFuncionarioId.set(null);
          }
        },
        error: () => this.showToast('Error al desactivar el funcionario', 'danger')
      });
    }
  }

  async openCrearPacienteModal() {
    const currentFunc = this.selectedFuncionarioId();
    if (!currentFunc) return;

    const modal = await this.modalCtrl.create({
      component: NnaModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        preassignedFuncionarioId: currentFunc 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Nna enrolado y asignado exitosamente');
      this.cargarPacientes(currentFunc);
    }
  }

  async openEditarPacienteModal(nna: DirectorPaciente) {
    const currentFunc = this.selectedFuncionarioId();
    const modal = await this.modalCtrl.create({
      component: NnaModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        nna: nna 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Nna actualizado exitosamente');
      if (currentFunc) {
        this.cargarPacientes(currentFunc);
      }
    }
  }

  desactivarPaciente(nna: DirectorPaciente) {
    if (confirm(`¿Estás seguro de desactivar/eliminar al nna ${nna.nombre}?`)) {
      this.pacienteService.deletePaciente(nna.id).subscribe({
        next: () => {
          this.showToast('Nna desactivado');
          const currentFunc = this.selectedFuncionarioId();
          if (currentFunc) {
            this.cargarPacientes(currentFunc);
          }
        },
        error: () => this.showToast('Error al desactivar el nna', 'danger')
      });
    }
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
