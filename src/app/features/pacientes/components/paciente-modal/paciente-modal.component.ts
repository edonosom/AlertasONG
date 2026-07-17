import { Component, inject, OnInit, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { PacienteService, Paciente } from '../../../../core/services/paciente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CentroService, Centro } from '../../../../core/services/centro.service';
import { UsuarioService } from '../../../../core/services/usuario.service';

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
      <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()" class="modal-form-grid">
        
        <!-- Fila 1: Nombre y Apellido -->
        <div class="form-row">
          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('nombre')?.invalid && pacienteForm.get('nombre')?.touched">
              <ion-label position="stacked">Nombre *</ion-label>
              <ion-input type="text" formControlName="nombre" placeholder="Ej. Juan Andrés"></ion-input>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('nombre')?.invalid && pacienteForm.get('nombre')?.touched">
              El nombre es requerido.
            </span>
          </div>
          
          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('apellido')?.invalid && pacienteForm.get('apellido')?.touched">
              <ion-label position="stacked">Apellido *</ion-label>
              <ion-input type="text" formControlName="apellido" placeholder="Ej. Pérez"></ion-input>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('apellido')?.invalid && pacienteForm.get('apellido')?.touched">
              El apellido es requerido.
            </span>
          </div>
        </div>

        <!-- Fila 2: RUT y Fecha de Nacimiento -->
        <div class="form-row">
          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('rut')?.invalid && pacienteForm.get('rut')?.touched">
              <ion-label position="stacked">RUT *</ion-label>
              <ion-input type="text" formControlName="rut" placeholder="Ej. 12.345.678-9" [readonly]="!!paciente"></ion-input>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('rut')?.invalid && pacienteForm.get('rut')?.touched">
              RUT inválido. Formato: 12.345.678-9 o 12345678-9
            </span>
          </div>

          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('fecha_nacimiento')?.invalid && pacienteForm.get('fecha_nacimiento')?.touched">
              <ion-label position="stacked">Fecha de Nacimiento *</ion-label>
              <ion-input type="date" formControlName="fecha_nacimiento"></ion-input>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('fecha_nacimiento')?.invalid && pacienteForm.get('fecha_nacimiento')?.touched">
              La fecha de nacimiento es requerida.
            </span>
          </div>
        </div>

        <!-- Fila 3: Centro y Funcionario (Solo para Admin / Director) -->
        <div class="form-row" *ngIf="!isFuncionario()">
          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('centro_id')?.invalid && pacienteForm.get('centro_id')?.touched">
              <ion-label position="stacked">Centro Médico / Sede *</ion-label>
              <select formControlName="centro_id" (change)="onCentroChange($event)" class="modal-native-select">
                <option [value]="null" disabled selected>Seleccione un Centro...</option>
                @for (centro of centros(); track centro.id) {
                  <option [value]="centro.id">{{ centro.nombre }}</option>
                }
              </select>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('centro_id')?.invalid && pacienteForm.get('centro_id')?.touched">
              Debe seleccionar un Centro Médico.
            </span>
          </div>

          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('funcionario_id')?.invalid && pacienteForm.get('funcionario_id')?.touched">
              <ion-label position="stacked">Funcionario Asignado *</ion-label>
              <select formControlName="funcionario_id" (change)="onFuncionarioChange($event)" class="modal-native-select">
                <option [value]="null" disabled selected>Seleccione un Funcionario...</option>
                @for (func of filteredFuncionarios(); track func.id) {
                  <option [value]="func.id">{{ func.nombre }} {{ func.apellido }}</option>
                }
              </select>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('funcionario_id')?.invalid && pacienteForm.get('funcionario_id')?.touched">
              Debe asignar un Funcionario Clínico.
            </span>
          </div>
        </div>

        <!-- Fila 4: Complejidad -->
        <div class="form-row">
          <div class="form-col half-width">
            <ion-item class="clinical-input">
              <ion-label position="stacked">Complejidad (Opcional)</ion-label>
              <select formControlName="complejidad" class="modal-native-select">
                <option value="">Sin definir</option>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </ion-item>
          </div>
          <!-- Espacio de alineación en desktop -->
          <div class="form-col" *ngIf="!isFuncionario() || paciente"></div>
        </div>

        <!-- Fila 5: Motor de Alertas (Solo Nuevo Paciente) -->
        <div class="form-row" *ngIf="!paciente">
          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('numero_fase')?.invalid && pacienteForm.get('numero_fase')?.touched">
              <ion-label position="stacked">Ciclo Actual</ion-label>
              <select formControlName="numero_fase" class="modal-native-select">
                <option value="1">Ciclo 1</option>
                <option value="2">Ciclo 2</option>
                <option value="3">Ciclo 3</option>
                <option value="4">Ciclo 4</option>
                <option value="5">Ciclo 5</option>
              </select>
            </ion-item>
          </div>

          <div class="form-col">
            <ion-item class="clinical-input" [class.ion-invalid]="pacienteForm.get('dias_transcurridos')?.invalid && pacienteForm.get('dias_transcurridos')?.touched">
              <ion-label position="stacked">Días Transcurridos en Ciclo</ion-label>
              <ion-input type="number" min="0" max="90" formControlName="dias_transcurridos"></ion-input>
            </ion-item>
            <span class="validation-error" *ngIf="pacienteForm.get('dias_transcurridos')?.invalid && pacienteForm.get('dias_transcurridos')?.touched">
              Debe ser un número entre 0 y 90.
            </span>
          </div>
        </div>

        <!-- Acciones del Formulario -->
        <div class="form-actions">
          <button type="button" class="btn-ghost-modal" (click)="closeModal()">Cancelar</button>
          <button type="submit" [disabled]="pacienteForm.invalid || isSubmitting" class="btn-primary-modal">
            <ion-spinner *ngIf="isSubmitting" name="crescent" color="light" style="margin-right: 8px;"></ion-spinner>
            <span>{{ paciente ? 'Guardar Cambios' : 'Crear Paciente' }}</span>
          </button>
        </div>

      </form>
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
    .modal-form-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      @media (min-width: 600px) {
        flex-direction: row;
        gap: 20px;
      }
    }
    .form-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      &.half-width {
        @media (min-width: 600px) {
          flex: 0 0 calc(50% - 10px);
        }
      }
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
      
      ion-input { 
        --color: var(--clr-text) !important; 
        color: var(--clr-text) !important; 
        font-weight: 500;
      }
      
      ion-input[readonly] { 
        opacity: 0.5; 
      }
    }
    .modal-native-select {
      background: transparent;
      border: none;
      outline: none;
      color: var(--clr-text) !important;
      font-size: 0.95rem;
      font-weight: 500;
      height: 38px;
      width: 100%;
      cursor: pointer;
      font-family: inherit;
      padding: 0;
      margin-top: 4px;
      
      option {
        background: var(--clr-surface-2);
        color: var(--clr-text);
      }
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
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 24px;
      border-top: 1px solid var(--clr-border);
    }
    .btn-ghost-modal, .btn-primary-modal {
      height: 48px;
      padding: 0 24px;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: var(--t-base);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      outline: none;
    }
    .btn-ghost-modal {
      background: var(--clr-input-bg);
      color: var(--clr-text-secondary);
      border: 1px solid var(--clr-border);
      
      &:hover {
        background: var(--clr-card-hover);
        color: var(--clr-text);
      }
    }
    .btn-primary-modal {
      background: linear-gradient(135deg, var(--clr-accent) 0%, #0A6E6A 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 16px var(--clr-accent-glow);
      
      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px var(--clr-accent-glow);
        transform: translateY(-1px);
      }
      &:active:not(:disabled) {
        transform: translateY(0);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PacienteModalComponent implements OnInit {
  @Input() paciente?: Paciente;

  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly modalCtrl = inject(ModalController);
  private readonly authService = inject(AuthService);
  private readonly centroService = inject(CentroService);
  private readonly usuarioService = inject(UsuarioService);

  isSubmitting = false;
  centros = signal<Centro[]>([]);
  allFuncionarios = signal<any[]>([]);

  currentUser = this.authService.currentUser;
  isFuncionario = computed(() => {
    const u = this.currentUser();
    const r = typeof u?.rol === 'object' ? (u?.rol as any)?.value : u?.rol;
    return r === 'funcionario';
  });

  filteredFuncionarios = computed(() => {
    const list = this.allFuncionarios();
    const cId = this.pacienteForm.get('centro_id')?.value;
    if (!cId || cId === 'null') return list;
    return list.filter(u => {
      const uCId = u.centro_id || u.centro?.id;
      return uCId === cId;
    });
  });

  pacienteForm: FormGroup = this.fb.group({
    rut: ['', [Validators.required, Validators.pattern(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK])$/i)]],
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    fecha_nacimiento: ['', [Validators.required]],
    complejidad: [''],
    centro_id: [null],
    funcionario_id: [null],
    numero_fase: [1, [Validators.min(1), Validators.max(5)]],
    dias_transcurridos: [0, [Validators.min(0), Validators.max(90)]]
  });

  ngOnInit() {
    if (!this.isFuncionario()) {
      this.pacienteForm.get('centro_id')?.setValidators([Validators.required]);
      this.pacienteForm.get('funcionario_id')?.setValidators([Validators.required]);

      this.centroService.getCentros().subscribe({
        next: (res) => this.centros.set(res.data)
      });

      this.usuarioService.getUsuarios().subscribe({
        next: (res) => {
          const list = (res.data as any[]).filter(u => {
            const r = typeof u.rol === 'object' ? u.rol?.value : u.rol;
            return r === 'funcionario' && u.activo;
          });
          this.allFuncionarios.set(list);
        }
      });
    }

    if (this.paciente) {
      const activeAsg = this.paciente.asignaciones?.find((a: any) => a.activo);
      this.pacienteForm.patchValue({
        rut: this.paciente.rut,
        nombre: this.paciente.nombre,
        apellido: this.paciente.apellido,
        fecha_nacimiento: this.paciente.fecha_nacimiento ? this.paciente.fecha_nacimiento.substring(0, 10) : '',
        complejidad: this.paciente.complejidad || '',
        centro_id: activeAsg?.centro_id || null,
        funcionario_id: activeAsg?.funcionario_id || null
      });
      this.pacienteForm.get('rut')?.disable();
    }
  }

  onFuncionarioChange(event: any) {
    const fId = event.target.value;
    if (fId && fId !== 'null') {
      const funcionario = this.allFuncionarios().find(u => u.id === fId);
      if (funcionario) {
        const cId = funcionario.centro_id || funcionario.centro?.id;
        if (cId) {
          this.pacienteForm.get('centro_id')?.setValue(cId, { emitEvent: false });
        }
      }
    }
  }

  onCentroChange(event: any) {
    const cId = event.target.value;
    const currentFId = this.pacienteForm.get('funcionario_id')?.value;
    if (currentFId && currentFId !== 'null') {
      const funcionario = this.allFuncionarios().find(u => u.id === currentFId);
      const uCId = funcionario?.centro_id || funcionario?.centro?.id;
      if (uCId !== cId) {
        this.pacienteForm.get('funcionario_id')?.setValue(null);
      }
    }
  }

  closeModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  onSubmit() {
    if (this.pacienteForm.valid) {
      this.isSubmitting = true;
      const payload = { ...this.pacienteForm.getRawValue() };
      
      if (!this.paciente) {
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
