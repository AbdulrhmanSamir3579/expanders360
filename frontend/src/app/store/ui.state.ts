import { Injectable, signal, computed } from '@angular/core';

/**
 * UI State Service
 * Manages UI-related state: filters, theme, live updates status
 */
@Injectable({ providedIn: 'root' })
export class UiState {
  private _darkMode = signal<boolean>(true);
  private _liveUpdatesEnabled = signal<boolean>(true);
  private _selectedTimeRange = signal<'6h' | '12h' | '24h'>('24h');

  readonly liveUpdatesEnabled = this._liveUpdatesEnabled.asReadonly();
  readonly selectedTimeRange = this._selectedTimeRange.asReadonly();
  readonly theme = computed(() => this._darkMode() ? 'dark' : 'light');

  // Actions
  toggleDarkMode(): void {
    this._darkMode.update(current => !current);
    this.applyTheme();
  }

  setLiveUpdates(enabled: boolean): void {
    this._liveUpdatesEnabled.set(enabled);
  }

  setTimeRange(range: '6h' | '12h' | '24h'): void {
    this._selectedTimeRange.set(range);
  }

  private applyTheme(): void {
    const theme = this._darkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      this._darkMode.set(savedTheme === 'dark');
    }
    this.applyTheme();
  }
}
