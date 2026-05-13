import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/users';

  checkUserExists(email: string): Observable<{ exists: boolean, user: any }> {
    return this.http.get<{ exists: boolean, user: any }>(`${this.apiUrl}/check?email=${encodeURIComponent(email)}`);
  }

  addUserToOrg(email: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-to-org`, { email, role });
  }

  getOrgMembers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/org-members`);
  }

  updateOrgMember(userId: string, data: { role?: string, status?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/org-members/${userId}`, data);
  }

  removeOrgMember(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/org-members/${userId}`);
  }

  getMyMemberships(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-memberships`);
  }

  getAllOrgs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-orgs`);
  }

  getMyInvitations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-invitations`);
  }

  acceptInvitation(organizationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept-invitation`, { organizationId });
  }
}
