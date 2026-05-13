import { Component, inject, Input, Output, EventEmitter, OnInit, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, ButtonModule, MenuModule, NgClass, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  @Input() layoutStyle: 'landing' | 'dashboard' = 'landing';
  @Input() showLoginButton: boolean = true;
  @Output() sidebarToggle = new EventEmitter<void>();

  themeService = inject(ThemeService);
  authService = inject(AuthService);

  userMenuItems = computed<MenuItem[]>(() => {
    const user = this.authService.user();
    if (!user) return [];

    const globalRoleItem: MenuItem | null = user.globalRole !== 'NONE' ? {
      label: `Global: ${user.globalRole}`,
      icon: 'pi pi-globe',
      disabled: true,
      styleClass: 'global-role-badge'
    } : null;

    const orgItems: MenuItem[] = (user.organizations || []).map(org => ({
      label: org.name,
      icon: org.id === user.activeOrganizationId ? 'pi pi-check' : 'pi pi-building',
      command: () => {
        if (org.id !== user.activeOrganizationId) {
          this.authService.switchOrganization(org.id).subscribe();
        }
      }
    }));

    const roleItem: MenuItem = {
      label: `Rol: ${user.activeRole}`,
      icon: 'pi pi-shield',
      disabled: true
    };

    const menu: MenuItem[] = [
      {
        label: user.fullName || user.email,
        items: globalRoleItem ? [globalRoleItem, roleItem] : [roleItem]
      },
      {
        label: 'Tus Organizaciones',
        items: orgItems
      },
      {
        label: 'Sesión',
        items: [
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => this.onLogout()
          }
        ]
      }
    ];

    return menu;
  });

  ngOnInit() {}

  onLogout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }

  onMenuClick() {
    this.sidebarToggle.emit();
  }
}
