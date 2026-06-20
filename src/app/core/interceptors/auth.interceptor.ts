import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Convertimos la Promesa de Capacitor Preferences en un Observable
  return from(authService.getToken()).pipe(
    switchMap(token => {
      let authReq = req;
      
      if (token) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // El token expiró o fue revocado, purgar sesión de forma proactiva
            authService.clearAuth();
          }
          return throwError(() => error);
        })
      );
    })
  );
};
