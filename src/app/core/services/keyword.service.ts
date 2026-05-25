import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface KeywordTrigger {
  id: string;
  keyword: string;
  response: string;
  organizationId: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeywordService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/keywords`;

  getKeywords(): Observable<KeywordTrigger[]> {
    return this.http.get<KeywordTrigger[]>(this.apiUrl);
  }

  createKeyword(data: { keyword: string; response: string }): Observable<KeywordTrigger> {
    return this.http.post<KeywordTrigger>(this.apiUrl, data);
  }

  updateKeyword(id: string, data: { keyword?: string; response?: string }): Observable<KeywordTrigger> {
    return this.http.patch<KeywordTrigger>(`${this.apiUrl}/${id}`, data);
  }

  deleteKeyword(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
