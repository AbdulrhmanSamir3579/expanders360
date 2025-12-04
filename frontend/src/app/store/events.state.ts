import {Injectable, signal, computed} from '@angular/core';
import {WorkflowEvent} from '@core/models/workflow.models';


@Injectable({providedIn: 'root'})
export class EventsState {
  private _events = signal<WorkflowEvent[]>([]);
  private _loading = signal<boolean>(true);
  private _error = signal<string | null>(null);

  readonly events = this._events.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly eventsLast24Hours = computed(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return this._events()
      .filter(e => new Date(e.timestamp) >= twentyFourHoursAgo)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  addEvent(event: WorkflowEvent): void {
    this._events.update(events => [...events, event]);
  }

  setEvents(events: WorkflowEvent[]): void {
    this._events.set(events);
  }

  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }
}
