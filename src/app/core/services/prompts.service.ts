import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Prompt {
  id?: string;
  name: string;
  content: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromptsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prompts`;

  findAll(): Observable<Prompt[]> {
    return this.http.get<Prompt[]>(this.apiUrl);
  }

  create(prompt: Prompt): Observable<Prompt> {
    return this.http.post<Prompt>(this.apiUrl, prompt);
  }

  update(id: string, prompt: Partial<Prompt>): Observable<Prompt> {
    return this.http.patch<Prompt>(`${this.apiUrl}/${id}`, prompt);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
