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
          
          <ion-item class="clinical-input">
            <ion-label position="stacked">Fecha y Hora Programada *</ion-label>
            <ion-input type="datetime-local" formControlName="fecha_programada"></ion-input>
          </ion-item>

          <ion-item class="clinical-input">
            <ion-label position="stacked">Título de Sesión / Alerta *</ion-label>
            <ion-input type="text" formControlName="titulo" placeholder="Ej. Segunda Sesión - Terapia"></ion-input>
          </ion-item>

          <ion-item class="clinical-input">
            <ion-label position="stacked">Notas Privadas (Opcional)</ion-label>
            <ion-textarea formControlName="descripcion" rows="3" placeholder="Anotaciones para el recordatorio..."></ion-textarea>
          </ion-item>

          <ion-item class="clinical-input" lines="none" style="margin-bottom: 24px;">
            <ion-label style="font-weight: 600;">Notificar por Correo</ion-label>
            <ion-toggle formControlName="notificar_email" slot="end"></ion-toggle>
          </ion-item>

          <ion-button expand="block" type="submit" [disabled]="alertaForm.invalid || isSubmitting" class="clinical-btn-tertiary">
            <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
            <span *ngIf="!isSubmitting">Programar Alerta</span>
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .clinical-toolbar {
      --background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      color: #2c3e50;
      padding-top: 8px;
    }
    .clinical-modal-bg {
      --background: #f8f9fa;
    }
    .clinical-input {
      --background: #ffffff;
      --border-radius: 12px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      --padding-start: 16px;
      --color: #2c3e50;
      color: #2c3e50;
      ion-label { color: #7f8c8d; font-weight: 600; margin-bottom: 8px;}
      ion-input, ion-textarea { --color: #2c3e50; color: #2c3e50; }
    }
    .clinical-btn-tertiary {
      --background: #9b59b6;
      --border-radius: 12px;
      margin-top: 24px;
      font-weight: 700;
      height: 48px;
    }
    .fade-in { animation: fadeIn 0.4s ease both; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
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
