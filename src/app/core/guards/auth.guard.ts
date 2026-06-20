import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user) {
    // Si el usuario DEBE cambiar su contraseña y NO está yendo a la página de cambio de contraseña
    if (user.must_change_password && !state.url.includes('/change-password')) {
      return router.parseUrl('/change-password');
    }
    // Si ya cambió la contraseña e intenta ir a /change-password, devolverlo al dashboard
    if (!user.must_change_password && state.url.includes('/change-password')) {
      return router.parseUrl('/');
    }
    return true;
  }

  // Si no hay usuario, mandarlo al login
  return router.parseUrl('/login');
};
