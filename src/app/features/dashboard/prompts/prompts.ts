import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PromptsService, Prompt } from '../../../core/services/prompts.service';
import { TemplatesService } from '../../../core/services/templates.service';

@Component({
  selector: 'app-prompts',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    TableModule, 
    DialogModule, 
    InputTextModule, 
    TextareaModule,
    ToggleSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './prompts.html',
  styleUrl: './prompts.scss'
})
export class Prompts implements OnInit {
  private promptsService = inject(PromptsService);
  private templatesService = inject(TemplatesService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  prompts = signal<Prompt[]>([]);
  loading = signal(true);
  showDialog = signal(false);
  promptForm = this.fb.group({
    id: [''],
    name: ['', [Validators.required]],
    content: ['', [Validators.required]],
    isActive: [false]
  });

  isEditing = signal(false);
  saving = signal(false);

  fixedVariables = [
    { label: 'Categorías Catálogo', syntax: '{{categorias}}' },
    { label: 'Instrucción Catálogo', syntax: '{{productos}}' },
    { label: 'Dirección Sucursales', syntax: '{{locales}}' },
    { label: 'Puntos de Encuentro', syntax: '{{encuentros}}' }
  ];

  templateVariables = signal<{ label: string; syntax: string }[]>([]);

  copyToClipboard(syntax: string) {
    navigator.clipboard.writeText(syntax).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: `Copiado al portapapeles: ${syntax}`,
        life: 1500
      });
    }).catch(err => {
      console.error('Error al copiar al portapapeles:', err);
    });
  }

  ngOnInit() {
    this.loadPrompts();
    this.loadTemplatesForVariables();
  }

  loadTemplatesForVariables() {
    this.templatesService.findAll().subscribe({
      next: (data) => {
        const activeTemplates = data.filter(t => t.isActive);
        const vars = activeTemplates.map(t => ({
          label: t.name,
          syntax: `{{${t.name}}}`
        }));
        this.templateVariables.set(vars);
      }
    });
  }

  loadPrompts() {
    this.loading.set(true);
    this.promptsService.findAll().subscribe({
      next: (data) => {
        this.prompts.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openNew() {
    this.isEditing.set(false);
    this.promptForm.reset({ isActive: false });
    this.showDialog.set(true);
  }

  editPrompt(prompt: Prompt) {
    this.isEditing.set(true);
    this.promptForm.patchValue(prompt);
    this.showDialog.set(true);
  }

  savePrompt() {
    if (this.promptForm.invalid) return;
    
    this.saving.set(true);
    const val = this.promptForm.value as Prompt;

    if (this.isEditing() && val.id) {
      this.promptsService.update(val.id, val).subscribe({
        next: () => this.onSaveSuccess('Prompt actualizado'),
        error: () => this.onSaveError()
      });
    } else {
      this.promptsService.create(val).subscribe({
        next: () => this.onSaveSuccess('Prompt creado'),
        error: () => this.onSaveError()
      });
    }
  }

  toggleActive(prompt: Prompt) {
    if (prompt.isActive) return; // Ya está activo
    
    this.promptsService.update(prompt.id!, { isActive: true }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Activado', detail: `Prompt "${prompt.name}" ahora está activo` });
        this.loadPrompts();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo activar' })
    });
  }

  private onSaveSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: msg });
    this.showDialog.set(false);
    this.saving.set(false);
    this.loadPrompts();
  }

  private onSaveError() {
    this.saving.set(false);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el prompt' });
  }

  deletePrompt(prompt: Prompt) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el prompt "${prompt.name}"?`,
      header: 'Confirmar eliminación',
      accept: () => {
        this.promptsService.delete(prompt.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Prompt eliminado' });
            this.loadPrompts();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }
}
