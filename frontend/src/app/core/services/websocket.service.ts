import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebSocketMessage } from '../models/workflow.models';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<WebSocketMessage>();
  private connectionStatusSubject = new Subject<'connected' | 'disconnected' | 'error'>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  
  readonly WS_URL = (window as any)['WS_URL'] || 'ws://localhost:3000';
  
  get messages$(): Observable<WebSocketMessage> {
    return this.messageSubject.asObservable();
  }
  
  get connectionStatus$(): Observable<'connected' | 'disconnected' | 'error'> {
    return this.connectionStatusSubject.asObservable();
  }
  
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    try {
      this.socket = new WebSocket(this.WS_URL);
      
      this.socket.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectionStatusSubject.next('connected');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatusSubject.next('error');
      };
      
      this.socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.connectionStatusSubject.next('disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatusSubject.next('error');
      this.attemptReconnect();
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
  
  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }
  
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Giving up.');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
}
