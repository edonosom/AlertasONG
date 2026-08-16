import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  template: `
    <div class="login-wrapper">
      <div class="left-panel">
        <div class="left-content fade-in-up">
          <div class="brand">
            <div class="logo-box">
              <img src="assets/icon/favicon.png" alt="Alertas ONG Surcos">
            </div>
            <span class="brand-text">Alertas ONG Surcos</span>
          </div>
          <div class="welcome-text">
            <h2>Nueva<br>Contraseña</h2>
            <p>Ingresa tu nueva contraseña para acceder al sistema.</p>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="form-container slide-left">
          <div class="mobile-logo">
            <div class="logo-box">
              <img src="assets/icon/favicon.png" alt="Alertas ONG Surcos">
            </div>
          </div>
          <div class="form-header">
            <h1>Restablecer Contraseña</h1>
            <p>Por favor, ingresa una contraseña segura.</p>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="input-group">
              <label>Nueva Contraseña</label>
              <div class="input-wrapper" [class.focused]="passFocused" [class.error]="resetForm.controls.password.invalid && resetForm.controls.password.touched">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password" 
                  placeholder="••••••••"
                  (focus)="passFocused = true"
                  (blur)="passFocused = false">
                <button type="button" class="eye-btn" (click)="togglePassword()">
                  @if (showPassword()) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  }
                </button>
              </div>
              @if (resetForm.controls.password.invalid && resetForm.controls.password.touched) {
                <span class="error-text">La contraseña debe tener al menos 8 caracteres</span>
              }
            </div>

            <div class="input-group">
              <label>Confirmar Contraseña</label>
              <div class="input-wrapper" [class.focused]="passConfirmFocused" [class.error]="resetForm.controls.password_confirmation.invalid && resetForm.controls.password_confirmation.touched">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  [type]="showPasswordConfirm() ? 'text' : 'password'" 
                  formControlName="password_confirmation" 
                  placeholder="••••••••"
                  (focus)="passConfirmFocused = true"
                  (blur)="passConfirmFocused = false">
                <button type="button" class="eye-btn" (click)="togglePasswordConfirm()">
                  @if (showPasswordConfirm()) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  }
                </button>
              </div>
              @if (resetForm.hasError('mismatch')) {
                <span class="error-text">Las contraseñas no coinciden</span>
              }
            </div>

            @if (errorMessage()) {
              <div class="auth-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="auth-success" style="background: rgba(5,150,105,0.1); color: #059669; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid rgba(5,150,105,0.2);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; margin-bottom: -3px; margin-right: 4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ successMessage() }}
              </div>
            }

            <button type="submit" class="submit-btn" [disabled]="isLoading() || resetForm.invalid">
              @if (isLoading()) {
                <div class="spinner"></div>
              } @else {
                Guardar Contraseña
              }
            </button>
            
            <div class="forgot-password-link" style="text-align: center; margin-top: 20px;">
              <a routerLink="/auth/login">Ir al inicio de sesión</a>
            </div>

          </form>
          
          <div class="footer-area">
            <p>© 2026 ONG Surcos. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  passFocused = false;
  passConfirmFocused = false;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  showPassword = signal(false);
  showPasswordConfirm = signal(false);

  email = '';
  token = '';

  resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (!this.email || !this.token) {
        this.errorMessage.set('Enlace inválido o expirado.');
      }
    });
  }

  togglePassword() {
    this.showPassword.update(s => !s);
  }

  togglePasswordConfirm() {
    this.showPasswordConfirm.update(s => !s);
  }

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('password_confirmation').value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.email && this.token) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const payload = {
        email: this.email,
        token: this.token,
        password: this.resetForm.controls.password.value,
        password_confirmation: this.resetForm.controls.password_confirmation.value
      };

      this.authService.resetPassword(payload).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.successMessage.set(res.message || 'Contraseña restablecida correctamente.');
          this.resetForm.reset();
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al restablecer contraseña.');
        }
      });
    }
  }
}
