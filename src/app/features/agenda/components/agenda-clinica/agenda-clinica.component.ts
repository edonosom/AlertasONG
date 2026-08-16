import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DetalleAlertaDia, AlertaApiService, CalendarioMensualResponse, AlertaResumen } from '../../../../core/services/alerta-api.service';
import { PacienteService, Nna } from '../../../../core/services/nna.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NnaCardComponent } from '../nna-card/nna-card.component';
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
  imports: [CommonModule, IonicModule, NnaCardComponent, RouterModule],
  templateUrl: './agenda-clinica.component.html',
  styleUrls: ['./agenda-clinica.component.scss']
})
export class AgendaClinicaComponent implements OnInit {
  private readonly alertaApi = inject(AlertaApiService);
  private readonly nnaService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  public readonly authService = inject(AuthService);

  nnaId = signal<string | null>(null);
  nnaData = signal<Nna | null>(null);
  nnaError = signal<string | null>(null);

  edadNna = computed(() => {
    const data = this.nnaData();
    if (!data?.fecha_nacimiento) return null;
    const diff = Date.now() - new Date(data.fecha_nacimiento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  });

  nnaCentro = computed(() => {
    const data = this.nnaData();
    return data?.asignaciones?.[0]?.centro?.nombre || null;
  });

  nnaFuncionario = computed(() => {
    const data = this.nnaData();
    const func = data?.asignaciones?.[0]?.funcionario;
    return func ? `${func.nombre} ${func.apellido}` : null;
  });

  nnaDirector = computed(() => {
    const data = this.nnaData();
    const dirs = data?.asignaciones?.[0]?.centro?.directores;
    if (dirs && dirs.length > 0) {
      return `${dirs[0].nombre} ${dirs[0].apellido}`;
    }
    return null;
  });

  daysRemaining = computed(() => {
    const n = this.nnaData();
    if (!n) return 90;
    
    if (n.fecha_ingreso) {
      const parts = n.fecha_ingreso.split('-');
      if (parts.length === 3) {
        const baseDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        const today = new Date();
        const diffTime = today.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        return Math.max(0, 90 - diffDays);
      }
    }
    return Math.max(0, 90 - (n.dias_transcurridos || 0));
  });

  nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Signals reactivos — inicializar con la fecha real de hoy
  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1); // getMonth() es 0-indexed
  nombreMesActual = computed(() => this.nombresMeses[this.currentMonth() - 1]);
  loading = signal(true);
  
  // Estado que guarda la respuesta del backend
  calendarioData = signal<CalendarioMensualResponse | null>(null);

  // Estado del Detalle Diario
  selectedDate = signal<string | null>(null);
  loadingDetalle = signal(false);
  detalleData = signal<DetalleAlertaDia[]>([]);
  hasEventosEnFechaSeleccionada = signal(false);

  formatSelectedDate(fechaStr: string | null): string {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      const mesIndex = parseInt(parts[1], 10) - 1;
      return `${parts[2]} de ${this.nombresMeses[mesIndex]} de ${parts[0]}`;
    }
    return fechaStr;
  }

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
        this.nnaId.set(id);
        this.cargarNnaInfo(id);
      }
      
      this.route.queryParamMap.subscribe(queryParams => {
        const queryFecha = queryParams.get('fecha');
        let targetDate = new Date();
        
        if (queryFecha) {
          const parts = queryFecha.split('-');
          if (parts.length === 3) {
            targetDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          }
        }
        
        this.currentYear.set(targetDate.getFullYear());
        this.currentMonth.set(targetDate.getMonth() + 1);
        
        this.cargarMes();
        
        const targetDateStr = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`;
        this.seleccionarFecha(targetDateStr);
      });
    });
  }

  goBack() {
    this.location.back();
  }

  cargarNnaInfo(id: string) {
    this.nnaService.getPaciente(id).subscribe({
      next: (res) => {
        this.nnaData.set(res.data);
        this.nnaError.set(null);
      },
      error: (err) => {
        console.error('Error cargando info NNA', err);
        this.nnaError.set(err.message || 'Error desconocido');
      }
    });
  }

  cargarMes() {
    this.loading.set(true);
    
    const params = this.nnaId() ? { nna_id: this.nnaId()! } : undefined;
    
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

  seleccionarFecha(fecha: string) {
    this.selectedDate.set(fecha);
    this.loadingDetalle.set(true);
    this.detalleData.set([]);

    this.alertaApi.getDetalleDiario(fecha, this.nnaId()).subscribe({
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

  cerrarDetalle() {
    this.selectedDate.set(null);
  }

  async clickCelda(celda: CeldaCalendario) {
    if (!celda.fecha) return;

    // Siempre seleccionamos la fecha para mostrar el detalle en la columna derecha
    this.seleccionarFecha(celda.fecha);
    this.hasEventosEnFechaSeleccionada.set(celda.alertas.length > 0);

    // Solo abrir el modal de creación si NO hay eventos en ese día
    if (celda.alertas.length === 0) {
      await this.agregarActividadPorFecha(celda.fecha);
    }
  }

  async agregarActividad() {
    const fecha = this.selectedDate();
    if (!fecha) return;
    await this.agregarActividadPorFecha(fecha);
  }

  private async agregarActividadPorFecha(fecha: string) {
    const modal = await this.modalCtrl.create({
      component: AgendaModalComponent,
      cssClass: 'clinical-modal',
      componentProps: { 
        selectedDate: fecha,
        pacienteId: this.nnaId() 
      }
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data && data.type) {
      this.cargarMes(); // Reload grid
      this.seleccionarFecha(fecha); // Reload detail
    }
  }

  cerrarGestionDesdeCard(alertaId: string) {
    // alertaId corresponde al faseId en el contexto del SLA para este endpoint
    this.alertaApi.cerrarFase(alertaId).subscribe({
      next: () => {
        this.cargarMes();
        if (this.selectedDate()) {
          this.seleccionarFecha(this.selectedDate()!);
        }
      },
      error: (err) => {
        console.error('Error al confirmar gestión', err);
      }
    });
  }

  enviarDocumentos(alertaId: string) {
    this.alertaApi.enviarDocumentos(alertaId).subscribe({
      next: () => {
        this.cargarMes();
        if (this.selectedDate()) {
          this.seleccionarFecha(this.selectedDate()!);
        }
      },
      error: (err) => {
        console.error('Error al enviar documentos', err);
      }
    });
  }

  confirmarRecepcion(alertaId: string) {
    this.alertaApi.confirmarRecepcion(alertaId).subscribe({
      next: () => {
        // Al confirmar, se avanza el ciclo, recargamos la info del NNA también
        if (this.nnaId()) {
          this.cargarNnaInfo(this.nnaId()!);
        }
        this.cargarMes();
        if (this.selectedDate()) {
          this.seleccionarFecha(this.selectedDate()!);
        }
      },
      error: (err) => {
        console.error('Error al confirmar recepción', err);
      }
    });
  }
}
