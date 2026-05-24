import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DeliveryRadius {
  id?: string;
  distanceKm: number;
  price: number;
}

export interface DeliveryZone {
  id?: string;
  city: string;
  lat: number;
  lng: number;
  radii: DeliveryRadius[];
}

export interface StoreLocation {
  id?: string;
  city: string;
  address: string;
  description?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}

export interface MeetingPoint {
  id?: string;
  city: string;
  name: string;
  address?: string;
  schedule: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogisticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/logistics`;

  // ==========================================
  // DELIVERY ZONES
  // ==========================================
  findAllDeliveryZones(): Observable<DeliveryZone[]> {
    return this.http.get<DeliveryZone[]>(`${this.apiUrl}/delivery-zones`);
  }

  createDeliveryZone(data: Partial<DeliveryZone>): Observable<DeliveryZone> {
    return this.http.post<DeliveryZone>(`${this.apiUrl}/delivery-zones`, data);
  }

  updateDeliveryZone(id: string, data: Partial<DeliveryZone>): Observable<DeliveryZone> {
    return this.http.patch<DeliveryZone>(`${this.apiUrl}/delivery-zones/${id}`, data);
  }

  deleteDeliveryZone(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delivery-zones/${id}`);
  }

  // ==========================================
  // STORE LOCATIONS
  // ==========================================
  findAllStoreLocations(): Observable<StoreLocation[]> {
    return this.http.get<StoreLocation[]>(`${this.apiUrl}/store-locations`);
  }

  createStoreLocation(data: Partial<StoreLocation>): Observable<StoreLocation> {
    return this.http.post<StoreLocation>(`${this.apiUrl}/store-locations`, data);
  }

  updateStoreLocation(id: string, data: Partial<StoreLocation>): Observable<StoreLocation> {
    return this.http.patch<StoreLocation>(`${this.apiUrl}/store-locations/${id}`, data);
  }

  deleteStoreLocation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/store-locations/${id}`);
  }

  // ==========================================
  // MEETING POINTS
  // ==========================================
  findAllMeetingPoints(): Observable<MeetingPoint[]> {
    return this.http.get<MeetingPoint[]>(`${this.apiUrl}/meeting-points`);
  }

  createMeetingPoint(data: Partial<MeetingPoint>): Observable<MeetingPoint> {
    return this.http.post<MeetingPoint>(`${this.apiUrl}/meeting-points`, data);
  }

  updateMeetingPoint(id: string, data: Partial<MeetingPoint>): Observable<MeetingPoint> {
    return this.http.patch<MeetingPoint>(`${this.apiUrl}/meeting-points/${id}`, data);
  }

  deleteMeetingPoint(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/meeting-points/${id}`);
  }
}
