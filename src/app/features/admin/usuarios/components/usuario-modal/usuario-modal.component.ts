import { Component, OnInit, inject, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { CentroService, Centro } from '../../../../../core/services/centro.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { AdminApiService } from '../../../../../core/services/admin-api.service';
import { switchMap, of, forkJoin, catchError } from 'rxjs';

@Component({
  selector: 'app-usuario-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="modal-toolbar">
        <ion-title>{{ isEditMode ? 'Editar Perfil de Funcionario' : 'Nuevo Funcionario Clínico' }}</ion-title>
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
          <p>Complete la información personal y asigne los permisos correspondientes.</p>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="tw-form">
          
          <div class="tw-row">
            <div class="tw-col">
              <div class="tw-input-group">
                <label>Nombres <span>*</span></label>
                <div class="tw-input-wrapper" [class.error]="userForm.controls['nombre'].invalid && userForm.controls['nombre'].touched">
                  <input type="text" formControlName="nombre" placeholder="Ej. Juan Andrés">
                </div>
                @if (userForm.controls['nombre'].invalid && userForm.controls['nombre'].touched) {
                  <span class="tw-error-text">Requerido</span>
                }
              </div>
            </div>

            <div class="tw-col">
              <div class="tw-input-group">
                <label>Apellidos <span>*</span></label>
                <div class="tw-input-wrapper" [class.error]="userForm.controls['apellido'].invalid && userForm.controls['apellido'].touched">
                  <input type="text" formControlName="apellido" placeholder="Ej. Pérez Gómez">
                </div>
                @if (userForm.controls['apellido'].invalid && userForm.controls['apellido'].touched) {
                  <span class="tw-error-text">Requerido</span>
                }
              </div>
            </div>
          </div>

          <div class="tw-row">
            <div class="tw-col">
              <div class="tw-input-group">
                <label>RUT <span>*</span></label>
                <div class="tw-input-wrapper" [class.error]="userForm.controls['rut'].invalid && userForm.controls['rut'].touched" [class.disabled]="isEditMode">
                  <input type="text" formControlName="rut" placeholder="Ej. 12.345.678-9" [readonly]="isEditMode">
                </div>
                @if (userForm.controls['rut'].invalid && userForm.controls['rut'].touched) {
                  <span class="tw-error-text">Formato inválido</span>
                }
              </div>
            </div>

            <div class="tw-col">
              <div class="tw-input-group">
                <label>Correo Electrónico <span>*</span></label>
                <div class="tw-input-wrapper" [class.error]="userForm.controls['email'].invalid && userForm.controls['email'].touched">
                  <input type="email" formControlName="email" placeholder="Ej. correo@ong.cl">
                </div>
                @if (userForm.controls['email'].invalid && userForm.controls['email'].touched) {
                  <span class="tw-error-text">Correo inválido</span>
                }
              </div>
            </div>
          </div>

          <div class="tw-row">
            <div class="tw-col">
              <div class="tw-input-group">
                <label>Rol de Sistema <span>*</span></label>
                <div class="tw-input-wrapper" [class.error]="userForm.controls['rol'].invalid && userForm.controls['rol'].touched">
                  <select formControlName="rol">
                    <option value="" disabled selected>Seleccione un rol...</option>
                    @for (opcion of rolesDisponibles(); track opcion.value) {
                      <option [value]="opcion.value">{{ opcion.label }}</option>
                    }
                  </select>
                  <div class="select-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>
            </div>
            
            @if (needsCentro()) {
              <div class="tw-col slide-down">
                <div class="tw-input-group">
                  <label>Asignar Centro Médico <span>*</span></label>
                  <div class="tw-input-wrapper" [class.error]="userForm.controls['centro_id'].invalid && userForm.controls['centro_id'].touched">
                    <select formControlName="centro_id">
                      <option value="null" disabled selected>Seleccione un centro...</option>
                      @for (centro of centros(); track centro.id) {
                        <option [value]="centro.id">{{ centro.nombre }}</option>
                      }
                    </select>
                    <div class="select-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="tw-form-actions">
            <button type="button" class="tw-btn-secondary" (click)="closeModal()" [disabled]="isSubmitting">
              Cancelar
            </button>
            <button type="submit" class="tw-btn-primary" [disabled]="userForm.invalid || isSubmitting">
              @if (isSubmitting) {
                <div class="tw-spinner"></div>
              } @else {
                {{ isEditMode ? 'Guardar Cambios' : 'Registrar Funcionario' }}
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

    .tw-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    @media (min-width: 600px) {
      .tw-row {
        flex-direction: row;
        gap: 20px;
      }
      .tw-col {
        flex: 1;
        min-width: 0;
      }
    }

    .tw-col {
      flex: 1;
      display: flex;
      flex-direction: column;
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
      position: relative;
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
    .tw-input-wrapper.disabled {
      opacity: 0.6;
      background: rgba(255,255,255,0.01);
      cursor: not-allowed;
    }

    .tw-input-wrapper input, .tw-input-wrapper select {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #EEF4F4;
      font-size: 0.95rem;
      font-family: 'Outfit', sans-serif;
      height: 100%;
      width: 100%;
      appearance: none;
    }
    .tw-input-wrapper select {
      cursor: pointer;
    }
    .tw-input-wrapper select option {
      background: #0A1518;
      color: #EEF4F4;
    }
    .tw-input-wrapper input::placeholder {
      color: rgba(122,168,168,0.4);
    }
    
    .select-arrow {
      position: absolute;
      right: 16px;
      pointer-events: none;
      color: #7AA8A8;
      display: flex;
      align-items: center;
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
  private readonly adminApiService = inject(AdminApiService);

  @Input() usuarioData: any = null; // Passed via componentProps
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
      let assignedCentroId = this.usuarioData.centro_id || this.usuarioData.centro?.id;
      
      const centrosRelation = this.usuarioData.centros_dirigidos || this.usuarioData.centrosDirigidos || this.usuarioData.centros;
      if (!assignedCentroId && centrosRelation && Array.isArray(centrosRelation) && centrosRelation.length > 0) {
        assignedCentroId = centrosRelation[0].id;
      }
      this.userForm.patchValue({
        nombre: this.usuarioData.nombre,
        apellido: this.usuarioData.apellido,
        rut: this.usuarioData.rut,
        email: this.usuarioData.email,
        rol: this.usuarioData.rol?.value || this.usuarioData.rol,
        centro_id: assignedCentroId || null
      });
      this.userForm.get('rut')?.disable(); // Prevent changing rut
    }
  }

  needsCentro(): boolean {
    const rol = this.userForm.get('rol')?.value;
    return (rol === 'director' || rol === 'funcionario');
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

      request$.pipe(
        switchMap((res: any) => {
          const userId = this.isEditMode ? this.usuarioData.id : res.data.id;
          const rol = payload.rol;
          const centroId = payload.centro_id;

          // Si el usuario es director y tiene un centro asignado, usamos el endpoint de admin
          if (rol === 'director' && centroId) {
            return this.adminApiService.asignarDirectorCentro(centroId, userId).pipe(
              catchError(() => of(res)), // Ignorar error de clave duplicada si ya está asignado
              switchMap(() => of(res))
            );
          }
          return of(res);
        })
      ).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.closeModal(res.data);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.closeModal({ error: err.error?.message || 'Error al guardar (Relación de Centro)' });
        }
      });
    }
  }
}
