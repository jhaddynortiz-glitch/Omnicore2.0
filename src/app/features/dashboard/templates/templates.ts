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
    .content-editable-editor {
      height: 240px;
      overflow-y: auto;
      outline: none;
      white-space: pre-wrap;
      word-break: break-word;
      border: 1px solid #cbd5e1; /* Visible, noticeable border */
      border-radius: 6px;
      background-color: var(--surface-card);
      color: var(--text-color);
      padding: 0.75rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .content-editable-editor:focus {
      border-color: #FF634A !important;
      box-shadow: 0 0 0 0.2rem rgba(255, 99, 74, 0.2) !important;
    }
    :host-context(html.app-dark) .content-editable-editor {
      border: 1px solid #333333;
    }
    .content-editable-editor:empty:before {
      content: attr(placeholder);
      color: #848488;
      font-style: italic;
      pointer-events: none;
      display: block;
    }
    :host-context(html.app-dark) .content-editable-editor:empty:before {
      color: #646468;
    }
    .variable-chip {
      background-color: #e2e8f0; /* Light slate background */
      color: #334155 !important; /* Dark slate text */
      font-weight: 500;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px; /* Pill style */
      margin: 0px 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      user-select: none;
      -webkit-user-drag: none;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    :host-context(html.app-dark) .variable-chip {
      background-color: #334155;
      color: #f1f5f9 !important;
      border-color: #475569;
    }
    .chip-text {
      line-height: 1;
    }
    .chip-close {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      font-size: 0.75rem;
      color: #64748b;
      line-height: 1;
      transition: background-color 0.2s, color 0.2s;
    }
    .chip-close:hover {
      background-color: #cbd5e1;
      color: #1e293b;
    }
    :host-context(html.app-dark) .chip-close:hover {
      background-color: #475569;
      color: #f1f5f9;
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
    { label: 'Ciudad Cliente', syntax: '{{ciudad}}' },
    { label: 'Dirección Cliente', syntax: '{{direccion}}' },
    { label: 'Teléfono Cliente', syntax: '{{telefono}}' },
    { label: 'Productos (Resumen)', syntax: '{{productos}}' },
    { label: 'Total Pagar', syntax: '{{total}}' },
    { label: 'Costo Delivery', syntax: '{{costo_envio}}' },
    { label: 'Ubicación / Sucursal', syntax: '{{ubicacion}}' },
    { label: 'Nombre de Producto', syntax: '{{nombre_producto}}' },
    { label: 'Precio de Producto', syntax: '{{precio_producto}}' },
    { label: 'Descripción Producto', syntax: '{{descripcion_producto}}' }
  ];

  readonly placeholderText = 'Hola {{cliente}},\n\nTu pedido ha sido registrado:\n{{productos}}\n\nCosto Delivery: {{costo_envio}}\nTotal a Pagar: {{total}}...';

  ngOnInit() {
    this.initForm();
    this.loadTemplates();
  }

  private initForm() {
    this.templateForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_ñÑáéíóúÁÉÍÓÚüÜ]+$/)]],
      content: ['', Validators.required],
      isActive: [true]
    });
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    // Reemplazar espacios por guiones bajos
    value = value.replace(/\s+/g, '_');
    this.templateForm.get('name')?.setValue(value, { emitEvent: false });
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

    // Populate editor on next tick
    setTimeout(() => {
      const editor = document.getElementById('template-content');
      if (editor) {
        editor.innerHTML = '';
      }
    }, 50);
  }

  editTemplate(template: Template) {
    this.isEditing = true;
    this.templateForm.patchValue(template);
    this.showDialog = true;

    // Populate editor on next tick
    setTimeout(() => {
      const editor = document.getElementById('template-content');
      if (editor) {
        editor.innerHTML = this.textToHtml(template.content);
      }
    }, 50);
  }

  textToHtml(text: string): string {
    if (!text) return '';
    
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const varMap: { [key: string]: string } = {
      '{{cliente}}': 'Nombre Cliente',
      '{{ciudad}}': 'Ciudad Cliente',
      '{{direccion}}': 'Dirección Cliente',
      '{{telefono}}': 'Teléfono Cliente',
      '{{productos}}': 'Productos (Resumen)',
      '{{total}}': 'Total Pagar',
      '{{costo_envio}}': 'Costo Delivery',
      '{{ubicacion}}': 'Ubicación / Sucursal',
      '{{nombre_producto}}': 'Nombre de Producto',
      '{{precio_producto}}': 'Precio de Producto',
      '{{descripcion_producto}}': 'Descripción Producto'
    };

    Object.keys(varMap).forEach(syntax => {
      const label = varMap[syntax];
      const chipHtml = `<span class="variable-chip" contenteditable="false" data-syntax="${syntax}"><span class="chip-text">${label}</span><span class="chip-close">&times;</span></span>`;
      const escapedSyntax = syntax.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedSyntax, 'g');
      html = html.replace(regex, chipHtml);
    });

    return html;
  }

  htmlToText(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return this.traverseNodes(tempDiv);
  }

  private traverseNodes(node: Node): string {
    let text = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      if (child.nodeType === 3) { // Text Node
        text += child.nodeValue;
      } else if (child.nodeType === 1) { // Element Node
        const element = child as HTMLElement;
        if (element.classList.contains('variable-chip')) {
          const syntax = element.getAttribute('data-syntax') || '';
          text += syntax;
        } else if (element.tagName === 'BR') {
          text += '\n';
        } else {
          const isBlock = ['DIV', 'P', 'LI'].includes(element.tagName);
          const childText = this.traverseNodes(element);
          if (isBlock && text && !text.endsWith('\n')) {
            text += '\n';
          }
          text += childText;
        }
      }
    }
    return text;
  }

  insertVariable(syntax: string) {
    const editor = document.getElementById('template-content');
    if (!editor) return;

    const varMap: { [key: string]: string } = {
      '{{cliente}}': 'Nombre Cliente',
      '{{ciudad}}': 'Ciudad Cliente',
      '{{direccion}}': 'Dirección Cliente',
      '{{telefono}}': 'Teléfono Cliente',
      '{{productos}}': 'Productos (Resumen)',
      '{{total}}': 'Total Pagar',
      '{{costo_envio}}': 'Costo Delivery',
      '{{ubicacion}}': 'Ubicación / Sucursal',
      '{{nombre_producto}}': 'Nombre de Producto',
      '{{precio_producto}}': 'Precio de Producto',
      '{{descripcion_producto}}': 'Descripción Producto'
    };
    const label = varMap[syntax] || syntax;

    // Create chip element
    const chip = document.createElement('span');
    chip.className = 'variable-chip';
    chip.contentEditable = 'false';
    chip.setAttribute('data-syntax', syntax);
    
    const chipText = document.createElement('span');
    chipText.className = 'chip-text';
    chipText.innerText = label;
    
    const chipClose = document.createElement('span');
    chipClose.className = 'chip-close';
    chipClose.innerHTML = '&times;';
    
    chip.appendChild(chipText);
    chip.appendChild(chipClose);

    // Get current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (editor.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(chip);
        
        // Move cursor to after the inserted chip
        range.setStartAfter(chip);
        range.setEndAfter(chip);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editor.appendChild(chip);
      }
    } else {
      editor.appendChild(chip);
    }

    this.updateFormControlFromEditable();
  }

  onDragStart(event: DragEvent, syntax: string) {
    event.dataTransfer?.setData('text/plain', syntax);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    // Prevent default browser drop behavior
    event.preventDefault();
  }

  onContentEditableInput(event: Event) {
    this.updateFormControlFromEditable();
  }

  onEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('chip-close')) {
      const chip = target.closest('.variable-chip');
      if (chip) {
        chip.remove();
        this.updateFormControlFromEditable();
      }
    }
  }

  onContentEditableDrop(event: DragEvent) {
    event.preventDefault();
    const syntax = event.dataTransfer?.getData('text/plain');
    if (!syntax) return;

    const editor = document.getElementById('template-content');
    if (!editor) return;

    const varMap: { [key: string]: string } = {
      '{{cliente}}': 'Nombre Cliente',
      '{{ciudad}}': 'Ciudad Cliente',
      '{{direccion}}': 'Dirección Cliente',
      '{{telefono}}': 'Teléfono Cliente',
      '{{productos}}': 'Productos (Resumen)',
      '{{total}}': 'Total Pagar',
      '{{costo_envio}}': 'Costo Delivery',
      '{{ubicacion}}': 'Ubicación / Sucursal',
      '{{nombre_producto}}': 'Nombre de Producto',
      '{{precio_producto}}': 'Precio de Producto',
      '{{descripcion_producto}}': 'Descripción Producto'
    };
    const label = varMap[syntax] || syntax;

    // Create chip element
    const chip = document.createElement('span');
    chip.className = 'variable-chip';
    chip.contentEditable = 'false';
    chip.setAttribute('data-syntax', syntax);

    const chipText = document.createElement('span');
    chipText.className = 'chip-text';
    chipText.innerText = label;
    
    const chipClose = document.createElement('span');
    chipClose.className = 'chip-close';
    chipClose.innerHTML = '&times;';
    
    chip.appendChild(chipText);
    chip.appendChild(chipClose);

    let range: Range | null = null;
    
    // Find caret range at drop point
    const doc = document as any;
    if (doc.caretRangeFromPoint) {
      range = doc.caretRangeFromPoint(event.clientX, event.clientY);
    } else if ((event as any).rangeParent) {
      // Firefox fallback
      range = document.createRange();
      range.setStart((event as any).rangeParent, (event as any).rangeOffset);
      range.setEnd((event as any).rangeParent, (event as any).rangeOffset);
    }

    if (range && editor.contains(range.commonAncestorContainer)) {
      range.insertNode(chip);
      
      const selection = window.getSelection();
      if (selection) {
        range.setStartAfter(chip);
        range.setEndAfter(chip);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      editor.appendChild(chip);
    }

    this.updateFormControlFromEditable();
  }

  private updateFormControlFromEditable() {
    const editor = document.getElementById('template-content');
    if (editor) {
      const plainText = this.htmlToText(editor.innerHTML);
      this.templateForm.get('content')?.setValue(plainText, { emitEvent: true });
      this.cdr.detectChanges();
    }
  }

  saveTemplate() {
    if (this.templateForm.invalid) return;

    const data = { ...this.templateForm.value };
    if (!this.isEditing) {
      delete data.id;
    }

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
      error: (err) => {
        const detail = err?.error?.message || 'Error al guardar la plantilla';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
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
      .replace(/\{\{ciudad\}\}/g, 'Santa Cruz')
      .replace(/\{\{direccion\}\}/g, 'Calle 4 Oeste #123')
      .replace(/\{\{telefono\}\}/g, '+591 70000000')
      .replace(/\{\{productos\}\}/g, '1x Hamburguesa Clásica (25 Bs)\n1x Coca Cola (7 Bs)')
      .replace(/\{\{total\}\}/g, '42 Bs')
      .replace(/\{\{costo_envio\}\}/g, '10 Bs')
      .replace(/\{\{ubicacion\}\}/g, 'Av. Banzer y 3er Anillo (Santa Cruz)')
      .replace(/\{\{nombre_producto\}\}/g, 'Hamburguesa Clásica')
      .replace(/\{\{precio_producto\}\}/g, '25 Bs')
      .replace(/\{\{descripcion_producto\}\}/g, 'Deliciosa carne de res con queso y vegetales frescos');
  }
}
