import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PacienteService, Paciente } from '../../../../core/services/paciente.service';

@Component({
  selector: 'app-paciente-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="clinical-toolbar">
        <ion-title>{{ paciente ? 'Editar Paciente' : 'Nuevo Paciente' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()" color="medium">
            <ion-icon name="close" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="clinical-modal-bg ion-padding">
      <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()">
        <ion-item class="clinical-input">
          <ion-label position="stacked">RUT *</ion-label>
          <ion-input type="text" formControlName="rut" placeholder="Ej. 12.345.678-9" [readonly]="!!paciente"></ion-input>
        </ion-item>
        
        <ion-item class="clinical-input">
          <ion-label position="stacked">Nombre *</ion-label>
          <ion-input type="text" formControlName="nombre" placeholder="Ej. Juan"></ion-input>
        </ion-item>
        
        <ion-item class="clinical-input">
          <ion-label position="stacked">Apellido *</ion-label>
          <ion-input type="text" formControlName="apellido" placeholder="Ej. Pérez"></ion-input>
        </ion-item>

        <ion-item class="clinical-input">
          <ion-label position="stacked">Fecha de Nacimiento *</ion-label>
          <ion-input type="date" formControlName="fecha_nacimiento"></ion-input>
        </ion-item>

        <ion-item class="clinical-input">
          <ion-label position="stacked">Complejidad (Opcional)</ion-label>
          <ion-select formControlName="complejidad" interface="popover">
            <ion-select-option value="baja">Baja</ion-select-option>
            <ion-select-option value="media">Media</ion-select-option>
            <ion-select-option value="alta">Alta</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="pacienteForm.invalid || isSubmitting" class="clinical-btn-primary">
          <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
          <span *ngIf="!isSubmitting">{{ paciente ? 'Guardar Cambios' : 'Crear y Auto-Asignar' }}</span>
        </ion-button>
      </form>
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
      ion-input, ion-select, ion-textarea { --color: #2c3e50; color: #2c3e50; }
      ion-input[readonly] { opacity: 0.7; }
    }
    .clinical-btn-primary {
      --background: #3498db;
      --border-radius: 12px;
      margin-top: 24px;
      font-weight: 700;
      height: 48px;
    }
  `]
})
export class PacienteModalComponent implements OnInit {
  @Input() paciente?: Paciente;

  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);

  isSubmitting = false;

  pacienteForm: FormGroup = this.fb.group({
    rut: ['', [Validators.required, Validators.pattern(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/i)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    fecha_nacimiento: ['', [Validators.required]],
    complejidad: ['']
  });

  ngOnInit() {
    if (this.paciente) {
      this.pacienteForm.patchValue({
        rut: this.paciente.rut,
        nombre: this.paciente.nombre,
        apellido: this.paciente.apellido,
        fecha_nacimiento: this.paciente.fecha_nacimiento,
        complejidad: this.paciente.complejidad || ''
      });
      // El RUT no se edita en este sistema por seguridad referencial
      this.pacienteForm.get('rut')?.disable();
    }
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onSubmit() {
    if (this.pacienteForm.valid) {
      this.isSubmitting = true;
      const payload = { ...this.pacienteForm.getRawValue() }; // getRawValue to include disabled fields if needed
      
      if (!this.paciente) {
        // Create
        if (payload.rut) payload.rut = payload.rut.replace(/\./g, '');
        this.pacienteService.createPaciente(payload).subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            this.closeModal({ data: res.data });
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.closeModal({ error: err.error?.message || 'Error al crear paciente' });
          }
        });
      } else {
        // Update
        this.pacienteService.updatePaciente(this.paciente.id, payload).subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            this.closeModal({ data: res.data });
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.closeModal({ error: err.error?.message || 'Error al actualizar paciente' });
          }
        });
      }
    }
  }
}
