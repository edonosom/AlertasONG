import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DetalleAlertaDia, AlertaApiService, CalendarioMensualResponse, AlertaResumen } from '../../../../core/services/alerta-api.service';
import { PacienteCardComponent } from '../paciente-card/paciente-card.component';
import { AgendaModalComponent } from '../agenda-modal/agenda-modal.component';

interface CeldaCalendario {
  esVacio: boolean;
  dia?: number;
  fecha?: string;
  alertas: AlertaResumen[];
}

@Component({
  selector: 'app-agenda-clinica',
  standalone: true,
  imports: [CommonModule, IonicModule, PacienteCardComponent],
  templateUrl: './agenda-clinica.component.html',
  styleUrls: ['./agenda-clinica.component.scss']
})
export class AgendaClinicaComponent implements OnInit {
  private readonly alertaApi = inject(AlertaApiService);
  private readonly modalCtrl = inject(ModalController);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  pacienteId = signal<string | null>(null);

  // Signals reactivos
  currentYear = signal(2026);
  currentMonth = signal(6);
  loading = signal(true);
  
  // Estado que guarda la respuesta del backend
  calendarioData = signal<CalendarioMensualResponse | null>(null);

  // Estado del Modal
  isModalOpen = signal(false);
  selectedDate = signal<string | null>(null);
  loadingDetalle = signal(false);
  detalleData = signal<DetalleAlertaDia[]>([]);

  // Computed que recalcula la grilla automáticamente cuando cambian los inputs
  diasGrilla = computed<CeldaCalendario[]>(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    
    // Configuración del calendario
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Desplazamiento asumiendo semana comienza el Lunes (0=Lunes ... 6=Domingo)
    const padding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const dias: CeldaCalendario[] = [];
    
    // Celdas vacías iniciales
    for (let i = 0; i < padding; i++) {
      dias.push({ esVacio: true, alertas: [] });
    }
    
    // Mapeo seguro contra el diccionario de fechas del backend
    const dataBackend = this.calendarioData()?.data?.dias || {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const fechaFormat = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      dias.push({
        esVacio: false,
        dia: day,
        fecha: fechaFormat,
        alertas: dataBackend[fechaFormat] || []
      });
    }
    
    return dias;
  });

  weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.pacienteId.set(id);
      }
      this.cargarMes();
    });
  }

  goBack() {
    this.location.back();
  }

  cargarMes() {
    this.loading.set(true);
    
    // Si la API soporta paciente_id como parámetro query:
    const params = this.pacienteId() ? { paciente_id: this.pacienteId()! } : undefined;
    
    this.alertaApi.getResumenMensual(this.currentYear(), this.currentMonth(), params).subscribe({
      next: (res) => {
        this.calendarioData.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando la agenda clínica', err);
        // En caso de error, quitamos el loader igual
        this.loading.set(false);
      }
    });
  }

  prevMonth() {
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
    this.cargarMes();
  }

  nextMonth() {
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
    this.cargarMes();
  }

  esCritico(alertas: AlertaResumen[]): boolean {
    return alertas.some(a => a.nivel === 89);
  }

  isToday(fecha?: string): boolean {
    if (!fecha) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return fecha === todayStr;
  }

  getEventClass(alerta: AlertaResumen): string {
    if (alerta.tipo === 'SLA' && alerta.nivel) {
      return `event-sla-${alerta.nivel}`;
    }
    return 'event-personalizada';
  }

  abrirDetalleDia(celda: CeldaCalendario) {
    if (celda.alertas.length === 0 || !celda.fecha) return;
    
    this.selectedDate.set(celda.fecha);
    this.isModalOpen.set(true);
    this.loadingDetalle.set(true);
    this.detalleData.set([]);

    this.alertaApi.getDetalleDiario(celda.fecha, this.pacienteId()).subscribe({
      next: (res) => {
        this.detalleData.set(res.data);
        this.loadingDetalle.set(false);
      },
      error: (err) => {
        console.error('Error cargando detalle diario', err);
        this.loadingDetalle.set(false);
      }
    });
  }

  cerrarModal() {
    this.isModalOpen.set(false);
    this.selectedDate.set(null);
  }

  async clickCelda(celda: CeldaCalendario) {
    if (!celda.fecha) return;

    if (celda.alertas.length > 0) {
      this.abrirDetalleDia(celda);
    } else {
      const modal = await this.modalCtrl.create({
        component: AgendaModalComponent,
        cssClass: 'clinical-modal',
        componentProps: { 
          selectedDate: celda.fecha,
          pacienteId: this.pacienteId() 
        }
      });
      
      await modal.present();
      
      const { data } = await modal.onWillDismiss();
      if (data && data.type) {
        this.cargarMes(); // Reload grid
      }
    }
  }

  cerrarGestionDesdeCard(alertaId: string) {
    // alertaId corresponde al faseId en el contexto del SLA para este endpoint
    this.alertaApi.cerrarFase(alertaId).subscribe({
      next: () => {
        this.cerrarModal();
        // Opcional: Recargar calendarioMensual para actualizar la grilla
      },
      error: (err) => {
        console.error('Error al confirmar gestión', err);
      }
    });
  }
}
