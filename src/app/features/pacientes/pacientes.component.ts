import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PacienteService, Paciente } from '../../core/services/paciente.service';
import { PacienteModalComponent } from './components/paciente-modal/paciente-modal.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  template: `
    <div class="w-full h-full p-2 lg:p-4 flex flex-col gap-6 slide-up">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 m-0 leading-tight">Tus Pacientes Asignados</h2>
          <p class="text-gray-500 mt-1">Gestiona el seguimiento clínico y agenda sesiones</p>
        </div>
        
        <button (click)="openModal()" class="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(236,72,153,0.3)] outline-none border-none cursor-pointer bg-gradient-to-r from-[#0369A1] to-[#e11d48]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Nuevo Paciente
        </button>
      </div>

      <!-- Skeletons -->
      <div *ngIf="isLoading()" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (i of [1,2,3]; track i) {
          <div class="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4 animate-pulse">
            <div class="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            <div class="flex flex-col gap-2 flex-1">
              <div class="w-2/3 h-4 bg-slate-200 rounded"></div>
              <div class="w-1/2 h-3 bg-slate-100 rounded"></div>
            </div>
          </div>
        }
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && pacientes().length === 0" class="bg-white rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center fade-in border border-transparent hover:border-[#008880]/10 transition-all">
        <div class="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-600 mb-6 shadow-inner">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Aún no tienes pacientes</h3>
        <p class="text-gray-500 mb-6 max-w-sm">Comienza enrolando a tu primer paciente clínico para gestionar su seguimiento.</p>
        <button (click)="openModal()" class="px-8 py-3 rounded-2xl text-white font-bold bg-[#008880] hover:bg-[#136962] transition-colors shadow-md cursor-pointer outline-none border-none">
          Enrolar Paciente
        </button>
      </div>

      <!-- Grid de Pacientes -->
      <div *ngIf="!isLoading() && pacientes().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (p of pacientes(); track p.id) {
          <div class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row justify-between items-center transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,136,128,0.12)] border border-transparent hover:border-[#008880]/10 cursor-pointer" (click)="goToAgenda(p.id)">
            
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white flex-shrink-0 shadow-md bg-gradient-to-tr from-[#0369A1] to-[#6366F1]">
                {{ p.nombre.charAt(0) }}{{ p.apellido.charAt(0) }}
              </div>
              <div class="flex flex-col min-w-0 pr-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-gray-800 font-semibold text-lg m-0 leading-tight truncate">{{ p.nombre }} {{ p.apellido }}</h3>
                </div>
                <span class="text-gray-400 text-sm mt-1 flex items-center gap-2 truncate">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="flex-shrink-0"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM1 10h22M5 14h.01M9 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                   <span class="truncate">{{ p.rut }}</span>
                   <span class="mx-1 text-gray-300">|</span>
                   <span class="truncate font-medium">{{ calcularEdad(p.fecha_nacimiento) }} años</span>
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
               <ion-badge [color]="getComplejidadColor(p.complejidad)" class="shadow-sm">{{ p.complejidad || 'No definida' | uppercase }}</ion-badge>
            </div>
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .fade-in { animation: fadeIn 0.4s ease both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class PacientesComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);
  private readonly toastCtrl = inject(ToastController);
  private readonly router = inject(Router);

  pacientes = signal<Paciente[]>([]);
  isLoading = signal<boolean>(true);

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

  getComplejidadColor(complejidad?: string): string {
    switch (complejidad?.toLowerCase()) {
      case 'baja': return 'success';
      case 'media': return 'warning';
      case 'alta': return 'danger';
      default: return 'medium';
    }
  }

  async openModal(paciente?: Paciente) {
    const modal = await this.modalCtrl.create({
      component: PacienteModalComponent,
      componentProps: { paciente },
      cssClass: 'clinical-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && !data.error) {
      this.showToast(paciente ? 'Paciente actualizado' : 'Paciente enrolado exitosamente');
      this.loadPacientes();
    } else if (data && data.error) {
      this.showToast(data.error, 'danger');
    }
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
