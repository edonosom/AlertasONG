import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  roles: string[];
  svgPath: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
<div class="h-screen w-screen bg-[#E2E8F0] p-0 md:p-4 lg:p-6 flex items-center justify-center font-sans overflow-hidden">
  
  <div class="bg-[#F8F9FD] w-full h-full rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row p-2 md:p-4 gap-2 md:gap-4 lg:gap-6 relative">
    
    <!-- Sidebar / Bottom Tab Bar -->
    <aside class="w-full lg:w-24 h-16 lg:h-auto bg-gradient-to-b lg:from-[#008880] lg:to-[#136962] from-[#136962] to-[#008880] rounded-t-[28px] md:rounded-[24px] lg:rounded-[30px] flex flex-row lg:flex-col items-center justify-around lg:justify-between px-2 lg:px-0 py-0 lg:py-8 shadow-[0_-10px_30px_rgba(19,105,98,0.2)] lg:shadow-[0_10px_40px_rgba(0,136,128,0.3)] z-20 flex-shrink-0">
      
      <!-- Top Actions (Hidden on mobile) -->
      <div class="hidden lg:flex flex-col gap-8 w-full items-center">
        <!-- Logo / Top Icon -->
        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-white font-bold shadow-inner relative group cursor-pointer overflow-hidden border-2 border-white/20">
          <img src="assets/icon/favicon.png" alt="Logo" class="w-full h-full object-cover">
          <div class="absolute left-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible lg:group-hover:opacity-100 lg:group-hover:visible transition-all whitespace-nowrap z-50">Proyecto Alerta</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-row lg:flex-col gap-2 lg:gap-4 w-full px-2 lg:px-4 justify-around lg:justify-start">
        @for (item of visibleNav(); track item.route) {
          <div class="relative group flex justify-center">
            <a [routerLink]="[item.route]" 
               routerLinkActive="bg-white text-[#008880] shadow-[0_8px_20px_rgba(0,0,0,0.12)]" 
               [routerLinkActiveOptions]="{exact: false}"
               class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer no-underline relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [attr.d]="item.svgPath"/>
              </svg>
            </a>
            <!-- Tooltip (Only visible on desktop) -->
            <div class="hidden lg:block absolute left-20 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              {{ item.label }}
            </div>
          </div>
        }
      </nav>

      <!-- Bottom Actions (Logout icon only on mobile, with tooltip on desktop) -->
      <div class="flex flex-row lg:flex-col gap-4 w-auto lg:w-full px-2 lg:px-4 items-center lg:mt-auto relative group">
         <button (click)="logout()" class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer outline-none border-none bg-transparent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
         </button>
         <div class="hidden lg:block absolute left-20 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
           Cerrar sesión
         </div>
      </div>
    </aside>

    <!-- Main Content wrapper -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-transparent mb-0 lg:mb-0 w-full fade-in">
      
      <!-- Top Header (Search & Profile) -->
      <header class="h-20 lg:h-24 w-full flex items-center justify-between px-4 lg:px-6 flex-shrink-0 mt-2 lg:mt-0">
        <div>
           <span class="text-[10px] lg:text-sm font-bold text-gray-400 uppercase tracking-widest">Plataforma</span>
           <h1 class="text-2xl lg:text-3xl font-extrabold text-gray-800 m-0 leading-tight">ClinOS</h1>
        </div>
        
        <div class="flex items-center gap-4 lg:gap-6">
          <!-- Search Bar (Hidden on mobile) -->
          <div class="hidden md:flex items-center bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100/50 w-64 lg:w-72">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-gray-400"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <input type="text" placeholder="Search" class="bg-transparent border-none outline-none text-sm font-medium ml-3 w-full text-gray-700 placeholder-gray-400">
          </div>
          
          <!-- Profile Avatar -->
          <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-all border-2 border-white ring-2 ring-teal-100 text-sm lg:text-base">
            {{ userInitials() }}
          </div>
        </div>
      </header>

      <!-- Router Outlet Wrapper -->
      <main class="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 custom-scrollbar">
        <router-outlet></router-outlet>
      </main>

    </div>

  </div>

</div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 10px;
    }

  `]
})
export class ShellComponent {
  authService = inject(AuthService);

  private readonly allNav: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      roles: ['root', 'admin'],
      svgPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'Centros',
      route: '/admin/centros',
      roles: ['root', 'admin'],
      svgPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    {
      label: 'Usuarios',
      route: '/admin/usuarios',
      roles: ['root', 'admin'],
      svgPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      label: 'Pacientes',
      route: '/pacientes',
      roles: ['root', 'admin', 'funcionario'],
      svgPath: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
    },
    {
      label: 'Director',
      route: '/dashboard/director',
      roles: ['director'],
      svgPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z'
    },
    {
      label: 'Panel Clínico',
      route: '/dashboard/funcionario',
      roles: ['funcionario'],
      svgPath: 'M22 12h-4l-3 9L9 3l-3 9H2'
    }
  ];

  userRole = computed(() => {
    const u = this.authService.currentUser();
    return (u?.rol as any)?.value ?? u?.rol ?? '';
  });

  userInitials = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '??';
    return `${u.nombre?.charAt(0) ?? ''}${u.apellido?.charAt(0) ?? ''}`.toUpperCase();
  });

  visibleNav = computed(() => {
    const role = this.userRole();
    return this.allNav.filter(n => n.roles.includes(role));
  });

  logout() {
    this.authService.logout().subscribe({
      next:  () => window.location.href = '/login',
      error: () => window.location.href = '/login'
    });
  }
}
