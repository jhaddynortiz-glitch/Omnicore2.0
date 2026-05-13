import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

interface OrgDisplayItem {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'platform';
  role?: string;
  count?: number;
  slug?: string;
}

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './organizations.html',
  styleUrl: './organizations.scss'
})
export class Organizations implements OnInit {
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  orgs = signal<OrgDisplayItem[]>([]);
  loading = signal(true);
  processingId = signal<string | null>(null);

  isGlobalAdmin = computed(() => this.authService.isGlobalAdmin());

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    if (this.isGlobalAdmin()) {
      this.usersService.getAllOrgs().subscribe({
        next: (data) => {
          this.orgs.set(data.map(o => ({
            id: o.id,
            name: o.name,
            status: 'platform',
            count: o._count?.users || 0,
            slug: o.slug
          })));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.usersService.getMyMemberships().subscribe({
        next: (memberships) => {
          this.orgs.set(memberships.map(m => ({
            id: m.organizationId,
            name: m.Organization.name,
            status: m.status as any,
            role: m.role,
            slug: m.Organization.slug
          })));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  getRoleLabel(role?: string): string {
    if (!role) return 'N/A';
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'super-admin': return 'Super Admin';
      default: return role;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'En Espera';
      case 'platform': return 'Plataforma';
      default: return status;
    }
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warn';
      case 'platform': return 'info';
      default: return 'secondary';
    }
  }

  handleAction(org: OrgDisplayItem) {
    if (org.status === 'pending') {
      this.acceptInvitation(org.id);
    } else {
      this.switchOrg(org.id);
    }
  }

  private acceptInvitation(orgId: string) {
    this.processingId.set(orgId);
    this.usersService.acceptInvitation(orgId).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: '¡Bienvenido!', detail: `Te has unido a ${res.Organization.name}` });
        this.loadData();
        this.switchOrg(orgId);
      },
      error: (err) => {
        this.processingId.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo aceptar' });
      }
    });
  }

  private switchOrg(orgId: string) {
    this.processingId.set(orgId);
    this.authService.switchOrganization(orgId).subscribe({
      next: () => {
        this.processingId.set(null);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.processingId.set(null);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar de organización' });
      }
    });
  }
}
