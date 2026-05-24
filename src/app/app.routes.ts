import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home').then(m => m.Home) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register) 
  },
  { 
    path: 'dashboard', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    children: [
        { 
          path: '', 
          loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home').then(m => m.DashboardHome) 
        },
        { 
          path: 'chats', 
          loadComponent: () => import('./features/dashboard/chats/chats').then(m => m.Chats) 
        },
        { 
          path: 'platform-users', 
          loadComponent: () => import('./features/dashboard/platform-users/platform-users').then(m => m.PlatformUsers) 
        },
        { 
          path: 'user-access', 
          loadComponent: () => import('./features/dashboard/user-access/user-access').then(m => m.UserAccess) 
        },
        {
          path: 'organizations',
          loadComponent: () => import('./features/dashboard/organizations/organizations').then(m => m.Organizations)
        },
        {
          path: 'products',
          loadComponent: () => import('./features/dashboard/products/products').then(m => m.Products)
        },
        {
          path: 'products/new',
          loadComponent: () => import('./features/dashboard/products/product-detail/product-detail').then(m => m.ProductDetail)
        },
        {
          path: 'products/:id',
          loadComponent: () => import('./features/dashboard/products/product-detail/product-detail').then(m => m.ProductDetail)
        },
        {
          path: 'prompts',
          loadComponent: () => import('./features/dashboard/prompts/prompts').then(m => m.Prompts)
        },
        { 
          path: 'accounts', 
          loadComponent: () => import('./features/dashboard/accounts/accounts').then(m => m.Accounts) 
        },
        {
          path: 'settings',
          loadComponent: () => import('./features/dashboard/settings/settings').then(m => m.Settings)
        },
        {
          path: 'orders',
          loadComponent: () => import('./features/dashboard/orders/orders').then(m => m.Orders)
        },
        {
          path: 'templates',
          loadComponent: () => import('./features/dashboard/templates/templates').then(m => m.Templates)
        }
    ]
  },
  { path: '**', redirectTo: '' }
];
