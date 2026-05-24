import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  body: string;
  mediaUrl?: string;
  mimeType?: string;
  isFromMe: boolean;
  type: string;
  contactId: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name: string;
  unreadCount: number;
  organizationId: string;
  createdAt: string;
  messages: ChatMessage[];
  orders?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/whatsapp/contacts`;

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  createContact(name: string, phoneNumber: string): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, { name, phoneNumber });
  }

  getMessagesByContact(contactId: string, limit?: number, cursor?: string): Observable<ChatMessage[]> {
    const url = `${environment.apiUrl}/whatsapp/messages/${contactId}`;
    let params = new HttpParams();
    
    if (limit) params = params.set('limit', limit.toString());
    if (cursor) params = params.set('cursor', cursor);
    
    return this.http.get<ChatMessage[]>(url, { params });
  }

  sendMessage(contactId: string, text: string, type: string = 'text', mediaUrl?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/whatsapp/messages/${contactId}`, { text, type, mediaUrl });
  }

  uploadFile(file: File): Observable<{ url: string, filename: string, mimetype: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string, filename: string, mimetype: string }>(`${environment.apiUrl}/upload`, formData);
  }

  markAsRead(contactId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/whatsapp/contacts/${contactId}/read`, {});
  }
}
