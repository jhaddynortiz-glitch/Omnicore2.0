import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OrganizationsService } from '../../../core/services/organizations.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, ToastModule, DividerModule, PasswordModule],
  providers: [MessageService],
  templateUrl: './settings.html',
  styles: [`
    .settings-container {
      max-width: 900px;
      margin: 2rem auto;
    }
    .field {
      margin-bottom: 2rem;
    }
    label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
      font-size: 0.95rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: var(--primary-color);
    }
    .p-card {
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .helper-text {
      font-size: 0.85rem;
      color: var(--text-color-secondary);
      margin-top: 0.5rem;
      display: block;
    }
  `]
})
export class Settings implements OnInit {
  private orgService = inject(OrganizationsService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  orgData: any = {
    name: '',
    whatsappToken: '',
    whatsappPhoneId: '',
    whatsappVerifyToken: '',
    openaiApiKey: '',
  };

  loading = false;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    const user = this.authService.user();
    const orgId = user?.activeOrganizationId;

    if (!orgId) return;

    this.orgService.getById(orgId).subscribe({
      next: (data) => {
        this.orgData = data;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración' });
      }
    });
  }

  saveSettings() {
    const user = this.authService.user();
    const orgId = user?.activeOrganizationId;

    if (!orgId) return;

    this.loading = true;
    this.orgService.update(orgId, this.orgData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Configuración actualizada correctamente' });
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar los cambios' });
        this.loading = false;
      }
    });
  }
}
