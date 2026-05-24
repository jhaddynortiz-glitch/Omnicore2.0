import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OperationContact {
  id?: string;
  name: string;
  phoneNumber: string;
  type: 'ADMIN' | 'DELIVERY';
  userId?: string | null;
  User?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  organizationId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OperationContactsService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/operation-contacts`;

  getContacts(): Observable<OperationContact[]> {
    return this.http.get<OperationContact[]>(this.apiUrl);
  }

  createContact(data: OperationContact): Observable<OperationContact> {
    return this.http.post<OperationContact>(this.apiUrl, data);
  }

  updateContact(id: string, data: Partial<OperationContact>): Observable<OperationContact> {
    return this.http.patch<OperationContact>(`${this.apiUrl}/${id}`, data);
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
