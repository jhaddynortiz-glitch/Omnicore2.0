import { Component, HostListener, inject, computed, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../shared/components/navbar/navbar';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonModule, RouterModule, Navbar, NgClass, NgIf, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;

  private menuItemsList: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Chats', icon: 'pi pi-comments', route: '/dashboard/chats' },
    { label: 'Catálogo', icon: 'pi pi-shopping-bag', route: '/dashboard/products' },
    { label: 'Prompts', icon: 'pi pi-bolt', route: '/dashboard/prompts' },
    { label: 'Organizaciones', icon: 'pi pi-building', route: '/dashboard/organizations' },
    { label: 'User Access', icon: 'pi pi-shield', route: '/dashboard/user-access' }
    //{ label: 'Platform Users', icon: 'pi pi-users', route: '/dashboard/platform-users' },
    //{ label: 'Accounts', icon: 'pi pi-building', route: '/dashboard/accounts' }
  ];

  // Si el usuario no tiene org activa, solo muestra un subset
  hasActiveOrg = computed(() => {
    const user = this.authService.user();
    return !!user?.activeOrganizationId;
  });

  filteredMenuItems = computed(() => {
    const user = this.authService.user();
    if (!user) return [];

    const isGlobalAdmin = this.authService.isGlobalAdmin();
    const role = this.authService.currentRole();
    const activeOrg = user.activeOrganizationId;

    // Si NO hay organización activa Y NO es Global Admin, solo ve Organizaciones
    if (!activeOrg && !isGlobalAdmin) {
      return this.menuItemsList.filter(item => item.label === 'Organizaciones');
    }

    if (isGlobalAdmin) return this.menuItemsList;

    // Filtros por rol dentro de organización
    if (role === 'admin' || role === 'super-admin') {
      return this.menuItemsList.filter(item =>
        ['Dashboard', 'Chats', 'Organizaciones', 'User Access', 'Catálogo', 'Prompts'].includes(item.label)
      );
    }

    return this.menuItemsList.filter(item =>
      ['Dashboard', 'Organizaciones', 'Catálogo'].includes(item.label)
    );
  });

  ngOnInit() {
    // Redirigir si no tiene organización y no es admin global
    const user = this.authService.user();
    if (user && !user.activeOrganizationId && !this.authService.isGlobalAdmin()) {
      if (!this.router.url.includes('organizations')) {
        this.router.navigate(['/dashboard/organizations']);
      }
    }
  }

  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  onMobileNavClick() {
    if (this.isMobile) {
      this.isMobileSidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.isMobile && this.isMobileSidebarOpen) {
      this.isMobileSidebarOpen = false;
    }
  }
}
