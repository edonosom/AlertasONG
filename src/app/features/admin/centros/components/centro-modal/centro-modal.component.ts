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
      <ion-toolbar class="modal-toolbar">
        <ion-title>{{ isEditMode ? 'Editar Centro Médico' : 'Nuevo Centro Médico' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content-bg">
      <div class="form-wrapper">
        <div class="form-header-text">
          <p>Complete los datos para registrar la sucursal o proyecto en el sistema.</p>
        </div>

        <form [formGroup]="centroForm" (ngSubmit)="onSubmit()" class="tw-form">
          
          <div class="tw-input-group">
            <label>Nombre del Centro <span>*</span></label>
            <div class="tw-input-wrapper" [class.error]="centroForm.controls['nombre'].invalid && centroForm.controls['nombre'].touched">
              <input type="text" formControlName="nombre" placeholder="Ej. Administracion Central">
            </div>
            @if (centroForm.controls['nombre'].invalid && centroForm.controls['nombre'].touched) {
              <span class="tw-error-text">El nombre es requerido</span>
            }
          </div>
          
          <div class="tw-input-group">
            <label>Código del Centro <span>*</span></label>
            <div class="tw-input-wrapper" [class.error]="centroForm.controls['codigo'].invalid && centroForm.controls['codigo'].touched">
              <input type="text" formControlName="codigo" placeholder="Ej. 7037">
            </div>
            @if (centroForm.controls['codigo'].invalid && centroForm.controls['codigo'].touched) {
              <span class="tw-error-text">El código es requerido</span>
            }
          </div>

          <div class="tw-form-actions">
            <button type="button" class="tw-btn-secondary" (click)="closeModal()" [disabled]="isSubmitting">
              Cancelar
            </button>
            <button type="submit" class="tw-btn-primary" [disabled]="centroForm.invalid || isSubmitting">
              @if (isSubmitting) {
                <div class="tw-spinner"></div>
              } @else {
                {{ isEditMode ? 'Guardar Cambios' : 'Crear Centro' }}
              }
            </button>
          </div>

        </form>
      </div>
    </ion-content>
  `,
  styles: [`
    .modal-toolbar {
      --background: #0A1518;
      --border-color: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: #EEF4F4;
    }
    ion-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: -0.02em;
    }
    .close-btn {
      --color: #7AA8A8;
    }
    .close-btn:hover {
      --color: #EEF4F4;
    }
    
    .modal-content-bg {
      --background: #060E10;
    }
    
    .form-wrapper {
      padding: 24px;
      font-family: 'Outfit', 'Inter', sans-serif;
    }
    .form-header-text {
      margin-bottom: 24px;
    }
    .form-header-text p {
      color: #7AA8A8;
      font-size: 0.9rem;
      margin: 0;
    }

    .tw-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tw-input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tw-input-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #EEF4F4;
    }
    .tw-input-group label span {
      color: #DC2626;
    }

    .tw-input-wrapper {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 0 16px;
      height: 52px;
      transition: all 0.2s ease;
    }
    .tw-input-wrapper:focus-within {
      border-color: #0D9288;
      background: rgba(13,146,136,0.03);
      box-shadow: 0 0 0 3px rgba(13,146,136,0.1);
    }
    .tw-input-wrapper.error {
      border-color: #DC2626;
      background: rgba(220,38,38,0.03);
    }

    .tw-input-wrapper input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #EEF4F4;
      font-size: 0.95rem;
      font-family: 'Outfit', sans-serif;
      height: 100%;
      width: 100%;
    }
    .tw-input-wrapper input::placeholder {
      color: rgba(122,168,168,0.4);
    }

    .tw-error-text {
      font-size: 0.75rem;
      color: #FF6B7A;
      margin-left: 4px;
    }

    .tw-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .tw-btn-secondary, .tw-btn-primary {
      height: 48px;
      padding: 0 24px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Outfit', sans-serif;
    }
    
    .tw-btn-secondary {
      background: rgba(255,255,255,0.05);
      color: #EEF4F4;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .tw-btn-secondary:hover:not(:disabled) {
      background: rgba(255,255,255,0.08);
    }

    .tw-btn-primary {
      background: #0D9288;
      color: #fff;
      border: none;
      box-shadow: 0 4px 16px rgba(13,146,136,0.25);
    }
    .tw-btn-primary:hover:not(:disabled) {
      background: #0A6E6A;
      box-shadow: 0 6px 20px rgba(13,146,136,0.35);
      transform: translateY(-1px);
    }
    .tw-btn-primary:active:not(:disabled) {
      transform: translateY(0);
    }
    .tw-btn-primary:disabled, .tw-btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tw-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
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
