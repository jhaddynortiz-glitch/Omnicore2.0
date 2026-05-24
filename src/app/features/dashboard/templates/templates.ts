import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { TemplatesService, Template } from '../../../core/services/templates.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    TooltipModule,
    ToggleSwitchModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './templates.html',
  styles: [`
    .templates-container {
      max-width: 1200px;
      margin: 2rem auto;
    }
    .whatsapp-preview-container {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--surface-border);
      height: 380px;
      display: flex;
      flex-column: column;
    }
    .whatsapp-header {
      background-color: #075E54;
      color: white;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: bold;
    }
    .whatsapp-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #ECE5DD;
      color: #075E54;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .whatsapp-body {
      flex-grow: 1;
      background-color: #efeae2; /* Default Light Mode WA BG */
      background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
      background-blend-mode: overlay;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    :host-context(html.app-dark) .whatsapp-body {
      background-color: #0b141a; /* Dark Mode WA BG */
      background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
      background-blend-mode: multiply;
    }
    .whatsapp-bubble {
      max-width: 85%;
      align-self: flex-end;
      background-color: #d9fdd3; /* Light Mode checked bubble */
      color: #111b21;
      padding: 0.6rem 0.8rem;
      border-radius: 8px 0px 8px 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      font-size: 0.9rem;
      line-height: 1.4;
      white-space: pre-wrap;
      position: relative;
    }
    :host-context(html.app-dark) .whatsapp-bubble {
      background-color: #005c4b; /* Dark Mode checked bubble */
      color: #e9edef;
    }
    .whatsapp-bubble-incoming {
      max-width: 85%;
      align-self: flex-start;
      background-color: #ffffff; /* Light Mode incoming bubble */
      color: #111b21;
      padding: 0.6rem 0.8rem;
      border-radius: 0px 8px 8px 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      font-size: 0.9rem;
      line-height: 1.4;
      white-space: pre-wrap;
      position: relative;
    }
    :host-context(html.app-dark) .whatsapp-bubble-incoming {
      background-color: #202c33; /* Dark Mode incoming bubble */
      color: #e9edef;
    }
    .whatsapp-time {
      font-size: 0.65rem;
      color: #667781;
      text-align: right;
      margin-top: 0.25rem;
      display: block;
    }
    :host-context(html.app-dark) .whatsapp-time {
      color: #8696a0;
    }
    .variable-tag {
      cursor: pointer;
      background-color: #FF634A; /* Opaline primary color */
      color: white !important;
      font-size: 0.8rem;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .variable-tag:hover {
      opacity: 0.9;
    }
    .preview-placeholder {
      font-style: italic;
      color: #667781;
    }
  `]
})
export class Templates implements OnInit {
  private templatesService = inject(TemplatesService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  templates = signal<Template[]>([]);
  loading = signal(false);

  showDialog = false;
  isEditing = false;
  templateForm!: FormGroup;

  availableVariables = [
    { label: 'Nombre Cliente', syntax: '{{cliente}}' },
    { label: 'Productos', syntax: '{{productos}}' },
    { label: 'Total Pagar', syntax: '{{total}}' },
    { label: 'Costo Delivery', syntax: '{{costo_envio}}' },
    { label: 'Ubicación / Sucursal', syntax: '{{ubicacion}}' }
  ];

  readonly placeholderText = 'Hola {{cliente}},\n\nTu pedido ha sido registrado:\n{{productos}}\n\nCosto Delivery: {{costo_envio}}\nTotal a Pagar: {{total}}...';

  ngOnInit() {
    this.initForm();
    this.loadTemplates();
  }

  private initForm() {
    this.templateForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      content: ['', Validators.required],
      isActive: [true]
    });
  }

  loadTemplates() {
    this.loading.set(true);
    this.templatesService.findAll().subscribe({
      next: (data) => {
        this.templates.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las plantillas' });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.isEditing = false;
    this.templateForm.reset({
      id: '',
      name: '',
      content: '',
      isActive: true
    });
    this.showDialog = true;
  }

  editTemplate(template: Template) {
    this.isEditing = true;
    this.templateForm.patchValue(template);
    this.showDialog = true;
  }

  insertVariable(syntax: string) {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = this.templateForm.get('content')?.value || '';
    
    const newText = text.substring(0, startPos) + syntax + text.substring(endPos, text.length);
    this.templateForm.patchValue({ content: newText });

    // Focus back and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + syntax.length, startPos + syntax.length);
    }, 50);
  }

  onDragStart(event: DragEvent, syntax: string) {
    event.dataTransfer?.setData('text/plain', syntax);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    // We let the browser insert the text natively at the correct drop cursor position.
    // We wait a tiny tick for the DOM to update, then update our form control.
    setTimeout(() => {
      const textarea = event.target as HTMLTextAreaElement;
      if (textarea) {
        this.templateForm.patchValue({ content: textarea.value });
      }
    }, 50);
  }

  saveTemplate() {
    if (this.templateForm.invalid) return;

    const data = this.templateForm.value;
    const request = this.isEditing && data.id
      ? this.templatesService.update(data.id, data)
      : this.templatesService.create(data);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditing ? 'Plantilla actualizada' : 'Plantilla creada'
        });
        this.showDialog = false;
        this.loadTemplates();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la plantilla' });
      }
    });
  }

  deleteTemplate(template: Template) {
    if (!confirm(`¿Eliminar la plantilla "${template.name}"?`)) return;

    this.templatesService.delete(template.id!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plantilla eliminada' });
        this.loadTemplates();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la plantilla' });
      }
    });
  }

  get formattedPreview(): string {
    const content = this.templateForm.get('content')?.value || '';
    if (!content) return '';

    // Replace variables with friendly mock values for preview
    return content
      .replace(/\{\{cliente\}\}/g, 'Juan Perez')
      .replace(/\{\{productos\}\}/g, '1x Hamburguesa Clásica (25 Bs)\n1x Coca Cola (7 Bs)')
      .replace(/\{\{total\}\}/g, '42 Bs')
      .replace(/\{\{costo_envio\}\}/g, '10 Bs')
      .replace(/\{\{ubicacion\}\}/g, 'Av. Banzer y 3er Anillo (Santa Cruz)');
  }
}
