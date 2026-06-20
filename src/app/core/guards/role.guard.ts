import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<string>;
  const user = authService.currentUser();

  if (!user || !expectedRoles) {
    return router.parseUrl('/login');
  }

  if (expectedRoles.includes(user.rol)) {
    return true;
  }

  // No autorizado para esta vista, quizás mandar a un dashboard genérico
  return router.parseUrl('/agenda');
};
