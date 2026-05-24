import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Template {
  id?: string;
  name: string;
  content: string;
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/templates`;

  findAll(): Observable<Template[]> {
    return this.http.get<Template[]>(this.apiUrl);
  }

  getById(id: string): Observable<Template> {
    return this.http.get<Template>(`${this.apiUrl}/${id}`);
  }

  create(template: Partial<Template>): Observable<Template> {
    return this.http.post<Template>(this.apiUrl, template);
  }

  update(id: string, template: Partial<Template>): Observable<Template> {
    return this.http.patch<Template>(`${this.apiUrl}/${id}`, template);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
