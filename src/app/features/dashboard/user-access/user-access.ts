import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../../core/services/users.service';

interface OrgMember {
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  createdAt: string;
  User: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
}

@Component({
  selector: 'app-user-access',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    DialogModule, 
    InputTextModule, 
    RadioButtonModule,
    CardModule,
    ToastModule,
    TagModule,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './user-access.html',
  styleUrl: './user-access.scss'
})
export class UserAccess implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);

  showModal = signal(false);
  currentStep = signal(1);
  loading = signal(false);
  members = signal<OrgMember[]>([]);
  emailError = signal<string | null>(null);
  emailVerified = signal(false);
  checkingEmail = signal(false);

  showEditModal = signal(false);
  selectedMember = signal<OrgMember | null>(null);
  editRole = signal('admin');
  editStatus = signal('active');

  userForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  roles = [
    { label: 'Administrador', value: 'admin', desc: 'Puede gestionar chats, usuarios y ver el dashboard.', icon: 'pi pi-shield' },
    { label: 'Editor', value: 'editor', desc: 'Puede ver y responder chats asignados.', icon: 'pi pi-pencil' }
  ];

  statuses = [
    { label: 'Activo', value: 'active', icon: 'pi pi-check-circle', class: 'text-green-500' },
    { label: 'En Espera', value: 'pending', icon: 'pi pi-clock', class: 'text-orange-500' }
  ];

  selectedRole = signal('admin');

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.usersService.getOrgMembers().subscribe({
      next: (members) => this.members.set(members.filter(m => m.role !== 'super-admin')),
      error: () => {}
    });
  }

  openAddModal() {
    this.userForm.reset();
    this.currentStep.set(1);
    this.emailError.set(null);
    this.emailVerified.set(false);
    this.selectedRole.set('admin');
    this.showModal.set(true);
  }

  verifyAndNext() {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const email = this.userForm.value.email!;
    this.checkingEmail.set(true);
    this.emailError.set(null);

    this.usersService.checkUserExists(email).subscribe({
      next: (res) => {
        this.checkingEmail.set(false);
        if (res.exists) {
          if (res.user?.globalRole === 'SUPER_ADMIN') {
            this.emailError.set('No se puede invitar a un Super Admin. Ya tienen acceso total.');
            return;
          }
          this.emailVerified.set(true);
          this.currentStep.set(2);
        } else {
          this.emailError.set('Este correo no está registrado en la plataforma. El usuario debe registrarse primero.');
        }
      },
      error: () => {
        this.checkingEmail.set(false);
        this.emailError.set('Error verificando el correo. Intenta de nuevo.');
      }
    });
  }

  prevStep() {
    this.currentStep.set(1);
  }

  saveUser() {
    const email = this.userForm.value.email!;
    const role = this.selectedRole();

    this.loading.set(true);
    this.usersService.addUserToOrg(email, role).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Invitación enviada', detail: `Se ha invitado al usuario con el rol de ${role}` });
        this.showModal.set(false);
        this.loading.set(false);
        this.loadMembers();
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo vincular al usuario';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.loading.set(false);
      }
    });
  }

  openEditModal(member: OrgMember) {
    this.selectedMember.set(member);
    this.editRole.set(member.role);
    this.editStatus.set(member.status);
    this.showEditModal.set(true);
  }

  updateMember() {
    const member = this.selectedMember();
    if (!member) return;

    this.loading.set(true);
    this.usersService.updateOrgMember(member.userId, {
      role: this.editRole(),
      status: this.editStatus()
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Los accesos del usuario se han guardado correctamente.' });
        this.showEditModal.set(false);
        this.loading.set(false);
        this.loadMembers();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al actualizar el usuario.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.loading.set(false);
      }
    });
  }

  removeMember() {
    const member = this.selectedMember();
    if (!member) return;
    
    // Podríamos usar un confirm de primeNG, pero un confirm nativo es más rápido de implementar por ahora si no hay ConfirmDialog configurado,
    // o simplemente un botón con estilo Danger en el propio diálogo. Como tenemos un botón específico, simplemente llamamos al endpoint.
    
    this.loading.set(true);
    this.usersService.removeOrgMember(member.userId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'El usuario fue removido de la organización.' });
        this.showEditModal.set(false);
        this.loading.set(false);
        this.loadMembers();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al remover al usuario.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
        this.loading.set(false);
      }
    });
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warn';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'En Espera';
      default: return status;
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'super-admin': return 'Super Admin';
      default: return role;
    }
  }
}
