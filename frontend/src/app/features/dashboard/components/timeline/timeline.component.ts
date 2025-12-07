import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsState } from '@store/events.state';
import { UiState } from '@store/ui.state';
import { WorkflowEvent } from '@core/models/workflow.models';

interface TimeMarker {
  time: number;
  label: string;
  position: number;
  isMajor: boolean;
}

interface TooltipPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css'
})
// Trigger rebuild
export class TimelineComponent implements OnInit, OnDestroy {
  @ViewChild('timelineWrapper') timelineWrapper!: ElementRef<HTMLDivElement>;

  private eventsState = inject(EventsState);
  private uiState = inject(UiState);

  // Signals
  events = this.eventsState.eventsLast24Hours;
  selectedPeriod = 24; // Fixed to 24h as per requirement
  currentCategory = signal<'all' | 'completed' | 'pending' | 'anomaly'>('all');
  
  // Track new activity for each category
  categoryActivity = signal<Record<string, boolean>>({
    all: false,
    completed: false,
    pending: false,
    anomaly: false
  });

  // Computed display events based on filtering
  displayEvents = computed(() => {
    const allEvents = this.events();
    const category = this.currentCategory();
    
    if (category === 'all') {
      return allEvents;
    }
    
    return allEvents.filter(event => event.status === category);
  });

  // Local state
  eventPositions: Map<string, number> = new Map();
  timeMarkers: TimeMarker[] = [];
  private lastEventCount = 0;
  
  tooltipEvent: WorkflowEvent | null = null;
  tooltipPosition: TooltipPosition = { x: 0, y: 0 };

  categories = [
    { label: 'All', value: 'all' as const },
    { label: 'Completed', value: 'completed' as const },
    { label: 'Pending', value: 'pending' as const },
    { label: 'Anomalies', value: 'anomaly' as const },
  ];

  constructor() {
    // React to events changing to recalculate positions and track activity
    effect(() => {
      const events = this.events(); // Listen to raw events
      const currentCat = this.currentCategory();
      
      if (events.length > this.lastEventCount) {
        // New events arrived
        const newEvents = events.slice(this.lastEventCount);
        
        // Update activity flags for categories other than current
        this.categoryActivity.update(activity => {
          const newActivity = { ...activity };
          
          newEvents.forEach(event => {
            // If we are NOT viewing 'all' and NOT viewing the event's category, mark it
            if (currentCat !== 'all' && currentCat !== event.status) {
              newActivity[event.status] = true;
              // Also mark 'all' if we are not on 'all'
              newActivity['all'] = true;
            }
          });
          
          return newActivity;
        });
        
        this.calculateEventPositions();
        setTimeout(() => this.scrollToLatest(), 100);
      } else if (events.length > 0) {
        // Just recalculate positions if count didn't increase (e.g. initial load)
        this.calculateEventPositions();
      }
      
      this.lastEventCount = events.length;
    });
  }
  
  ngOnInit(): void {
    this.generateTimeMarkers();
    // Re-generate markers periodically to keep time current
    setInterval(() => this.generateTimeMarkers(), 60000);
  }

  ngOnDestroy(): void {}

  onCategoryChange(category: 'all' | 'completed' | 'pending' | 'anomaly'): void {
    this.currentCategory.set(category);
    
    // Clear activity flag for the selected category
    this.categoryActivity.update(activity => ({
      ...activity,
      [category]: false
    }));
  }

  // ==================== Calculations ====================

  private calculateEventPositions(): void {
    const events = this.displayEvents();
    const positions = new Map<string, number>();

    if (events.length === 0) {
      this.eventPositions = positions;
      return;
    }

    const now = Date.now();
    const startTime = now - this.selectedPeriod * 60 * 60 * 1000;
    const timeRange = now - startTime;

    events.forEach((event) => {
      const eventTime = new Date(event.timestamp).getTime();
      const timeSinceStart = eventTime - startTime;
      const position = (timeSinceStart / timeRange) * 100;
      // Clamp between 0 and 100
      positions.set(event.id, Math.max(0, Math.min(100, position)));
    });

    this.eventPositions = positions;
  }

  private generateTimeMarkers(): void {
    const markers: TimeMarker[] = [];
    const now = Date.now();
    const startTime = now - this.selectedPeriod * 60 * 60 * 1000;

    // 4 hour interval for 24h view
    const interval = 4; 
    const majorInterval = 8;

    for (let i = 0; i <= this.selectedPeriod; i += interval) {
      const markerTime = startTime + i * 60 * 60 * 1000;
      const position = (i / this.selectedPeriod) * 100;
      const isMajor = i % majorInterval === 0;

      const date = new Date(markerTime);
      const label = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      markers.push({
        time: markerTime,
        label,
        position,
        isMajor,
      });
    }

    this.timeMarkers = markers;
  }

  // ==================== Event Handlers ====================

  showTooltip(event: MouseEvent, workflowEvent: WorkflowEvent): void {
    this.tooltipEvent = workflowEvent;
    
    // Position relative to the target element for stability
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    const tooltipWidth = 220;
    const tooltipHeight = 200;
    const gap = 10; // Space between marker and tooltip

    // Center horizontally above the marker
    let x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let y = rect.top - tooltipHeight - gap;

    // Boundary checks
    if (x < 10) x = 10;
    if (x + tooltipWidth > window.innerWidth - 10) {
      x = window.innerWidth - tooltipWidth - 10;
    }

    // If not enough space above, show below
    if (y < 10) {
      y = rect.bottom + gap;
    }

    this.tooltipPosition = { x, y };
  }

  hideTooltip(): void {
    this.tooltipEvent = null;
  }



  // ==================== Helper Methods ====================

  isNewEvent(event: WorkflowEvent): boolean {
    // Simple check: if event is less than 30 seconds old
    const eventTime = new Date(event.timestamp).getTime();
    return (Date.now() - eventTime) < 30000;
  }

  getEventPosition(eventId: string): number {
    return this.eventPositions.get(eventId) ?? 0;
  }

  scrollToLatest(): void {
    if (!this.timelineWrapper) return;

    const wrapper = this.timelineWrapper.nativeElement;
    wrapper.scrollTo({
      left: wrapper.scrollWidth,
      behavior: 'smooth',
    });
  }

  getEventIcon(type: string): string {
    switch (type) {
      case 'completed': return '✓';
      case 'pending': return '⏱';
      case 'anomaly': return '⚠';
      default: return '●';
    }
  }

  getTypeLabel(type: string): string {
    return type.replace(/_/g, ' ').toUpperCase();
  }

  trackByEventId(index: number, event: WorkflowEvent): string {
    return event.id;
  }

  trackByMarkerTime(index: number, marker: TimeMarker): number {
    return marker.time;
  }
}
