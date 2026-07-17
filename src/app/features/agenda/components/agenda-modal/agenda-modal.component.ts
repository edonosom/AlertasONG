import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PacienteService } from '../../../../core/services/paciente.service';

@Component({
  selector: 'app-agenda-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="clinical-toolbar">
        <ion-title>Nueva Planificación</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()" color="medium">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="clinical-modal-bg ion-padding">
      <div class="fade-in">
        <form [formGroup]="alertaForm" (ngSubmit)="onAlertaSubmit()">
          
          <ion-item class="clinical-input" [class.ion-invalid]="alertaForm.get('fecha_programada')?.invalid && alertaForm.get('fecha_programada')?.touched">
            <ion-label position="stacked">Fecha y Hora Programada *</ion-label>
            <ion-input type="datetime-local" formControlName="fecha_programada"></ion-input>
          </ion-item>
          <span class="validation-error" *ngIf="alertaForm.get('fecha_programada')?.invalid && alertaForm.get('fecha_programada')?.touched">
            La fecha y hora son requeridas.
          </span>

          <ion-item class="clinical-input" [class.ion-invalid]="alertaForm.get('titulo')?.invalid && alertaForm.get('titulo')?.touched">
            <ion-label position="stacked">Título de Sesión / Alerta *</ion-label>
            <ion-input type="text" formControlName="titulo" placeholder="Ej. Segunda Sesión - Terapia"></ion-input>
          </ion-item>
          <span class="validation-error" *ngIf="alertaForm.get('titulo')?.invalid && alertaForm.get('titulo')?.touched">
            El título es requerido.
          </span>

          <ion-item class="clinical-input">
            <ion-label position="stacked">Notas Privadas (Opcional)</ion-label>
            <ion-textarea formControlName="descripcion" rows="3" placeholder="Anotaciones para el recordatorio..."></ion-textarea>
          </ion-item>

          <ion-item class="clinical-input" lines="none" style="margin-bottom: 24px;">
            <ion-label style="font-weight: 700; color: var(--clr-text-secondary); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em;">Notificar por Correo</ion-label>
            <ion-toggle formControlName="notificar_email" slot="end" class="clinical-toggle"></ion-toggle>
          </ion-item>

          <ion-button expand="block" type="submit" [disabled]="alertaForm.invalid || isSubmitting" class="clinical-btn-tertiary">
            <ion-spinner *ngIf="isSubmitting" name="crescent" color="light" style="margin-right: 8px;"></ion-spinner>
            <span>Programar Alerta</span>
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .clinical-toolbar {
      --background: var(--clr-surface-2);
      --color: var(--clr-text);
      border-bottom: 1px solid var(--clr-border);
      padding-top: 8px;
    }
    .clinical-modal-bg {
      --background: var(--clr-bg);
      --color: var(--clr-text);
    }
    .clinical-input {
      --background: var(--clr-card) !important;
      --border-radius: 12px;
      --border-color: var(--clr-border) !important;
      --border-style: solid;
      --border-width: 1px;
      margin-bottom: 18px;
      box-shadow: var(--shadow-card);
      --padding-start: 16px;
      --padding-bottom: 8px;
      --padding-top: 8px;
      --color: var(--clr-text);
      color: var(--clr-text);

      ion-label { 
        color: var(--clr-text-secondary) !important; 
        font-weight: 700; 
        margin-bottom: 6px;
        font-size: 0.85rem !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      ion-input, ion-textarea { 
        --color: var(--clr-text) !important; 
        color: var(--clr-text) !important; 
        font-weight: 500;
      }
    }
    .clinical-toggle {
      --handle-background: var(--clr-surface);
      --handle-background-checked: #ffffff;
      --background: var(--clr-input-bd);
      --background-checked: var(--clr-accent);
    }
    .validation-error {
      color: var(--clr-danger);
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: -12px;
      margin-bottom: 14px;
      padding-left: 6px;
      display: block;
      animation: fadeIn 0.2s ease both;
    }
    .clinical-btn-tertiary {
      --background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
      --border-radius: var(--radius-md);
      --color: #ffffff;
      margin-top: 24px;
      font-weight: 800;
      height: 50px;
      box-shadow: 0 4px 15px rgba(155, 89, 182, 0.35);
      
      &[disabled] {
        opacity: 0.5;
      }
    }
    .fade-in { animation: fadeIn 0.4s ease both; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AgendaModalComponent implements OnInit {
  @Input() selectedDate?: string;
  @Input() pacienteId?: string;

  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);

  isSubmitting = false;

  alertaForm: FormGroup = this.fb.group({
    fecha_programada: ['', [Validators.required]],
    titulo: ['', [Validators.required]],
    descripcion: [''],
    notificar_email: [true]
  });

  ngOnInit() {
    if (this.selectedDate) {
      // Input might be date only, but datetime-local needs T00:00 or similar
      this.alertaForm.patchValue({
        fecha_programada: this.selectedDate + 'T09:00'
      });
    }
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onAlertaSubmit() {
    if (this.alertaForm.valid) {
      this.isSubmitting = true;
      const payload = { ...this.alertaForm.value, paciente_id: this.pacienteId };
      
      this.pacienteService.createAlerta(payload).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal({ type: 'alerta', data: res.data });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.closeModal({ error: 'Error al crear alerta' });
        }
      });
    }
  }
}
