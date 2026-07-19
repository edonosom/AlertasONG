import { Component, inject, computed, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificacionService, Notificacion } from '../../core/services/notificacion.service';

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
      <div class="logo-btn" title="Alertas ONG Surco">
        <img src="assets/icon/favicon.png" alt="Alertas ONG Surco" style="width:28px;height:28px;object-fit:contain;" />
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
      <!-- Theme toggle -->
      <div class="nav-wrap" title="Cambiar tema">
        <button (click)="toggleTheme()" class="theme-btn" [class.theme-light]="!isDark()">
          @if (isDark()) {
            <!-- Moon icon for dark mode -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          } @else {
            <!-- Sun icon for light mode -->
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          }
        </button>
        <span class="nav-tip">{{ isDark() ? 'Tema oscuro' : 'Tema claro' }}</span>
      </div>

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

    <!-- Header / Top-bar -->
    <header class="top-bar">
      <!-- Mobile hamburger / logo area -->
      <div class="top-left">
        <div class="mobile-logo-btn">
          <img src="assets/icon/favicon.png" alt="Alertas ONG Surco" style="width:24px;height:24px;object-fit:contain;" />
        </div>
        <div>
          <span class="top-label">ONG Surco</span>
          <h1 class="top-title">Alertas <span class="top-badge">2026</span></h1>
        </div>
      </div>
      <div class="top-right">
        <div class="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input type="text" placeholder="Buscar..." class="search-input" />
          <span class="search-kbd">⌘K</span>
        </div>

        <!-- Theme toggle in top bar (mobile & tablet) -->
        <button class="topbar-theme-btn" (click)="toggleTheme()" [title]="isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
          @if (isDark()) {
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          } @else {
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          }
        </button>

        <!-- Bell with dropdown -->
        <div class="bell-wrap" style="position:relative;">
          <button class="bell-btn" id="bell-toggle" (click)="toggleDropdown($event)" [class.bell-active]="dropdownOpen()">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            @if (notifService.unreadCount() > 0) {
              <span class="bell-count">{{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}</span>
            }
          </button>

          <!-- Dropdown panel -->
          @if (dropdownOpen()) {
            <div class="notif-dropdown" id="notif-dropdown">
              <div class="notif-dd-header">
                <span class="notif-dd-title">Notificaciones</span>
                @if (notifService.unreadCount() > 0) {
                  <button class="notif-dd-mark-all" (click)="marcarTodasLeidas()">Marcar leídas</button>
                }
              </div>

              @if (notifService.recientes().length === 0) {
                <div class="notif-dd-empty">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="opacity:0.4;">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <p>No hay notificaciones nuevas</p>
                </div>
              } @else {
                <div class="notif-dd-list">
                  @for (n of notifService.recientes(); track n.id) {
                    <div class="notif-dd-item" (click)="onNotifClick(n)">
                      <div class="notif-dd-dot" [class.dot-ciclo]="n.tipo==='ciclo'" [class.dot-alerta]="n.tipo!=='ciclo'"></div>
                      <div class="notif-dd-body">
                        <div class="notif-dd-item-title">{{ n.titulo }}</div>
                        <div class="notif-dd-item-time">{{ formatRelative(n.created_at) }}</div>
                      </div>
                    </div>
                  }
                </div>
              }

              <div class="notif-dd-footer">
                <a routerLink="/notificaciones" (click)="dropdownOpen.set(false)" class="notif-dd-ver-todas">
                  Ver todas las notificaciones
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          }
        </div>
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
      background: var(--sh-bg);
      color: var(--sh-text);
      overflow: hidden;
      position: relative;
      font-family: 'Outfit', 'Inter', sans-serif;
      transition: background 0.3s ease, color 0.3s ease;
    }

    /* ═══════════════════════════════════════
       DARK THEME (default)
       ═══════════════════════════════════════ */
    :host-context([data-theme='dark']) .shell-root,
    :host-context(:not([data-theme='light'])) .shell-root {
      --sh-bg:               #060E10;
      --sh-surface:          rgba(5, 8, 18, 0.88);
      --sh-surface-top:      rgba(5, 8, 18, 0.55);
      --sh-bottom-bg:        rgba(5, 8, 18, 0.92);
      --sh-text:             #F1F5F9;
      --sh-text-muted:       rgba(148,163,184,0.55);
      --sh-border:           rgba(255,255,255,0.065);
      --sh-border-top:       rgba(255,255,255,0.055);
      --sh-border-bottom:    rgba(255,255,255,0.065);
      --sh-nav-hover-bg:     rgba(255,255,255,0.07);
      --sh-nav-active-color: #0D9288;
      --sh-nav-active-bg:    rgba(13,146,136,0.11);
      --sh-nav-active-bd:    rgba(13,146,136,0.22);
      --sh-nav-active-sh:    0 0 18px rgba(13,146,136,0.14);
      --sh-ring-bd:          rgba(13,146,136,0.48);
      --sh-tip-bg:           rgba(10,15,30,0.96);
      --sh-tip-bd:           rgba(255,255,255,0.09);
      --sh-tip-text:         #E2E8F0;
      --sh-search-bg:        rgba(255,255,255,0.04);
      --sh-search-bd:        rgba(255,255,255,0.08);
      --sh-search-text:      #F1F5F9;
      --sh-search-ph:        rgba(148,163,184,0.42);
      --sh-kbd-color:        rgba(148,163,184,0.35);
      --sh-kbd-bd:           rgba(148,163,184,0.13);
      --sh-bell-bg:          rgba(255,255,255,0.04);
      --sh-bell-bd:          rgba(255,255,255,0.07);
      --sh-bell-color:       rgba(148,163,184,0.65);
      --sh-avatar-bg:        linear-gradient(135deg, #0D9288, #0A6E6A);
      --sh-avatar-color:     #060E10;
      --sh-tab-color:        rgba(148,163,184,0.45);
      --sh-tab-active:       #0D9288;
      --sh-logo-bg:          linear-gradient(135deg, rgba(13,146,136,0.14), rgba(10,110,106,0.09));
      --sh-logo-bd:          rgba(13,146,136,0.22);
      --sh-logo-sh:          0 0 18px rgba(13,146,136,0.1);
      --sh-user-bg:          linear-gradient(135deg, #0369A1, #024F8C);
      --sh-user-bd:          rgba(3,105,161,0.28);
      --sh-theme-color:      rgba(148,163,184,0.5);
      --sh-theme-hover-color: #14B8A6;
      --sh-theme-hover-bg:   rgba(13,146,136,0.1);
      --sh-top-label:        #0D9288;
      --sh-top-title:        #F1F5F9;
      --sh-badge-color:      #0D9288;
      --sh-badge-bg:         rgba(13,146,136,0.1);
      --sh-badge-bd:         rgba(13,146,136,0.2);
      --sh-orb1:             radial-gradient(circle, rgba(13,146,136,0.18), transparent 70%);
      --sh-orb2:             radial-gradient(circle, rgba(3,105,161,0.15), transparent 70%);
      --sh-orb3:             radial-gradient(circle, rgba(10,110,106,0.12), transparent 70%);
      --sh-scrollbar:        rgba(13,146,136,0.18);
    }

    /* ═══════════════════════════════════════
       LIGHT THEME
       ═══════════════════════════════════════ */
    :host-context([data-theme='light']) .shell-root {
      --sh-bg:               #F0F9FF;
      --sh-surface:          rgba(255,255,255,0.92);
      --sh-surface-top:      rgba(255,255,255,0.82);
      --sh-bottom-bg:        rgba(255,255,255,0.95);
      --sh-text:             #0F172A;
      --sh-text-muted:       rgba(71,85,105,0.75);
      --sh-border:           rgba(0,0,0,0.08);
      --sh-border-top:       rgba(0,0,0,0.07);
      --sh-border-bottom:    rgba(0,0,0,0.09);
      --sh-nav-hover-bg:     rgba(0,0,0,0.05);
      --sh-nav-active-color: #0A6E6A;
      --sh-nav-active-bg:    rgba(13,146,136,0.12);
      --sh-nav-active-bd:    rgba(13,146,136,0.30);
      --sh-nav-active-sh:    0 0 18px rgba(13,146,136,0.18);
      --sh-ring-bd:          rgba(13,146,136,0.55);
      --sh-tip-bg:           rgba(15,23,42,0.94);
      --sh-tip-bd:           rgba(0,0,0,0.12);
      --sh-tip-text:         #F1F5F9;
      --sh-search-bg:        rgba(0,0,0,0.04);
      --sh-search-bd:        rgba(0,0,0,0.1);
      --sh-search-text:      #0F172A;
      --sh-search-ph:        rgba(71,85,105,0.5);
      --sh-kbd-color:        rgba(71,85,105,0.5);
      --sh-kbd-bd:           rgba(71,85,105,0.2);
      --sh-bell-bg:          rgba(0,0,0,0.04);
      --sh-bell-bd:          rgba(0,0,0,0.08);
      --sh-bell-color:       rgba(71,85,105,0.8);
      --sh-avatar-bg:        linear-gradient(135deg, #0D9288, #0A6E6A);
      --sh-avatar-color:     #ffffff;
      --sh-tab-color:        rgba(71,85,105,0.55);
      --sh-tab-active:       #0A6E6A;
      --sh-logo-bg:          linear-gradient(135deg, rgba(13,146,136,0.12), rgba(10,110,106,0.07));
      --sh-logo-bd:          rgba(13,146,136,0.28);
      --sh-logo-sh:          0 0 18px rgba(13,146,136,0.12);
      --sh-user-bg:          linear-gradient(135deg, #0369A1, #024F8C);
      --sh-user-bd:          rgba(3,105,161,0.3);
      --sh-theme-color:      rgba(71,85,105,0.65);
      --sh-theme-hover-color: #0A6E6A;
      --sh-theme-hover-bg:   rgba(13,146,136,0.1);
      --sh-top-label:        #0A6E6A;
      --sh-top-title:        #0F172A;
      --sh-badge-color:      #0A6E6A;
      --sh-badge-bg:         rgba(13,146,136,0.1);
      --sh-badge-bd:         rgba(13,146,136,0.22);
      --sh-orb1:             radial-gradient(circle, rgba(13,146,136,0.10), transparent 70%);
      --sh-orb2:             radial-gradient(circle, rgba(3,105,161,0.08), transparent 70%);
      --sh-orb3:             radial-gradient(circle, rgba(10,110,106,0.07), transparent 70%);
      --sh-scrollbar:        rgba(13,146,136,0.22);
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
      background: var(--sh-orb1);
      animation: orbDrift 22s ease-in-out infinite;
    }
    .orb-2 {
      width: 360px; height: 360px;
      bottom: -120px; right: 80px;
      background: var(--sh-orb2);
      animation: orbDrift 28s ease-in-out infinite reverse;
    }
    .orb-3 {
      width: 280px; height: 280px;
      top: 45%; right: -60px;
      background: var(--sh-orb3);
      animation: orbDrift 19s ease-in-out infinite 4s;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 76px;
      height: 100%;
      background: var(--sh-surface);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid var(--sh-border);
      box-shadow: 4px 0 32px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 22px 0;
      z-index: 30;
      flex-shrink: 0;
      position: relative;
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    @media (min-width: 1024px) {
      .sidebar { display: flex; }
    }

    /* Logo */
    .logo-group { width: 100%; display: flex; justify-content: center; margin-bottom: 28px; }
    .logo-btn {
      width: 46px; height: 46px;
      border-radius: 14px;
      background: var(--sh-logo-bg);
      border: 1px solid var(--sh-logo-bd);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: var(--sh-logo-sh);
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
      color: var(--sh-text-muted);
      text-decoration: none;
      border: 1px solid transparent;
      background: transparent;
      transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
      overflow: hidden;
    }
    .nav-link:hover {
      color: var(--sh-text);
      background: var(--sh-nav-hover-bg);
      transform: scale(1.07);
    }
    .nav-link.nav-link-active {
      color: var(--sh-nav-active-color);
      background: var(--sh-nav-active-bg);
      border-color: var(--sh-nav-active-bd);
      box-shadow: var(--sh-nav-active-sh);
    }
    .nav-link.nav-link-active .nav-ring {
      display: block;
      position: absolute;
      inset: -3px;
      border-radius: 16px;
      border: 1.5px solid var(--sh-ring-bd);
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
      background: var(--sh-tip-bg);
      border: 1px solid var(--sh-tip-bd);
      color: var(--sh-tip-text);
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
      background: var(--sh-user-bg);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.8rem; color: white;
      letter-spacing: -0.02em;
      border: 1px solid var(--sh-user-bd);
      box-shadow: 0 0 14px rgba(3,105,161,0.18);
    }

    /* Theme toggle button (sidebar) */
    .theme-btn {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: var(--sh-theme-color);
      border: 1px solid transparent; background: transparent; cursor: pointer;
      transition: all 0.2s ease; outline: none;
    }
    .theme-btn:hover {
      color: var(--sh-theme-hover-color);
      background: var(--sh-theme-hover-bg);
      border-color: rgba(13,146,136,0.18);
      transform: scale(1.07);
    }
    .theme-btn.theme-light {
      color: #D97706;
    }
    .theme-btn.theme-light:hover {
      color: #F59E0B;
      background: rgba(217,119,6,0.1);
      border-color: rgba(217,119,6,0.18);
    }

    .logout-btn {
      width: 46px; height: 46px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: var(--sh-text-muted);
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
      padding: 0 20px;
      flex-shrink: 0;
      background: var(--sh-surface-top);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid var(--sh-border-top);
      transition: background 0.3s ease, border-color 0.3s ease;
      gap: 12px;
    }
    @media (max-width: 480px) {
      .top-bar { padding: 0 12px; gap: 8px; }
    }

    .top-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .mobile-logo-btn {
      width: 36px; height: 36px;
      border-radius: 11px;
      background: var(--sh-logo-bg);
      border: 1px solid var(--sh-logo-bd);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    @media (min-width: 1024px) {
      .mobile-logo-btn { display: none; }
    }

    .top-label {
      display: block;
      font-size: 0.6rem; font-weight: 700;
      color: var(--sh-top-label);
      text-transform: uppercase; letter-spacing: 0.14em;
      white-space: nowrap;
    }
    .top-title {
      font-size: 1.35rem; font-weight: 900; color: var(--sh-top-title);
      letter-spacing: -0.035em; line-height: 1.1; margin: 0;
      white-space: nowrap;
      transition: color 0.3s ease;
    }
    @media (max-width: 480px) {
      .top-title { font-size: 1.1rem; }
    }
    .top-badge {
      font-size: 0.58rem; font-weight: 700; color: var(--sh-badge-color);
      background: var(--sh-badge-bg);
      border: 1px solid var(--sh-badge-bd);
      padding: 2px 7px; border-radius: 6px;
      vertical-align: middle; margin-left: 6px;
    }
    .top-right {
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      .top-right { gap: 6px; }
    }

    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      background: var(--sh-search-bg);
      border: 1px solid var(--sh-search-bd);
      border-radius: 11px;
      padding: 7px 12px;
      width: 200px;
      transition: all 0.2s ease;
    }
    .search-wrap svg { color: var(--sh-search-ph); }
    .search-wrap:focus-within {
      border-color: rgba(13,146,136,0.28);
      background: rgba(13,146,136,0.04);
      box-shadow: 0 0 0 3px rgba(13,146,136,0.07);
    }
    .search-input {
      background: transparent; border: none; outline: none;
      font-size: 0.82rem; font-weight: 500; color: var(--sh-search-text); flex: 1;
      font-family: 'Outfit', sans-serif;
    }
    .search-input::placeholder { color: var(--sh-search-ph); }
    .search-kbd {
      font-size: 0.62rem; font-weight: 600;
      color: var(--sh-kbd-color);
      border: 1px solid var(--sh-kbd-bd);
      border-radius: 4px; padding: 1px 5px; font-family: monospace;
    }
    @media (max-width: 768px) { .search-wrap { display: none; } }

    /* Theme toggle in top bar */
    .topbar-theme-btn {
      position: relative; width: 38px; height: 38px;
      border-radius: 11px;
      border: 1px solid var(--sh-bell-bd);
      background: var(--sh-bell-bg);
      color: var(--sh-bell-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; outline: none;
    }
    .topbar-theme-btn:hover {
      border-color: rgba(13,146,136,0.24);
      color: #0D9288;
      background: rgba(13,146,136,0.07);
    }
    /* Hide on desktop (sidebar has it) */
    @media (min-width: 1024px) {
      .topbar-theme-btn { display: none; }
    }

    .bell-btn {
      position: relative; width: 38px; height: 38px;
      border-radius: 11px;
      border: 1px solid var(--sh-bell-bd);
      background: var(--sh-bell-bg);
      color: var(--sh-bell-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; outline: none;
    }
    .bell-btn:hover, .bell-btn.bell-active {
      border-color: rgba(13,146,136,0.3);
      color: #0D9288;
      background: rgba(13,146,136,0.09);
    }
    .bell-count {
      position: absolute; top: -5px; right: -5px;
      min-width: 18px; height: 18px; padding: 0 4px;
      border-radius: 9px; background: #EF4444;
      color: #fff; font-size: 0.62rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid var(--sh-surface-top);
      animation: popIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes popIn {
      from { transform: scale(0); } to { transform: scale(1); }
    }

    /* Dropdown */
    .notif-dropdown {
      position: absolute; top: calc(100% + 12px); right: 0;
      width: 320px;
      background: var(--sh-surface);
      border: 1px solid var(--sh-border);
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.35);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      z-index: 200;
      overflow: hidden;
      animation: ddSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @media (max-width: 400px) { .notif-dropdown { right: -60px; width: 290px; } }
    @keyframes ddSlideIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .notif-dd-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--sh-border);
    }
    .notif-dd-title {
      font-size: 0.85rem; font-weight: 800; color: var(--sh-text);
      letter-spacing: -0.01em;
    }
    .notif-dd-mark-all {
      font-size: 0.72rem; font-weight: 700; color: #0D9288;
      background: none; border: none; cursor: pointer; padding: 0;
      font-family: inherit; transition: opacity 0.2s;
    }
    .notif-dd-mark-all:hover { opacity: 0.7; }
    .notif-dd-empty {
      padding: 28px 20px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: var(--sh-text-muted);
    }
    .notif-dd-empty p { font-size: 0.8rem; margin: 0; font-weight: 600; }
    .notif-dd-list { display: flex; flex-direction: column; }
    .notif-dd-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px;
      cursor: pointer; transition: background 0.15s;
      border-bottom: 1px solid var(--sh-border);
    }
    .notif-dd-item:last-child { border-bottom: none; }
    .notif-dd-item:hover { background: var(--sh-nav-hover-bg); }
    .notif-dd-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
    }
    .dot-ciclo { background: #EF4444; }
    .dot-alerta { background: #0D9288; }
    .notif-dd-body { flex: 1; min-width: 0; }
    .notif-dd-item-title {
      font-size: 0.8rem; font-weight: 700; color: var(--sh-text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .notif-dd-item-time {
      font-size: 0.7rem; color: var(--sh-text-muted); margin-top: 2px;
    }
    .notif-dd-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--sh-border);
      background: rgba(13,146,136,0.03);
    }
    .notif-dd-ver-todas {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      font-size: 0.78rem; font-weight: 700; color: #0D9288;
      text-decoration: none; transition: opacity 0.2s;
    }
    .notif-dd-ver-todas:hover { opacity: 0.75; }
    .avatar-chip {
      width: 38px; height: 38px;
      border-radius: 11px;
      background: var(--sh-avatar-bg);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.78rem; color: var(--sh-avatar-color);
      letter-spacing: -0.02em; cursor: pointer;
      border: 2px solid rgba(13,146,136,0.28);
      box-shadow: 0 0 16px rgba(13,146,136,0.14);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .avatar-chip:hover {
      box-shadow: 0 0 28px rgba(13,146,136,0.32);
      transform: scale(1.05);
    }
    @media (max-width: 360px) {
      .avatar-chip { display: none; }
    }

    /* ── Content area ── */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 22px;
      scrollbar-width: thin;
      scrollbar-color: var(--sh-scrollbar) transparent;
    }
    .content-area::-webkit-scrollbar { width: 4px; }
    .content-area::-webkit-scrollbar-track { background: transparent; }
    .content-area::-webkit-scrollbar-thumb {
      background: var(--sh-scrollbar); border-radius: 10px;
    }
    @media (max-width: 1024px) {
      .content-area { padding: 16px 16px 90px; }
    }
    @media (max-width: 480px) {
      .content-area { padding: 12px 12px 84px; }
    }

    /* ── Bottom Nav (mobile) ── */
    .bottom-nav {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 68px;
      background: var(--sh-bottom-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-top: 1px solid var(--sh-border-bottom);
      align-items: center; justify-content: space-around;
      padding: 0 8px; z-index: 50;
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    @media (min-width: 1024px) { .bottom-nav { display: none; } }

    .tab-btn {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px;
      padding: 8px 10px; border-radius: 12px;
      text-decoration: none; color: var(--sh-tab-color);
      border: none; background: transparent; cursor: pointer;
      transition: all 0.2s ease; flex: 1; min-width: 0;
    }
    .tab-btn:hover { color: var(--sh-text); }
    .tab-btn.tab-active { color: var(--sh-tab-active); }
    .tab-logout:hover { color: #FF4757; }
    .tab-lbl {
      font-size: 0.55rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 100%;
    }

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
export class ShellComponent implements OnInit {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  notifService = inject(NotificacionService);
  private router = inject(Router);

  isDark = this.themeService.isDark.bind(this.themeService);
  dropdownOpen = signal(false);

  ngOnInit() {
    this.notifService.cargarRecientes().subscribe();
    // Re-check every 60 seconds
    setInterval(() => this.notifService.cargarRecientes().subscribe(), 60000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('#bell-toggle') && !target.closest('#notif-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  onNotifClick(n: Notificacion) {
    this.dropdownOpen.set(false);
    if (!n.leida) {
      this.notifService.marcarLeida(n.id).subscribe();
    }
    if (n.url_accion) {
      this.router.navigateByUrl(n.url_accion);
    }
  }

  marcarTodasLeidas() {
    this.notifService.marcarTodas().subscribe();
  }

  formatRelative(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 2) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays} días`;
  }

  toggleTheme() {
    this.themeService.toggle();
  }

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
