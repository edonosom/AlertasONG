import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#F3F6FD] p-4 font-sans text-slate-800 relative overflow-hidden">
      <!-- Decoración de fondo -->
      <div class="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-b-[60px] shadow-2xl z-0"></div>

      <!-- Tarjeta del Formulario -->
      <div class="bg-white/90 backdrop-blur-xl w-full max-w-md p-8 sm:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 z-10 fade-in relative">
        
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner border border-white overflow-hidden bg-white">
            <img src="assets/icon/favicon.png" alt="Logo" class="w-full h-full object-cover">
          </div>
          <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 tracking-tight m-0">Seguridad</h2>
          <p class="text-slate-500 mt-2 text-sm leading-relaxed">
            Por motivos de seguridad, debes actualizar tu contraseña genérica antes de continuar.
          </p>
        </div>

        <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <!-- Alerta de Error -->
          <div *ngIf="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-3 slide-down">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Nueva Contraseña -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-600 ml-1">Nueva Contraseña</label>
            <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Mínimo 8 caracteres"
                class="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700 placeholder-slate-400">
              <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 outline-none border-none bg-transparent cursor-pointer" (click)="togglePassword()">
                <svg *ngIf="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg *ngIf="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
            <span *ngIf="passwordForm.get('password')?.touched && passwordForm.get('password')?.invalid" class="text-xs text-red-500 ml-1">
              La contraseña debe tener al menos 8 caracteres.
            </span>
          </div>

          <!-- Confirmar Contraseña -->
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-slate-600 ml-1">Confirmar Contraseña</label>
            <div class="relative">
              <input [type]="showConfirmPassword ? 'text' : 'password'" formControlName="password_confirmation" placeholder="Repite tu contraseña"
                class="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-700 placeholder-slate-400">
              <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 outline-none border-none bg-transparent cursor-pointer" (click)="toggleConfirmPassword()">
                <svg *ngIf="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <svg *ngIf="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
            <span *ngIf="passwordForm.hasError('mismatch') && passwordForm.get('password_confirmation')?.touched" class="text-xs text-red-500 ml-1">
              Las contraseñas no coinciden.
            </span>
          </div>

          <!-- Submit Button -->
          <button type="submit" [disabled]="passwordForm.invalid || isLoading"
            class="mt-4 w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-teal-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex justify-center items-center gap-2">
            
            <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Actualizando...' : 'Actualizar y Entrar' }}
            <svg *ngIf="!isLoading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .fade-in { animation: fadeIn 0.5s ease-out forwards; }
    .slide-down { animation: slideDown 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  passwordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { password, password_confirmation } = this.passwordForm.value;
      
      this.authService.changePassword(password, password_confirmation).subscribe({
        next: () => {
          // Si es exitoso, redirigimos a la raíz, que evaluará el roleGuard y lo llevará a su dashboard.
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error al cambiar la contraseña. Intente nuevamente.';
        }
      });
    }
  }
}
