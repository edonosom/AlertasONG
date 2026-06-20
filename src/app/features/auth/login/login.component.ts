import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, AuthResponse } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  mailOutline = mailOutline;
  lockClosedOutline = lockClosedOutline;
  eyeOutline = eyeOutline;
  eyeOffOutline = eyeOffOutline;
  alertCircleOutline = alertCircleOutline;

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, alertCircleOutline });
  }
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Reactive Form tipado
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Estados Reactivos UI
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(s => !s);
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (res: AuthResponse) => {
        this.isLoading.set(false);
        const userRole = res.user.rol;
        if (userRole === 'root' || userRole === 'admin') {
          this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        } else if (userRole === 'director') {
          this.router.navigate(['/dashboard/director'], { replaceUrl: true });
        } else {
          this.router.navigate(['/pacientes'], { replaceUrl: true });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Extract exact message from backend if available
        const msg = err.error?.message || 'Error de conexión con el servidor clínico.';
        this.errorMessage.set(msg);
      }
    });
  }
}
