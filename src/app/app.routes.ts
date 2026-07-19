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

      // Director / Funcionario dashboards
      {
        path: 'dashboard/director',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director'] },
        loadComponent: () => import('./features/dashboard/director/director.component').then(m => m.DirectorComponent)
      },
      {
        path: 'dashboard/funcionario',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/dashboard/funcionario/funcionario.component').then(m => m.FuncionarioComponent)
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

      // Pacientes & Agenda
      {
        path: 'pacientes',
        canActivate: [roleGuard],
        data: { roles: ['root', 'admin', 'director', 'funcionario'] },
        loadComponent: () => import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent)
      },
      {
        path: 'pacientes/:id/agenda',
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
