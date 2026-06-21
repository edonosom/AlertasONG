import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, AuthResponse } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // UI State
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  
  emailFocused = false;
  passFocused = false;

  // Date/Time
  currentTime = signal<Date>(new Date());
  private timerInterval: any;

  ngOnInit() {
    this.timerInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

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
        const msg = err.error?.message || 'Error de conexión con el servidor.';
        this.errorMessage.set(msg);
      }
    });
  }
}
