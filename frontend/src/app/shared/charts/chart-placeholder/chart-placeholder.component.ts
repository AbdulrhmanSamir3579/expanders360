import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-placeholder',
  standalone: true,
  template: `
    <div class="chart-placeholder" [style.height]="height" [style.width]="width">
      <div class="placeholder-content">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M7 14L11 10L15 14L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7" cy="14" r="1.5" fill="currentColor"/>
          <circle cx="11" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
          <circle cx="19" cy="8" r="1.5" fill="currentColor"/>
        </svg>
        <p>No data available</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--color-bg-secondary);
      border: 2px dashed var(--color-border-primary);
      border-radius: var(--radius-md);
    }
    
    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      color: var(--color-text-tertiary);
      animation: pulse 2s ease-in-out infinite;
    }
    
    svg {
      width: 80px;
      height: 80px;
      color: var(--color-text-tertiary);
    }
    
    p {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin: 0;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
  `]
})
export class ChartPlaceholderComponent {
  @Input() height: string = '100%';
  @Input() width: string = '100%';
}
