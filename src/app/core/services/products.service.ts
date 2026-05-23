import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Subcategory } from './subcategories.service';

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  currency: string;
  stock: number;
  isActive: boolean;
  subcategoryId?: string;
  facebookAdId?: string;
  Subcategory?: Subcategory;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  findAll(filters?: { categoryId?: string; subcategoryId?: string; search?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.subcategoryId) params = params.set('subcategoryId', filters.subcategoryId);
    if (filters?.search) params = params.set('search', filters.search);
    
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
