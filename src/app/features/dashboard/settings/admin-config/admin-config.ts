import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';

import { OperationContactsService, OperationContact } from '../../../../core/services/operation-contacts.service';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    DialogModule,
    SelectModule,
    TableModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-config.html',
  styleUrl: './admin-config.scss'
})
export class AdminConfig implements OnInit {
  private operationContactsService = inject(OperationContactsService);
  private usersService = inject(UsersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  contacts = signal<OperationContact[]>([]);
  orgMembers = signal<any[]>([]);
  showDialog = false;
  isEditing = false;
  contactForm!: FormGroup;
  loading = signal(false);

  contactTypes = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Repartidor / Delivery', value: 'DELIVERY' }
  ];

  ngOnInit() {
    this.initForm();
    this.loadContacts();
    this.loadOrgMembers();
  }

  private initForm() {
    this.contactForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      type: ['ADMIN', Validators.required],
      userId: [null]
    });
  }

  loadContacts() {
    this.loading.set(true);
    this.operationContactsService.getConfigContacts().subscribe({
      next: (data) => {
        this.contacts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los contactos de operación' });
        this.loading.set(false);
      }
    });
  }

  loadOrgMembers() {
    this.usersService.getOrgMembers().subscribe({
      next: (members) => {
        this.orgMembers.set(members.map((m: any) => m.User).filter((u: any) => u !== null));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios de la organización' });
      }
    });
  }

  openNew() {
    this.isEditing = false;
    this.contactForm.reset({
      id: '',
      name: '',
      phoneNumber: '',
      type: 'ADMIN',
      userId: null
    });
    this.showDialog = true;
  }

  editContact(contact: OperationContact) {
    this.isEditing = true;
    this.contactForm.patchValue({
      id: contact.id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      type: contact.type,
      userId: contact.userId
    });
    this.showDialog = true;
  }

  saveContact() {
    if (this.contactForm.invalid) return;

    const data = this.contactForm.value;
    
    // We update the contact list locally and call standard save.
    // The bulk endpoint or individual endpoints can be used. Let's use bulk endpoints as it matches our new spec perfectly!
    const currentList = [...this.contacts()];
    
    if (this.isEditing && data.id) {
      const idx = currentList.findIndex(c => c.id === data.id);
      if (idx !== -1) {
        currentList[idx] = data;
      }
    } else {
      currentList.push({ ...data, id: undefined });
    }

    this.loading.set(true);
    this.operationContactsService.updateConfigContacts(currentList).subscribe({
      next: (updatedList) => {
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Contactos actualizados correctamente' });
        this.showDialog = false;
        this.contacts.set(updatedList);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los cambios en los contactos' });
        this.loading.set(false);
      }
    });
  }

  deleteContact(contact: OperationContact) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el contacto "${contact.name}"?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Eliminar', class: 'p-button-danger border-round-lg' },
      rejectButtonProps: { label: 'Cancelar', class: 'p-button-text' },
      accept: () => {
        const filteredList = this.contacts().filter(c => c.id !== contact.id);
        this.loading.set(true);
        this.operationContactsService.updateConfigContacts(filteredList).subscribe({
          next: (updatedList) => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Contacto eliminado' });
            this.contacts.set(updatedList);
            this.loading.set(false);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el contacto' });
            this.loading.set(false);
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/settings']);
  }
}
