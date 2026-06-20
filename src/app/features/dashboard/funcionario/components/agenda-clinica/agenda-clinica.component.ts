import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';

export interface CitaClinica {
  id: string;
  fecha: Date;
  nombrePaciente: string;
  diasFaseActual: number;
}

interface DiaCalendario {
  fecha: Date;
  citas: CitaClinica[];
  esMesActual: boolean;
  esHoy: boolean;
}

@Component({
  selector: 'app-agenda-clinica',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
  template: `
    <ion-card class="glass-panel">
      <ion-card-header>
        <ion-card-title>Agenda Clínica</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <!-- Skeleton Loader (simulado con condición, en un caso real depende del estado de carga) -->
        <ng-container *ngIf="isLoading(); else calendarView">
          <div class="calendar-grid">
            <div class="skeleton-day" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]"></div>
          </div>
        </ng-container>

        <ng-template #calendarView>
          <div class="calendar-header">
            <div class="day-name">Lun</div>
            <div class="day-name">Mar</div>
            <div class="day-name">Mié</div>
            <div class="day-name">Jue</div>
            <div class="day-name">Vie</div>
            <div class="day-name">Sáb</div>
            <div class="day-name">Dom</div>
          </div>
          <div class="calendar-grid">
            <div class="calendar-day" 
                 *ngFor="let dia of diasCalendario()"
                 [class.not-current-month]="!dia.esMesActual"
                 [class.is-today]="dia.esHoy">
              <span class="day-number">{{ dia.fecha.getDate() }}</span>
              
              <div class="events-container">
                <div class="event-pill" 
                     *ngFor="let cita of dia.citas"
                     [ngClass]="getClasePorDias(cita.diasFaseActual)">
                  <span class="truncate">{{ cita.nombrePaciente }}</span>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }
    .calendar-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    }
    .day-name {
      text-align: center;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--ion-color-step-600);
      padding: 4px 0;
    }
    .calendar-day, .skeleton-day {
      background: var(--ion-background-color);
      border-radius: var(--border-radius-sm);
      min-height: 80px;
      padding: 4px;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--ion-color-step-100);
      transition: background-color 0.2s;
    }
    .skeleton-day {
      background: var(--ion-color-step-50);
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .calendar-day:hover {
      background: var(--ion-color-step-50);
    }
    .day-number {
      font-size: 0.8rem;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--ion-text-color);
    }
    .not-current-month {
      opacity: 0.4;
    }
    .is-today {
      border-color: var(--ion-color-primary);
      background: rgba(var(--ion-color-primary-rgb), 0.05);
    }
    .is-today .day-number {
      color: var(--ion-color-primary);
      font-weight: 700;
    }
    .events-container {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
      max-height: 60px;
    }
    .event-pill {
      font-size: 0.65rem;
      padding: 2px 4px;
      border-radius: 4px;
      background: var(--ion-color-primary);
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .event-pill.warning-yellow {
      background: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
      font-weight: 600;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .event-pill.warning-red {
      background: var(--ion-color-danger);
      color: var(--ion-color-danger-contrast);
      font-weight: 600;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .truncate {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class AgendaClinicaComponent {
  citas = input<CitaClinica[]>([]);
  isLoading = input<boolean>(false);
  mesMostrado = input<Date>(new Date());

  diasCalendario = computed(() => {
    const date = this.mesMostrado();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Configurar primer día del mes
    const firstDayOfMonth = new Date(year, month, 1);
    let startingDayOfWeek = firstDayOfMonth.getDay() || 7; // Lunes es 1, Domingo es 7
    startingDayOfWeek--; // Ajustar para que Lunes sea 0

    const days: DiaCalendario[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevMonthDays = startingDayOfWeek;
    const prevMonthDate = new Date(year, month, 0);
    const prevMonthTotalDays = prevMonthDate.getDate();

    // Días del mes anterior para rellenar la primera fila
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push(this.crearDia(d, false, today));
    }

    // Días del mes actual
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(this.crearDia(d, true, today));
    }

    // Días del mes siguiente para rellenar la última fila (para tener siempre 6 semanas / 42 días, o 35)
    const remainingDays = (Math.ceil(days.length / 7) * 7) - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.crearDia(d, false, today));
    }

    return days;
  });

  private crearDia(fecha: Date, esMesActual: boolean, hoy: Date): DiaCalendario {
    fecha.setHours(0, 0, 0, 0);
    const esHoy = fecha.getTime() === hoy.getTime();
    
    // Filtrar citas para este día
    const citasDelDia = this.citas().filter(c => {
      const cDate = new Date(c.fecha);
      cDate.setHours(0,0,0,0);
      return cDate.getTime() === fecha.getTime();
    });

    return { fecha, esMesActual, esHoy, citas: citasDelDia };
  }

  getClasePorDias(diasFase: number): string {
    if (diasFase >= 89) return 'warning-red';
    if (diasFase === 75 || diasFase === 80 || diasFase > 75) return 'warning-yellow';
    return '';
  }
}
