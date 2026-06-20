import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DirectorApiService, DirectorFuncionario, DirectorPaciente } from '../../../core/services/director-api.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { PacienteModalComponent } from '../../pacientes/components/paciente-modal/paciente-modal.component';
import { UsuarioModalComponent } from '../../admin/usuarios/components/usuario-modal/usuario-modal.component';

@Component({
  selector: 'app-director',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  template: `
    <div class="w-full h-full p-2 lg:p-4 flex flex-col slide-up gap-6">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 m-0 leading-tight">Centro de Mando</h2>
          <p class="text-gray-500 mt-1">Supervisión estratégica y gestión clínica de equipo</p>
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        <!-- Left Column: Funcionarios (1/3) -->
        <div class="w-full lg:w-1/3 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden border border-transparent hover:border-[#008880]/10 transition-all">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 m-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-[#008880]"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Equipo Clínico
            </h3>
            <button (click)="openCrearFuncionarioModal()" class="w-8 h-8 rounded-xl bg-teal-50 text-[#008880] flex items-center justify-center hover:bg-[#008880] hover:text-white transition-all cursor-pointer outline-none border-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="loadingFuncionarios()" class="flex flex-col gap-4">
             <div class="w-full h-16 bg-slate-100 rounded-2xl animate-pulse" *ngFor="let i of [1,2,3,4]"></div>
          </div>

          <!-- List -->
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3" *ngIf="!loadingFuncionarios()">
            <div *ngFor="let f of funcionarios()" 
                 (click)="seleccionarFuncionario(f)"
                 class="group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border border-transparent"
                 [ngClass]="selectedFuncionarioId() === f.id ? 'bg-[#F4F1FF] border-[#008880]/20 shadow-sm' : 'hover:bg-slate-50'">
                 
               <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm transition-transform"
                    [ngClass]="selectedFuncionarioId() === f.id ? 'bg-gradient-to-tr from-[#008880] to-[#e11d48] scale-105' : 'bg-slate-300'">
                 {{ f.nombre.charAt(0) }}{{ f.apellido.charAt(0) }}
               </div>
               
               <div class="flex flex-col min-w-0">
                 <h4 class="text-sm font-bold m-0 truncate" [ngClass]="selectedFuncionarioId() === f.id ? 'text-[#008880]' : 'text-gray-800'">
                   {{ f.nombre }} {{ f.apellido }}
                 </h4>
                 <span class="text-xs font-semibold text-gray-400">Psicólogo(a) • {{ f.pacientes_count || 0 }} pacientes</span>
               </div>

               <div class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" [ngClass]="{'opacity-100': selectedFuncionarioId() === f.id}">
                 <button (click)="openEditarFuncionarioModal(f); $event.stopPropagation()" class="p-1.5 rounded-lg text-slate-400 hover:bg-[#008880] hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 </button>
                 <button (click)="desactivarFuncionario(f); $event.stopPropagation()" class="p-1.5 rounded-lg text-slate-400 hover:bg-red-500 hover:text-white transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                 </button>
               </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Pacientes (2/3) -->
        <div class="w-full lg:w-2/3 bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col border border-transparent hover:border-[#e11d48]/10 transition-all relative min-h-[400px]">
          
          <div *ngIf="!selectedFuncionarioId()" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-[32px] text-center p-8">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-inner">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Selecciona un Funcionario</h3>
            <p class="text-slate-500 max-w-sm">Haz clic en un miembro de tu equipo en la columna izquierda para visualizar y gestionar sus pacientes asignados.</p>
          </div>

          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-extrabold text-gray-800 flex items-center gap-2 m-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="text-[#e11d48]"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Pacientes Asignados
            </h3>
            <button (click)="openCrearPacienteModal()" [disabled]="!selectedFuncionarioId()" class="px-5 py-2.5 rounded-xl bg-emerald-50 text-[#e11d48] font-bold flex items-center gap-2 hover:bg-[#e11d48] hover:text-white transition-all cursor-pointer outline-none border-none disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Nuevo Paciente
            </button>
          </div>

          <div *ngIf="loadingPacientes()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div class="w-full h-32 bg-slate-100 rounded-[20px] animate-pulse" *ngFor="let i of [1,2,3,4]"></div>
          </div>

          <div *ngIf="!loadingPacientes() && pacientes().length === 0 && selectedFuncionarioId()" class="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-inner">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p class="text-slate-500 font-medium">Este funcionario no tiene pacientes asignados actualmente.</p>
          </div>

          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 xl:grid-cols-2 gap-4 content-start" *ngIf="!loadingPacientes() && pacientes().length > 0">
            
            <div *ngFor="let p of pacientes()" class="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <!-- Color Indicator -->
              <div class="absolute top-0 left-0 w-1.5 h-full" [ngClass]="getSemanticBg(p)"></div>
              
              <div class="flex justify-between items-start pl-2">
                <div class="flex flex-col min-w-0 pr-2">
                  <h4 class="text-base font-bold text-gray-800 m-0 truncate flex items-center gap-2">
                    {{ p.nombre }} {{ p.apellido }}
                  </h4>
                  <span class="text-xs text-gray-400 font-semibold mt-1">{{ p.rut }}</span>
                </div>
                <ion-badge color="danger" *ngIf="p.alertas_pendientes_count && p.alertas_pendientes_count > 0" class="shadow-sm shadow-red-200">
                  {{ p.alertas_pendientes_count }} alertas
                </ion-badge>
              </div>

              <div class="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-slate-400"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span class="text-xs font-semibold text-slate-600">
                  Lleva <span class="text-slate-800">{{ p.dias_transcurridos || 0 }}</span> días (Faltan {{ p.dias_restantes || 0 }})
                </span>
              </div>

              <div class="flex justify-end gap-2 mt-auto ml-2">
                <button (click)="openEditarPacienteModal(p); $event.stopPropagation()" class="px-2 py-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors border-none outline-none bg-transparent cursor-pointer flex items-center justify-center" title="Editar Paciente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button (click)="desactivarPaciente(p); $event.stopPropagation()" class="px-2 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border-none outline-none bg-transparent cursor-pointer flex items-center justify-center" title="Desactivar Paciente">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <button (click)="abrirReasignacion(p)" class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors border-none outline-none bg-transparent cursor-pointer flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Reasignar
                </button>
                <a [routerLink]="['/pacientes', p.id, 'agenda']" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#008880] hover:bg-[#136962] transition-colors shadow-sm cursor-pointer no-underline flex items-center gap-1">
                  Ver Planificación
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Tailwind Modal Reasignación -->
      <div *ngIf="isReassignModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm fade-in">
        <div class="bg-white w-full max-w-md rounded-[32px] p-6 lg:p-8 shadow-2xl relative slide-up">
          <button (click)="cerrarModal()" class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors border-none outline-none cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          
          <div class="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          
          <h2 class="text-2xl font-bold text-slate-800 mb-2">Reasignar Ficha</h2>
          <p class="text-slate-500 text-sm mb-6">Seleccione el nuevo funcionario que tomará el caso clínico de este paciente.</p>
          
          <div class="flex flex-col gap-2 mb-8">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wide">Funcionario de destino</label>
            <div class="relative">
              <select [(ngModel)]="targetFuncionarioId" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer">
                <option value="" disabled selected>Seleccionar Funcionario...</option>
                <option *ngFor="let af of availableFuncionarios()" [value]="af.id">
                  {{ af.nombre }} {{ af.apellido }}
                </option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
          </div>
          
          <button [disabled]="!targetFuncionarioId() || isSubmitting()" (click)="confirmarReasignacion()" class="w-full py-4 rounded-2xl bg-[#008880] text-white font-bold shadow-md hover:bg-[#136962] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none outline-none cursor-pointer flex justify-center items-center">
            <ion-spinner *ngIf="isSubmitting()" name="crescent" color="light" class="h-5 w-5"></ion-spinner>
            <span *ngIf="!isSubmitting()">Confirmar Transferencia</span>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .fade-in { animation: fadeIn 0.3s ease both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
  `]
})
export class DirectorComponent implements OnInit {
  private readonly directorApi = inject(DirectorApiService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly usuarioService = inject(UsuarioService);
  private readonly pacienteService = inject(PacienteService);

  funcionarios = signal<DirectorFuncionario[]>([]);
  selectedFuncionarioId = signal<string | null>(null);
  pacientes = signal<DirectorPaciente[]>([]);

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
    this.pacientes.set([]);
    this.directorApi.getPacientesByFuncionario(funcionarioId).subscribe({
      next: (res: any) => {
        this.pacientes.set(res.data ? res.data : res);
        this.loadingPacientes.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar pacientes', err);
        this.loadingPacientes.set(false);
      }
    });
  }

  abrirReasignacion(paciente: DirectorPaciente) {
    this.selectedPacienteId.set(paciente.id);
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
        this.showToast('Paciente reasignado exitosamente');
        // Recargar la lista de pacientes del funcionario actual
        const currentFuncionario = this.selectedFuncionarioId();
        if (currentFuncionario) {
          this.cargarPacientes(currentFuncionario);
        }
      },
      error: (err: any) => {
        console.error('Error al reasignar', err);
        this.isSubmitting.set(false);
        this.showToast('Error al reasignar el paciente', 'danger');
      }
    });
  }

  getSemanticBg(paciente: DirectorPaciente): string {
    const dias = paciente.dias_transcurridos || 0;
    if (dias >= 80) return 'bg-red-500';
    if (dias >= 75) return 'bg-orange-400';
    return 'bg-green-400';
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
      component: PacienteModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        preassignedFuncionarioId: currentFunc 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Paciente enrolado y asignado exitosamente');
      this.cargarPacientes(currentFunc);
    }
  }

  async openEditarPacienteModal(paciente: DirectorPaciente) {
    const currentFunc = this.selectedFuncionarioId();
    const modal = await this.modalCtrl.create({
      component: PacienteModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        paciente: paciente 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast('Paciente actualizado exitosamente');
      if (currentFunc) {
        this.cargarPacientes(currentFunc);
      }
    }
  }

  desactivarPaciente(paciente: DirectorPaciente) {
    if (confirm(`¿Estás seguro de desactivar/eliminar al paciente ${paciente.nombre}?`)) {
      this.pacienteService.deletePaciente(paciente.id).subscribe({
        next: () => {
          this.showToast('Paciente desactivado');
          const currentFunc = this.selectedFuncionarioId();
          if (currentFunc) {
            this.cargarPacientes(currentFunc);
          }
        },
        error: () => this.showToast('Error al desactivar el paciente', 'danger')
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
