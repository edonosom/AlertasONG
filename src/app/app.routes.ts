import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/login',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
  },

  // ───────────────────────────────────────────────────────────
  // Protected routes — wrapped inside ShellComponent (sidebar)
  // ───────────────────────────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      // Admin / Root
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin'] },
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'admin/centros',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin'] },
        loadComponent: () => import('./features/admin/centros/centros.component').then(m => m.CentrosComponent)
      },
      {
        path: 'admin/usuarios',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin'] },
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'admin/usuarios/:id',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director'] },
        loadComponent: () => import('./features/admin/usuarios/usuario-detalle/usuario-detalle.component').then(m => m.UsuarioDetalleComponent)
      },

      // Director / Funcionario dashboards
      {
        path: 'admin/centros/:id',
        loadComponent: () => import('./features/admin/centros/centro-detalle/centro-detalle.component').then(m => m.CentroDetalleComponent)
      },
      {
        path: 'dashboard/director',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director'] },
        loadComponent: () => import('./features/dashboard/director/director.component').then(m => m.DirectorComponent)
      },
      {
        path: 'alertas-criticas',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/alertas-criticas/alertas-criticas.component').then(m => m.AlertasCriticasComponent)
      },
      {
        path: 'dashboard/root',
        canActivate: [roleGuard],
        data: { roles: ['root'] },
        loadComponent: () => import('./features/dashboard/root/root.component').then(m => m.RootComponent)
      },
      {
        path: 'dashboard/admin',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin'] },
        loadComponent: () => import('./features/dashboard/admin/admin.component').then(m => m.AdminComponent)
      },

      // Nnas & Agenda
      {
        path: 'nnas',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/nnas/nnas.component').then(m => m.PacientesComponent)
      },
      {
        path: 'nnas/:id',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/nnas/nna-detalle/nna-detalle.component').then(m => m.NnaDetalleComponent)
      },
      {
        path: 'calendario-global',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/agenda/components/agenda-clinica/agenda-clinica.component').then(m => m.AgendaClinicaComponent)
      },
      {
        path: 'mi-calendario',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director'], soloPropios: true },
        loadComponent: () => import('./features/agenda/components/agenda-clinica/agenda-clinica.component').then(m => m.AgendaClinicaComponent)
      },
      {
        path: 'nnas/:id/agenda',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/agenda/components/agenda-clinica/agenda-clinica.component').then(m => m.AgendaClinicaComponent)
      },
      {
        path: 'notificaciones',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent)
      },
    ]
  },

  { path: '**', redirectTo: 'login' }
];
