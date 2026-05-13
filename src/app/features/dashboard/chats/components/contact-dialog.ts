import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  template: `
    <p-dialog header="Nuevo Contacto" 
              [(visible)]="visible" 
              [modal]="true" 
              [draggable]="false" 
              [resizable]="false"
              styleClass="w-25rem border-round-xl overflow-hidden shadow-4"
              maskStyleClass="bg-black-alpha-40">
        
        <div class="flex flex-column gap-4 py-3">
            <div class="flex flex-column gap-2">
                <label for="name" class="font-bold text-700 ml-1">Nombre</label>
                <div class="flex align-items-center border-round-xl border-1 surface-border px-3 py-2 bg-transparent focus-within:border-primary transition-colors">
                    <i class="pi pi-user text-400 mr-2"></i>
                    <input id="name" type="text" 
                           [(ngModel)]="contactName"
                           placeholder="Ej. Juan Perez" 
                           class="w-full bg-transparent border-none text-700 p-0 text-base" 
                           style="outline: none; box-shadow: none;" />
                </div>
            </div>

            <div class="flex flex-column gap-2">
                <label for="phone" class="font-bold text-700 ml-1">Número de WhatsApp</label>
                <div class="flex align-items-center border-round-xl border-1 surface-border px-3 py-2 bg-transparent focus-within:border-primary transition-colors"
                     [ngClass]="{'surface-ground opacity-70': isEditing()}">
                    <i class="pi pi-phone text-400 mr-2"></i>
                    <input id="phone" type="text" 
                           [(ngModel)]="contactPhone"
                           [readonly]="isEditing()"
                           placeholder="Ej. 59170000000" 
                           class="w-full bg-transparent border-none text-700 p-0 text-base" 
                           style="outline: none; box-shadow: none;" />
                </div>
                <small class="text-500 ml-1">Ingresa el código de país sin el símbolo +</small>
            </div>
        </div>

        <ng-template pTemplate="footer">
            <div class="flex justify-content-end gap-2 pt-2">
                <p-button label="Cancelar" icon="pi pi-times" [text]="true" severity="secondary" (click)="visible.set(false)"></p-button>
                <p-button label="Guardar y Abrir" icon="pi pi-check" [loading]="isSaving()" (click)="save.emit()" [disabled]="!contactName || !contactPhone"></p-button>
            </div>
        </ng-template>
    </p-dialog>
  `
})
export class ContactDialog {
  visible = model<boolean>(false);
  contactName = model<string>('');
  contactPhone = model<string>('');

  isEditing = input<boolean>(false);
  isSaving = input<boolean>(false);

  save = output<void>();
}
