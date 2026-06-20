import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CentroService } from '../../../../../core/services/centro.service';

@Component({
  selector: 'app-centro-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="clinical-toolbar">
        <ion-title>{{ isEditMode ? 'Editar Centro' : 'Nuevo Centro' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding clinical-modal-bg">
      <form [formGroup]="centroForm" (ngSubmit)="onSubmit()">
        <ion-item class="clinical-input">
          <ion-label position="stacked">Nombre del Centro *</ion-label>
          <ion-input type="text" formControlName="nombre" placeholder="Ej. CESFAM Norte"></ion-input>
        </ion-item>
        
        <ion-item class="clinical-input">
          <ion-label position="stacked">Código del Centro *</ion-label>
          <ion-input type="text" formControlName="codigo" placeholder="Ej. CES-001"></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="centroForm.invalid || isSubmitting" class="clinical-btn-primary">
          <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
          <span *ngIf="!isSubmitting">{{ isEditMode ? 'Guardar Cambios' : 'Guardar Centro' }}</span>
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [`
    .clinical-toolbar {
      --background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      color: #2c3e50;
      ion-title { font-weight: 700; letter-spacing: -0.5px; }
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
      ion-input, ion-select { --color: #2c3e50; color: #2c3e50; }
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
export class CentroModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly centroService = inject(CentroService);
  private readonly modalCtrl = inject(ModalController);
  
  centroData: any = null; // Passed via componentProps
  isEditMode = false;

  centroForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(255)]],
    codigo: ['', [Validators.required, Validators.maxLength(255)]]
  });

  isSubmitting = false;

  ngOnInit() {
    if (this.centroData) {
      this.isEditMode = true;
      this.centroForm.patchValue({
        nombre: this.centroData.nombre,
        codigo: this.centroData.codigo
      });
    }
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onSubmit() {
    if (this.centroForm.valid) {
      this.isSubmitting = true;
      
      const request$ = this.isEditMode 
        ? this.centroService.updateCentro(this.centroData.id, this.centroForm.value)
        : this.centroService.createCentro(this.centroForm.value);

      request$.subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal(res.data);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.closeModal({ error: err.error?.message || 'Error al guardar' });
        }
      });
    }
  }
}
