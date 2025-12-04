import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() isLive = true;
  @Input() lastUpdated: Date | null = null;
  @Input() isDark = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() toggleLive = new EventEmitter<void>();
  @Output() toggleTheme = new EventEmitter<void>();
}
