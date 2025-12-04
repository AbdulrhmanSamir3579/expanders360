import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricsState } from '@store/metrics.state';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-status-cards',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  templateUrl: './status-cards.component.html',
  styleUrl: './status-cards.component.css'
})
export class StatusCardsComponent implements OnInit {
  private metricsState = inject(MetricsState);
  
  stats = this.metricsState.stats;
  loading = this.metricsState.loading;
  slaStatus = this.metricsState.slaStatus;
  cycleTimeStatus = this.metricsState.cycleTimeStatus;
  anomalyStatus = this.metricsState.anomalyStatus;
  
  ngOnInit(): void {}
}
