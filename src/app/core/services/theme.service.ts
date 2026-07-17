import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'alertas-ong-theme';

  theme = signal<Theme>(this.loadTheme());

  constructor() {
    // Apply theme on startup and whenever it changes
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  toggle() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  setTheme(t: Theme) {
    this.theme.set(t);
    localStorage.setItem(this.STORAGE_KEY, t);
  }

  isDark() {
    return this.theme() === 'dark';
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    // Only respect stored preference; default is always dark (app is designed dark-first)
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }

  private applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }
}

