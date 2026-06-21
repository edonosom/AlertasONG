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
<div class="shell-root">

  <!-- Nebula orbs -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <!-- ─── SIDEBAR desktop ─── -->
  <aside class="sidebar">

    <!-- Logo -->
    <div class="logo-group">
      <div class="logo-btn" title="ClinOS">
        <img src="assets/icon/favicon.png" alt="ClinOS" style="width:28px;height:28px;object-fit:contain;" />
      </div>
    </div>

    <!-- Nav -->
    <nav class="nav-list">
      @for (item of visibleNav(); track item.route) {
        <div class="nav-wrap" [title]="item.label">
          <a [routerLink]="[item.route]"
             routerLinkActive="nav-link-active"
             [routerLinkActiveOptions]="{exact: false}"
             class="nav-link">
            <span class="nav-ring"></span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    [attr.d]="item.svgPath"/>
            </svg>
          </a>
          <span class="nav-tip">{{ item.label }}</span>
        </div>
      }
    </nav>

    <!-- Bottom -->
    <div class="nav-bottom">
      <div class="nav-wrap" [title]="userRole()">
        <div class="user-chip">{{ userInitials() }}</div>
        <span class="nav-tip">{{ userRole() }}</span>
      </div>
      <div class="nav-wrap" title="Cerrar sesión">
        <button (click)="logout()" class="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="nav-tip">Salir</span>
      </div>
    </div>
  </aside>

  <!-- ─── MAIN COLUMN ─── -->
  <div class="main-col">

    <!-- Header -->
    <header class="top-bar">
      <div>
        <span class="top-label">Sistema Clínico</span>
        <h1 class="top-title">ClinOS <span class="top-badge">2026</span></h1>
      </div>
      <div class="top-right">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:rgba(148,163,184,0.5);flex-shrink:0;">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Buscar..." class="search-input" />
          <span class="search-kbd">⌘K</span>
        </div>
        <button class="bell-btn">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="bell-dot"></span>
        </button>
        <div class="avatar-chip">{{ userInitials() }}</div>
      </div>
    </header>

    <!-- Page content -->
    <main class="content-area">
      <router-outlet></router-outlet>
    </main>

  </div>

  <!-- ─── BOTTOM NAV mobile ─── -->
  <nav class="bottom-nav">
    @for (item of visibleNav(); track item.route) {
      <a [routerLink]="[item.route]"
         routerLinkActive="tab-active"
         [routerLinkActiveOptions]="{exact: false}"
         class="tab-btn">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                [attr.d]="item.svgPath"/>
        </svg>
        <span class="tab-lbl">{{ item.label }}</span>
      </a>
    }
    <button (click)="logout()" class="tab-btn tab-logout">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="tab-lbl">Salir</span>
    </button>
  </nav>

</div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    /* ── Root wrapper ── */
    .shell-root {
      display: flex;
      width: 100vw;
      height: 100vh;
      background: #060E10;
      color: #F1F5F9;
      overflow: hidden;
      position: relative;
      font-family: 'Outfit', 'Inter', sans-serif;
    }

    /* ── Nebula orbs ── */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(90px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 {
      width: 480px; height: 480px;
      top: -160px; left: -80px;
      background: radial-gradient(circle, rgba(13,146,136,0.18), transparent 70%);
      animation: orbDrift 22s ease-in-out infinite;
    }
    .orb-2 {
      width: 360px; height: 360px;
      bottom: -120px; right: 80px;
      background: radial-gradient(circle, rgba(3,105,161,0.15), transparent 70%);
      animation: orbDrift 28s ease-in-out infinite reverse;
    }
    .orb-3 {
      width: 280px; height: 280px;
      top: 45%; right: -60px;
      background: radial-gradient(circle, rgba(10,110,106,0.12), transparent 70%);
      animation: orbDrift 19s ease-in-out infinite 4s;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 76px;
      height: 100%;
      background: rgba(5, 8, 18, 0.88);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid rgba(255,255,255,0.06);
      box-shadow: 4px 0 32px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 22px 0;
      z-index: 30;
      flex-shrink: 0;
      position: relative;
    }
    @media (min-width: 1024px) {
      .sidebar { display: flex; }
    }

    /* Logo */
    .logo-group { width: 100%; display: flex; justify-content: center; margin-bottom: 28px; }
    .logo-btn {
      width: 46px; height: 46px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(13,146,136,0.14), rgba(10,110,106,0.09));
      border: 1px solid rgba(13,146,136,0.22);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 0 18px rgba(13,146,136,0.1);
    }
    .logo-btn:hover {
      box-shadow: 0 0 28px rgba(13,146,136,0.28);
      border-color: rgba(13,146,136,0.45);
      transform: translateY(-1px);
    }

    /* Nav list */
    .nav-list {
      display: flex; flex-direction: column; gap: 10px;
      flex: 1; width: 100%; padding: 0 14px;
    }

    /* Nav item wrapper (for tooltip) */
    .nav-wrap { position: relative; display: flex; justify-content: center; width: 100%; }

    /* Nav link */
    .nav-link {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(148,163,184,0.55);
      text-decoration: none;
      border: 1px solid transparent;
      background: transparent;
      transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
      overflow: hidden;
    }
    .nav-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.07);
      transform: scale(1.07);
    }
    .nav-link.nav-link-active {
      color: #0D9288;
      background: rgba(13,146,136,0.11);
      border-color: rgba(13,146,136,0.22);
      box-shadow: 0 0 18px rgba(13,146,136,0.14);
    }
    .nav-link.nav-link-active .nav-ring {
      display: block;
      position: absolute;
      inset: -3px;
      border-radius: 16px;
      border: 1.5px solid rgba(13,146,136,0.48);
      animation: ringPulse 2.6s ease-in-out infinite;
      pointer-events: none;
    }
    .nav-ring { display: none; }

    /* Tooltip */
    .nav-tip {
      position: absolute;
      left: calc(100% + 14px);
      top: 50%;
      transform: translateY(-50%) translateX(-8px);
      background: rgba(10,15,30,0.96);
      border: 1px solid rgba(255,255,255,0.09);
      color: #E2E8F0;
      font-size: 0.76rem;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 9px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.18s ease;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 18px rgba(0,0,0,0.45);
      z-index: 100;
    }
    .nav-wrap:hover .nav-tip {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* Bottom section */
    .nav-bottom {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; width: 100%; padding: 0 14px;
    }
    .user-chip {
      width: 42px; height: 42px;
      border-radius: 13px;
      background: linear-gradient(135deg, #0369A1, #024F8C);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.8rem; color: white;
      letter-spacing: -0.02em;
      border: 1px solid rgba(3,105,161,0.28);
      box-shadow: 0 0 14px rgba(3,105,161,0.18);
    }
    .logout-btn {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(148,163,184,0.5);
      border: 1px solid transparent; background: transparent; cursor: pointer;
      transition: all 0.2s ease; outline: none;
    }
    .logout-btn:hover {
      color: #FF4757;
      background: rgba(255,71,87,0.1);
      border-color: rgba(255,71,87,0.18);
      transform: scale(1.07);
    }

    /* ── Main column ── */
    .main-col {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      position: relative;
      z-index: 10;
    }

    /* ── Top bar ── */
    .top-bar {
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
      background: rgba(5,8,18,0.55);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(255,255,255,0.055);
    }
    .top-label {
      display: block;
      font-size: 0.6rem; font-weight: 700;
      color: #0D9288;
      text-transform: uppercase; letter-spacing: 0.14em;
    }
    .top-title {
      font-size: 1.45rem; font-weight: 900; color: #F1F5F9;
      letter-spacing: -0.035em; line-height: 1.1; margin: 0;
    }
    .top-badge {
      font-size: 0.62rem; font-weight: 700; color: #0D9288;
      background: rgba(13,146,136,0.1);
      border: 1px solid rgba(13,146,136,0.2);
      padding: 2px 7px; border-radius: 6px;
      vertical-align: middle; margin-left: 6px;
    }
    .top-right {
      display: flex; align-items: center; gap: 12px;
    }
    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 11px;
      padding: 7px 12px;
      width: 210px;
      transition: all 0.2s ease;
    }
    .search-wrap:focus-within {
      border-color: rgba(13,146,136,0.28);
      background: rgba(13,146,136,0.04);
      box-shadow: 0 0 0 3px rgba(13,146,136,0.07);
    }
    .search-input {
      background: transparent; border: none; outline: none;
      font-size: 0.82rem; font-weight: 500; color: #F1F5F9; flex: 1;
      font-family: 'Outfit', sans-serif;
    }
    .search-input::placeholder { color: rgba(148,163,184,0.42); }
    .search-kbd {
      font-size: 0.62rem; font-weight: 600;
      color: rgba(148,163,184,0.35);
      border: 1px solid rgba(148,163,184,0.13);
      border-radius: 4px; padding: 1px 5px; font-family: monospace;
    }
    @media (max-width: 768px) { .search-wrap { display: none; } }

    .bell-btn {
      position: relative; width: 38px; height: 38px;
      border-radius: 11px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.04);
      color: rgba(148,163,184,0.65);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease;
    }
    .bell-btn:hover {
      border-color: rgba(13,146,136,0.24);
      color: #0D9288;
      background: rgba(13,146,136,0.07);
    }
    .bell-dot {
      position: absolute; top: 7px; right: 7px;
      width: 6px; height: 6px;
      border-radius: 50%; background: #FF4757;
      border: 1.5px solid #060E10;
    }
    .avatar-chip {
      width: 38px; height: 38px;
      border-radius: 11px;
      background: linear-gradient(135deg, #0D9288, #0A6E6A);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.78rem; color: #060E10;
      letter-spacing: -0.02em; cursor: pointer;
      border: 2px solid rgba(13,146,136,0.28);
      box-shadow: 0 0 16px rgba(13,146,136,0.14);
      transition: all 0.2s ease;
    }
    .avatar-chip:hover {
      box-shadow: 0 0 28px rgba(13,146,136,0.32);
      transform: scale(1.05);
    }

    /* ── Content area ── */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 22px;
      scrollbar-width: thin;
      scrollbar-color: rgba(13,146,136,0.18) transparent;
    }
    .content-area::-webkit-scrollbar { width: 4px; }
    .content-area::-webkit-scrollbar-track { background: transparent; }
    .content-area::-webkit-scrollbar-thumb {
      background: rgba(13,146,136,0.18); border-radius: 10px;
    }
    @media (max-width: 1024px) {
      .content-area { padding: 16px 16px 90px; }
    }

    /* ── Bottom Nav (mobile) ── */
    .bottom-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 68px;
      background: rgba(5,8,18,0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-top: 1px solid rgba(255,255,255,0.065);
      align-items: center; justify-content: space-around;
      padding: 0 8px; z-index: 50;
    }
    @media (min-width: 1024px) { .bottom-nav { display: none; } }

    .tab-btn {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px;
      padding: 8px 12px; border-radius: 12px;
      text-decoration: none; color: rgba(148,163,184,0.45);
      border: none; background: transparent; cursor: pointer;
      transition: all 0.2s ease; flex: 1;
    }
    .tab-btn:hover { color: rgba(148,163,184,0.85); }
    .tab-btn.tab-active { color: #0D9288; }
    .tab-logout:hover { color: #FF4757; }
    .tab-lbl { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Keyframes ── */
    @keyframes orbDrift {
      0%   { transform: translate(0,0) rotate(0deg); }
      33%  { transform: translate(18px,-12px) rotate(120deg); }
      66%  { transform: translate(-9px,16px) rotate(240deg); }
      100% { transform: translate(0,0) rotate(360deg); }
    }
    @keyframes ringPulse {
      0%   { transform: scale(0.95); opacity: 0.7; }
      50%  { transform: scale(1.12); opacity: 0.18; }
      100% { transform: scale(0.95); opacity: 0.7; }
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
      label: 'Panel',
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
