import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton"
      [style.height]="height"
      [style.width]="width"
      [class.skeleton-circle]="variant === 'circle'"
      [class.skeleton-rect]="variant === 'rect'">
    </div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-bg-tertiary) 25%,
        var(--color-bg-hover) 50%,
        var(--color-bg-tertiary) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s ease-in-out infinite;
      border-radius: var(--radius-md);
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-rect {
      border-radius: var(--radius-sm);
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() height: string = '20px';
  @Input() width: string = '100%';
  @Input() variant: 'rect' | 'circle' = 'rect';
}
