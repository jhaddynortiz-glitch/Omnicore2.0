import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  Product?: any;
}

export interface Order {
  id?: string;
  status: string; // PENDING, CONFIRMED, CANCELLED, EN_COLA, ASIGNADO, ENTREGADO
  deliveryMethod?: string; // DELIVERY, LOCAL, MEETING
  deliveryCost: number;
  shippingAddress?: string;
  lat?: number;
  lng?: number;
  deliveryContactId?: string; // optional ID of assigned delivery contact
  DeliveryContact?: any; // optional full delivery contact object from backend
  contactId: string;
  Contact?: any;
  storeLocationId?: string;
  StoreLocation?: any;
  meetingPointId?: string;
  MeetingPoint?: any;
  total: number;
  items?: OrderItem[];
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  findAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  create(order: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateStatus(id: string, status: string, deliveryContactId?: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status, deliveryContactId });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
