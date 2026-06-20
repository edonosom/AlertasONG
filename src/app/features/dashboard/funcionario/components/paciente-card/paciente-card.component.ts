import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';

export interface PacienteCardData {
  nombre: string;
  rut: string;
  diasFaseActual: number;
}

@Component({
  selector: 'app-paciente-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle],
  template: `
    <ion-card class="glass-panel paciente-card">
      <ion-card-header>
        <ion-card-title>{{ paciente().nombre }}</ion-card-title>
        <ion-card-subtitle>{{ rutTruncado() }}</ion-card-subtitle>
      </ion-card-header>

      <ion-card-content class="content-wrapper">
        <div class="progress-container">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="porcentajeAvance()" [style.background-color]="colorSemantico()"></div>
          </div>
          <span class="days-text" [style.color]="colorSemantico()">{{ paciente().diasFaseActual }} / 90 días</span>
        </div>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    .paciente-card {
      margin: 16px 0;
      border-radius: var(--border-radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-soft);
    }
    .content-wrapper {
      padding-top: 8px;
    }
    .progress-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .progress-bar-bg {
      flex: 1;
      height: 8px;
      background: var(--ion-color-step-100);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s ease-out, background-color 0.4s ease;
    }
    .days-text {
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
    }
  `]
})
export class PacienteCardComponent {
  paciente = input.required<PacienteCardData>();

  rutTruncado = computed(() => {
    const rutCompleto = this.paciente().rut;
    if (!rutCompleto || rutCompleto.length < 5) return '***-X';
    return `${rutCompleto.slice(0, 2)}...${rutCompleto.slice(-2)}`;
  });

  porcentajeAvance = computed(() => {
    const dias = Math.min(Math.max(this.paciente().diasFaseActual, 0), 90);
    return (dias / 90) * 100;
  });

  colorSemantico = computed(() => {
    const dias = this.paciente().diasFaseActual;
    if (dias >= 89) return 'var(--ion-color-danger)';
    if (dias >= 75) return 'var(--ion-color-warning)';
    return 'var(--ion-color-success)';
  });
}
