import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDarkMode = signal<boolean>(true);
  
  readonly isDarkMode = this._isDarkMode.asReadonly();
  
  readonly currentTheme = computed(() => this._isDarkMode() ? 'dark' : 'light');
  
  constructor() {
    this.initializeTheme();
  }
  
  toggleTheme(): void {
    this._isDarkMode.update(current => !current);
    this.applyTheme();
  }
  
  setTheme(isDark: boolean): void {
    this._isDarkMode.set(isDark);
    this.applyTheme();
  }
  
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    
    if (savedTheme) {
      this._isDarkMode.set(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._isDarkMode.set(prefersDark);
    }
    
    this.applyTheme();
    this.listenToSystemThemeChanges();
  }
  
  private applyTheme(): void {
    const theme = this._isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  private listenToSystemThemeChanges(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this._isDarkMode.set(e.matches);
        this.applyTheme();
      }
    });
  }
}
