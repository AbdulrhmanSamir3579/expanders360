import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Toast Notification Component
 * Displays temporary notification messages
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];
  
  ngOnInit(): void {
    // Example usage - in real app, this would be managed by a service
  }
  
  show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString();
    const newToast: Toast = { ...toast, id, duration: toast.duration || 5000 };
    this.toasts.push(newToast);
    
    setTimeout(() => {
      this.dismiss(id);
    }, newToast.duration);
  }
  
  dismiss(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
