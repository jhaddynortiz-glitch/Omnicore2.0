import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { ChatMessage, Contact } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  
  // Observable stream to broadcast incoming messages across the app
  public newMessage$ = new Subject<ChatMessage>();

  constructor() {
    this.socket = io(environment.apiUrl);

    this.socket.on('connect', () => {
      console.log('✅ OmniCore Web conectado en Tiempo Real');
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ Se perdió la conexión WebSocket de OmniCore Web');
    });

    this.socket.on('newMessage', (payload: ChatMessage) => {
      console.log('📬 WS Message Inbound:', payload);
      this.newMessage$.next(payload);
    });

    this.socket.on('contactUpdated', (payload: Contact) => {
      console.log('👤 WS Contact Updated:', payload);
      this.contactUpdated$.next(payload);
    });
  }

  public contactUpdated$ = new Subject<Contact>();

  // Future use: explicitly manually reconnect or disconnect
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
