import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Category } from './categories.service';

export interface Subcategory {
  id?: string;
  name: string;
  categoryId: string;
  Category?: Category;
}

@Injectable({
  providedIn: 'root'
})
export class SubcategoriesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subcategories`;

  findAll(categoryId?: string): Observable<Subcategory[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this.http.get<Subcategory[]>(this.apiUrl, { params });
  }

  create(sub: Subcategory): Observable<Subcategory> {
    return this.http.post<Subcategory>(this.apiUrl, sub);
  }

  update(id: string, sub: Partial<Subcategory>): Observable<Subcategory> {
    return this.http.patch<Subcategory>(`${this.apiUrl}/${id}`, sub);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
