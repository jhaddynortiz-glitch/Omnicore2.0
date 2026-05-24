import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { Contact } from '../../../../core/services/chat.service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, AvatarModule, ProgressSpinnerModule, TooltipModule],
  template: `
    <div class="contacts-panel w-full md:w-25rem flex flex-column border-right-1 surface-border surface-ground h-full"
         [ngClass]="{'mobile-hidden': isContactSelected()}">
        
        <!-- Header de Lista -->
        <div class="p-3 flex align-items-center justify-content-between border-bottom-1 surface-border surface-card">
            <span class="text-xl font-bold text-900">Mensajes</span>
            <div class="flex gap-2">
                <i (click)="addContact.emit()" class="pi pi-plus text-500 cursor-pointer hover:text-primary transition-colors p-2 border-round hover:surface-hover" title="Nuevo contacto"></i>
                <i class="pi pi-filter text-500 cursor-pointer hover:text-primary transition-colors p-2 border-round hover:surface-hover"></i>
            </div>
        </div>

        <!-- Buscador -->
        <div class="p-3 surface-card border-bottom-1 surface-border">
            <div class="flex align-items-center border-round-xl border-1 surface-border px-3 py-2 bg-transparent focus-within:border-primary transition-colors">
                <i class="pi pi-search text-500 mr-2 text-lg"></i>
                <input type="text" placeholder="Buscar chat o contacto" class="w-full bg-transparent border-none text-700 p-0 text-base" style="outline: none; box-shadow: none;" />
            </div>
        </div>

        <!-- Lista de Contactos Deslizable -->
        <div class="flex-auto overflow-y-auto">
            
            <!-- Spinner -->
            @if (isLoading()) {
                <div class="flex justify-content-center p-5">
                    <p-progressSpinner strokeWidth="4" animationDuration=".5s"></p-progressSpinner>
                </div>
            }

            <!-- Listado iterativo -->
            @if (!isLoading()) {
                <div class="flex flex-column">
                    @for (chat of contacts(); track chat.id) {
                        <div (click)="contactSelected.emit(chat)"
                             [ngClass]="{'surface-hover border-left-3 border-primary': selectedContactId() === chat.id, 'hover:surface-hover': selectedContactId() !== chat.id}"
                             class="flex p-3 cursor-pointer transition-colors align-items-center">
                            
                            <p-avatar icon="pi pi-user" size="large" shape="circle" class="mr-3 flex-shrink-0" [style]="{'background-color': 'var(--p-primary-100)', 'color': 'var(--p-primary-500)'}"></p-avatar>

                            <div class="flex flex-column flex-auto overflow-hidden">
                                <div class="flex justify-content-between align-items-center mb-1">
                                    <span class="font-bold text-900 text-overflow-ellipsis white-space-nowrap overflow-hidden flex align-items-center gap-2">
                                        {{chat.name === 'Usuario WhatsApp' ? '+' + chat.phoneNumber : chat.name}}
                                    <span class="status-flag {{ getFlagClass(chat.orders?.[0]?.status) }}" pTooltip="Pedido: {{ chat.orders?.[0]?.status }}" tooltipPosition="top"></span>
                                    </span>
                                    <span class="text-xs text-500 white-space-nowrap ml-2">{{chat.messages[0]?.createdAt | date:'shortTime'}}</span>
                                </div>
                                
                                <div class="flex justify-content-between align-items-center">
                                    <span class="text-sm text-600 text-overflow-ellipsis white-space-nowrap overflow-hidden">
                                        {{chat.messages[0]?.body || 'Sin mensajes'}}
                                    </span>
                                    @if (chat.unreadCount > 0) {
                                        <i class="pi pi-circle-fill text-primary ml-2" style="font-size: 0.6rem;"></i>
                                    }
                                </div>
                            </div>
                        </div>
                    } @empty {
                        <div class="p-5 text-center text-500">
                            <i class="pi pi-inbox text-4xl mb-3"></i>
                            <p>No tienes chats activos.</p>
                        </div>
                    }
                </div>
            }

        </div>
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
        min-width: 0;
    }
    .mobile-hidden {
        @media screen and (max-width: 767px) {
            display: none !important;
        }
    }
    .status-flag {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    .flag-purple {
        background-color: #a855f7;
        box-shadow: 0 0 6px #c084fc;
    }
    .flag-yellow {
        background-color: #eab308;
        box-shadow: 0 0 6px #fde047;
    }
    .flag-green {
        background-color: #22c55e;
        box-shadow: 0 0 6px #4ade80;
    }
  `]
})
export class ChatList {
  contacts = input.required<Contact[]>();
  selectedContactId = input<string>();
  isContactSelected = input<boolean>(false);
  isLoading = input<boolean>(false);

  getFlagClass(status: string | undefined): string {
    switch (status) {
      case 'EN_COLA':
        return 'flag-purple';
      case 'ASIGNADO':
        return 'flag-yellow';
      case 'ENTREGADO':
        return 'flag-green';
      default:
        return '';
    }
  }
  
  contactSelected = output<Contact>();
  addContact = output<void>();
}
