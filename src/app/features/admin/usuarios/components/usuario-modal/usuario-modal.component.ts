import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { CentroService, Centro } from '../../../../../core/services/centro.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="clinical-toolbar">
        <ion-title>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="closeModal()">Cancelar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding clinical-modal-bg">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <ion-item class="clinical-input">
          <ion-label position="stacked">Nombre *</ion-label>
          <ion-input type="text" formControlName="nombre" placeholder="Ej. Juan"></ion-input>
        </ion-item>
        
        <ion-item class="clinical-input">
          <ion-label position="stacked">Apellido *</ion-label>
          <ion-input type="text" formControlName="apellido" placeholder="Ej. Pérez"></ion-input>
        </ion-item>

        <ion-item class="clinical-input">
          <ion-label position="stacked">RUT *</ion-label>
          <ion-input type="text" formControlName="rut" placeholder="Ej. 12.345.678-9" [readonly]="isEditMode"></ion-input>
        </ion-item>

        <ion-item class="clinical-input">
          <ion-label position="stacked">Correo Electrónico *</ion-label>
          <ion-input type="email" formControlName="email" placeholder="Ej. juan@ong.cl"></ion-input>
        </ion-item>

        <ion-item class="clinical-input">
          <ion-label position="stacked">Rol *</ion-label>
          <ion-select formControlName="rol" interface="popover">
            @for (opcion of rolesDisponibles(); track opcion.value) {
              <ion-select-option [value]="opcion.value">{{ opcion.label }}</ion-select-option>
            }
          </ion-select>
        </ion-item>

        <ion-item class="clinical-input slide-down" *ngIf="needsCentro()">
          <ion-label position="stacked">Asignar a Centro Médico *</ion-label>
          <ion-select formControlName="centro_id" interface="popover" placeholder="Selecciona un centro">
            <ion-select-option *ngFor="let centro of centros()" [value]="centro.id">
              {{ centro.nombre }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="userForm.invalid || isSubmitting" class="clinical-btn-primary">
          <ion-spinner *ngIf="isSubmitting" name="crescent"></ion-spinner>
          <span *ngIf="!isSubmitting">{{ isEditMode ? 'Guardar Cambios' : 'Guardar Usuario' }}</span>
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
    .slide-down {
      animation: slideDown 0.3s ease-out forwards;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class UsuarioModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly centroService = inject(CentroService);
  private readonly modalCtrl = inject(ModalController);
  private readonly authService = inject(AuthService);

  usuarioData: any = null; // Passed via componentProps
  isEditMode = false;

  centros = signal<Centro[]>([]);
  isSubmitting = false;

  // Roles disponibles calculados segun el rol del usuario autenticado
  rolesDisponibles = computed(() => {
    const authUser = this.authService.currentUser();
    const rolAuth = (authUser?.rol as any)?.value ?? authUser?.rol ?? '';
    const todosLosRoles = [
      { value: 'root', label: 'Super Administrador' },
      { value: 'admin', label: 'Administrador Global' },
      { value: 'director', label: 'Director de Centro' },
      { value: 'funcionario', label: 'Funcionario Clínico' },
    ];
    if (rolAuth === 'root') return todosLosRoles;
    // admin: solo puede crear director y funcionario
    return todosLosRoles.filter(r => r.value === 'director' || r.value === 'funcionario');
  });

  userForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    rut: ['', [Validators.required, Validators.pattern(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/i)]],
    email: ['', [Validators.required, Validators.email]],
    rol: ['', [Validators.required]],
    centro_id: [null]
  });

  ngOnInit() {
    this.centroService.getCentros().subscribe({
      next: (res) => this.centros.set(res.data)
    });

    this.userForm.get('rol')?.valueChanges.subscribe(rol => {
      const centroControl = this.userForm.get('centro_id');
      if (rol === 'director' || rol === 'funcionario') {
        centroControl?.setValidators([Validators.required]);
      } else {
        centroControl?.clearValidators();
        centroControl?.setValue(null);
      }
      centroControl?.updateValueAndValidity();
    });

    if (this.usuarioData) {
      this.isEditMode = true;
      this.userForm.patchValue({
        nombre: this.usuarioData.nombre,
        apellido: this.usuarioData.apellido,
        rut: this.usuarioData.rut,
        email: this.usuarioData.email,
        rol: this.usuarioData.rol?.value || this.usuarioData.rol
      });
      this.userForm.get('rut')?.disable(); // Prevent changing rut
    }
  }

  needsCentro(): boolean {
    const rol = this.userForm.get('rol')?.value;
    return (rol === 'director' || rol === 'funcionario') && !this.isEditMode; // Simplified for edit mode (don't re-assign easily here)
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      
      const payload = { ...this.userForm.getRawValue() }; // getRawValue captures disabled fields (rut)
      if (payload.rut && !this.isEditMode) {
        payload.rut = payload.rut.replace(/\./g, '');
      }

      const request$ = this.isEditMode
        ? this.usuarioService.updateUsuario(this.usuarioData.id, payload)
        : this.usuarioService.createUsuario(payload);

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
