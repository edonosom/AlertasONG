import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  template: `
    <div class="login-wrapper">
      <div class="left-panel">
        <div class="left-content fade-in-up">
          <div class="brand">
            <div class="logo-box">
              <img src="assets/icon/favicon.png" alt="Alertas ONG Surco">
            </div>
            <span class="brand-text">Alertas ONG Surco</span>
          </div>
          <div class="welcome-text">
            <h2>Recuperación de<br>Contraseña</h2>
            <p>Ingresa tu correo para recibir un enlace de recuperación seguro.</p>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="form-container slide-left">
          <div class="mobile-logo">
            <div class="logo-box">
              <img src="assets/icon/favicon.png" alt="Alertas ONG Surco">
            </div>
          </div>
          <div class="form-header">
            <h1>Recuperar Contraseña</h1>
            <p>Te enviaremos un correo con las instrucciones.</p>
          </div>

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="input-group">
              <label>Correo Electrónico</label>
              <div class="input-wrapper" [class.focused]="emailFocused" [class.error]="forgotForm.controls.email.invalid && forgotForm.controls.email.touched">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  formControlName="email" 
                  placeholder="juan@ong.cl"
                  (focus)="emailFocused = true"
                  (blur)="emailFocused = false">
              </div>
              @if (forgotForm.controls.email.invalid && forgotForm.controls.email.touched) {
                <span class="error-text">Ingrese un correo válido</span>
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

            <button type="submit" class="submit-btn" [disabled]="isLoading() || forgotForm.invalid">
              @if (isLoading()) {
                <div class="spinner"></div>
              } @else {
                Enviar Enlace
              }
            </button>

            <div class="forgot-password-link" style="text-align: center; margin-top: 20px;">
              <a routerLink="/auth/login">Volver al inicio de sesión</a>
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
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  emailFocused = false;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      this.authService.forgotPassword(this.forgotForm.controls.email.value).subscribe({
        next: (res: any) => {
          this.isLoading.set(false);
          this.successMessage.set(res.message || 'Se ha enviado un correo con las instrucciones.');
          this.forgotForm.reset();
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al solicitar recuperación.');
        }
      });
    }
  }
}
