import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { IonInput, IonItem, IonList, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonInput, IonItem, IonList, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle],
  template: `
    <ion-card class="glass-panel">
      <ion-card-header>
        <ion-card-title>Registrar Paciente</ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()">
          
          <ion-item class="ion-margin-bottom" lines="none">
            <ion-input
              label="Nombre Completo"
              labelPlacement="floating"
              formControlName="nombre"
              type="text"
              placeholder="Ej. Juan Pérez"
            ></ion-input>
          </ion-item>
          
          <!-- Mensaje de error inline -->
          <div class="inline-error-message" *ngIf="isFieldInvalid('nombre')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>El nombre es obligatorio y debe tener al menos 3 caracteres.</span>
          </div>

          <ion-item class="ion-margin-bottom" lines="none">
            <ion-input
              label="RUT"
              labelPlacement="floating"
              formControlName="rut"
              type="text"
              placeholder="Ej. 12345678-9"
            ></ion-input>
          </ion-item>

          <!-- Mensaje de error inline -->
          <div class="inline-error-message" *ngIf="isFieldInvalid('rut')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>Ingrese un RUT válido.</span>
          </div>

          <ion-button expand="block" type="submit" [disabled]="pacienteForm.invalid" class="ion-margin-top submit-btn">
            Guardar Paciente
          </ion-button>

        </form>
      </ion-card-content>
    </ion-card>
  `,
  styles: [`
    ion-card {
      margin: 16px 0;
    }
    ion-item {
      --background: rgba(var(--ion-color-step-100-rgb), 0.5);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--ion-color-step-150);
      transition: border-color 0.3s;
    }
    ion-item.ion-touched.ion-invalid {
      border-color: var(--ion-color-danger);
    }
    ion-item.ion-touched.ion-valid {
      border-color: var(--ion-color-success);
    }
    .submit-btn {
      --border-radius: var(--border-radius-md);
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `]
})
export class PacienteFormComponent {
  private fb = inject(NonNullableFormBuilder);

  pacienteForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    rut: ['', [Validators.required, Validators.pattern(/^[0-9]+-[0-9kK]{1}$/)]] // Patrón básico, en una app real se usa validador custom de módulo de RUT
  });

  isFieldInvalid(fieldName: string): boolean {
    const field = this.pacienteForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit() {
    if (this.pacienteForm.valid) {
      console.log('Formulario válido', this.pacienteForm.value);
      // Aquí se llamaría al servicio para guardar
    } else {
      this.pacienteForm.markAllAsTouched();
    }
  }
}
