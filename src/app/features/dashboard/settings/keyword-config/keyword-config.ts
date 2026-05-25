import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';

import { KeywordService, KeywordTrigger } from '../../../../core/services/keyword.service';

@Component({
  selector: 'app-keyword-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    TableModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './keyword-config.html',
  styleUrl: './keyword-config.scss'
})
export class KeywordConfig implements OnInit {
  private keywordService = inject(KeywordService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  keywords = signal<KeywordTrigger[]>([]);
  showDialog = false;
  isEditing = false;
  keywordForm!: FormGroup;
  loading = signal(false);

  ngOnInit() {
    this.initForm();
    this.loadKeywords();
  }

  private initForm() {
    this.keywordForm = this.fb.group({
      id: [''],
      keyword: ['', Validators.required],
      response: ['', Validators.required]
    });
  }

  loadKeywords() {
    this.loading.set(true);
    this.keywordService.getKeywords().subscribe({
      next: (data) => {
        this.keywords.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las palabras clave' });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.isEditing = false;
    this.keywordForm.reset({
      id: '',
      keyword: '',
      response: ''
    });
    this.showDialog = true;
  }

  editKeyword(keyword: KeywordTrigger) {
    this.isEditing = true;
    this.keywordForm.patchValue({
      id: keyword.id,
      keyword: keyword.keyword,
      response: keyword.response
    });
    this.showDialog = true;
  }

  saveKeyword() {
    if (this.keywordForm.invalid) return;

    const data = this.keywordForm.value;
    this.loading.set(true);

    if (this.isEditing && data.id) {
      this.keywordService.updateKeyword(data.id, { keyword: data.keyword, response: data.response }).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Palabra clave actualizada correctamente' });
          const currentList = this.keywords();
          const idx = currentList.findIndex(k => k.id === updated.id);
          if (idx !== -1) currentList[idx] = updated;
          this.keywords.set([...currentList]);
          this.showDialog = false;
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
          this.loading.set(false);
        }
      });
    } else {
      this.keywordService.createKeyword({ keyword: data.keyword, response: data.response }).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Palabra clave creada correctamente' });
          this.keywords.set([created, ...this.keywords()]);
          this.showDialog = false;
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
          this.loading.set(false);
        }
      });
    }
  }

  deleteKeyword(keyword: KeywordTrigger) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la palabra clave "${keyword.keyword}"?`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Eliminar', class: 'p-button-danger border-round-lg' },
      rejectButtonProps: { label: 'Cancelar', class: 'p-button-text' },
      accept: () => {
        this.loading.set(true);
        this.keywordService.deleteKeyword(keyword.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Palabra clave eliminada' });
            this.keywords.set(this.keywords().filter(k => k.id !== keyword.id));
            this.loading.set(false);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
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
