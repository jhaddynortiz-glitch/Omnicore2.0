import { Component, input, output, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Contact, ChatMessage } from '../../../../core/services/chat.service';

@Component({
    selector: 'app-chat-window',
    standalone: true,
    imports: [CommonModule, AvatarModule, ProgressSpinnerModule, MenuModule],
    template: `
    <div class="conversation-panel flex-auto flex flex-column surface-ground relative min-h-0 w-full"
         [ngClass]="{'mobile-active': !!selectedContact()}">
        
        <!-- Empty State General (Sin chat seleccionado) -->
        @if (!selectedContact()) {
            <div class="h-full w-full flex flex-column align-items-center justify-content-center">
                <div class="text-center">
                    <i class="pi pi-whatsapp text-6xl text-300 mb-3 block"></i>
                    <h2 class="text-900 font-medium m-0 mb-2">OmniCore Web</h2>
                    <p class="text-500 m-0">Selecciona un chat para cargar su historial.</p>
                </div>
            </div>
        }

        @if (selectedContact()) {
            <!-- Chat Activo Header -->
            <div class="w-full h-auto flex align-items-center p-3 surface-card border-bottom-1 surface-border z-1 shadow-1 relative">
                
                <!-- Botón Atrás (solo visible en móvil) -->
                <div class="mobile-back-btn align-items-center justify-content-center cursor-pointer mr-2 p-2 border-round hover:surface-hover transition-colors"
                    (click)="backToList.emit()">
                    <i class="pi pi-arrow-left text-600 text-xl"></i>
                </div>

                <p-avatar icon="pi pi-user" shape="circle" class="mr-3 flex-shrink-0" [style]="{'background-color': 'var(--p-primary-100)', 'color': 'var(--p-primary-500)'}"></p-avatar>
                <div class="flex flex-column">
                    <span class="font-bold text-900">{{selectedContact()?.name === 'Usuario WhatsApp' ? '+' + selectedContact()?.phoneNumber : selectedContact()?.name}}</span>
                    @if (selectedContact()?.name !== 'Usuario WhatsApp') {
                        <span class="text-xs text-500">+{{selectedContact()?.phoneNumber}}</span>
                    }
                </div>
                
                <div class="ml-auto flex gap-3 align-items-center">
                    <i class="pi pi-phone text-600 cursor-pointer hover:text-primary transition-colors text-xl"></i>
                    
                    <!-- Menú desplegable con 3 puntos -->
                    <i class="pi pi-ellipsis-v text-600 cursor-pointer hover:text-primary transition-colors text-xl"
                    (click)="menu.toggle($event)"></i>
                    <p-menu #menu [model]="menuItems()" [popup]="true" appendTo="body"></p-menu>
                </div>
            </div>

                <!-- Historial de Burbujas (Scrollable Area) -->
                <div #messagesContainer 
                     (scroll)="onScroll($event)"
                     class="flex-auto overflow-y-auto p-4 flex flex-column gap-3 relative" 
                     style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a1a1aa\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
                    
                    <!-- Loader de Historial (Scroll Up) -->
                    @if (isLoadingMore()) {
                        <div class="flex justify-content-center w-full py-2 relative z-2">
                            <p-progressSpinner styleClass="w-2rem h-2rem" strokeWidth="4"></p-progressSpinner>
                        </div>
                    }

                    <!-- Loader de Mensajes Interno (Initial Load) -->
                    @if (isLoadingMessages()) {
                        <div class="flex justify-content-center w-full py-4 relative z-2">
                            <p-progressSpinner styleClass="w-3rem h-3rem" strokeWidth="5"></p-progressSpinner>
                        </div>
                    }

                @if (!isLoadingMessages()) {
                    <!-- Iterador de Mensajes -->
                    @for (msg of activeMessages(); track msg.id) {
                        <div class="flex w-full align-items-end" 
                            [ngClass]="msg.isFromMe ? 'justify-content-end' : 'justify-content-start'">
                            
                            <div class="message-bubble py-2 px-3 border-round-xl max-w-25rem relative"
                                [ngClass]="msg.isFromMe ? 'bg-primary text-white border-noround-br shadow-1' : 'surface-card text-900 border-1 surface-border border-noround-bl shadow-1'">
                                
                                <!-- Mensaje de Texto normal -->
                                @if (msg.type !== 'location') {
                                    <p class="m-0 text-sm line-height-3 pr-4" style="word-break: break-word; white-space: pre-wrap;">{{msg.body}}</p>
                                }

                                <!-- Mensaje de Ubicación -->
                                @if (msg.type === 'location') {
                                    <div class="flex flex-column gap-2 py-1" style="width: 250px;">
                                        <!-- Mapa estático de previsualización -->
                                        @if (getLocationPreview(msg.body)) {
                                            <div class="w-full border-round-lg overflow-hidden shadow-1 border-1 surface-border cursor-pointer hover:opacity-90 transition-all active:scale-95"
                                                 (click)="openGoogleMaps(msg.body)">
                                                <img [src]="getLocationPreview(msg.body)" 
                                                     alt="Mapa" 
                                                     class="w-full h-auto block" 
                                                     style="min-height: 120px; object-fit: cover;">
                                            </div>
                                        }
                                    </div>
                                }

                                <!-- Mensaje de Imagen -->
                                @if (msg.type === 'image' && msg.mediaUrl) {
                                    <div class="message-image-container py-1" style="max-width: 300px;">
                                        <img [src]="msg.mediaUrl" 
                                             alt="Imagen de WhatsApp" 
                                             class="w-full border-round-lg shadow-1 cursor-pointer hover:opacity-90 transition-all"
                                             style="max-height: 400px; object-fit: contain; background: #0000000a;"
                                             (click)="openImage(msg.mediaUrl)">
                                        @if (msg.body && msg.body !== '📷 Imagen') {
                                            <p class="m-0 text-sm line-height-3 mt-2" style="word-break: break-word; white-space: pre-wrap;">{{msg.body}}</p>
                                        }
                                    </div>
                                }

                                <span class="text-xs opacity-70 block text-right mt-1" style="font-size: 0.65rem;">
                                    {{msg.createdAt | date:'shortTime'}}
                                    @if (msg.isFromMe) {
                                        <i class="pi pi-check ml-1 text-xs"></i>
                                    }
                                </span>
                            </div>
                        </div>
                    } @empty {
                        <div class="w-full text-center py-5">
                            <span class="surface-card p-2 px-3 border-round-2xl text-xs text-600 shadow-1 border-1 surface-border">No hay mensajes anteriores en este chat. Escribe un texto para iniciar.</span>
                        </div>
                    }
                }
            </div>
        }
    </div>
  `,
    styles: [`
    :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        min-height: 0;
    }
    .flex-auto.overflow-y-auto {
        scroll-behavior: auto !important; /* Evita que las transiciones de scroll sean lentas y reboten */
    }
    .mobile-back-btn {
        display: none;
        @media screen and (max-width: 767px) {
            display: flex;
        }
    }
    .truncate-coords {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
  `]
})
export class ChatWindow {
    selectedContact = input<Contact | null>(null);
    activeMessages = input<ChatMessage[]>([]);
    isLoadingMessages = input<boolean>(false);
    isLoadingMore = input<boolean>(false);
    menuItems = input<MenuItem[]>([]);

    backToList = output<void>();
    loadMore = output<void>();

    @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

    private lastScrollHeight = 0;
    private isPrepending = false;

    constructor() {
        // Manejo de scroll inteligente al cambiar mensajes
        effect(() => {
            // Al cambiar de contacto, reseteamos flags de paginación y el scroll nativo de inmediato
            const contact = this.selectedContact();
            if (contact) {
                this.isPrepending = false;
                // Un reset inmediato del scroll ayuda a evitar el "rebote" visual
                const el = this.messagesContainer?.nativeElement;
                if (el) el.scrollTop = el.scrollHeight;
            }

            const msgs = this.activeMessages();
            if (msgs && msgs.length > 0) {
                // Si estamos cargando más (scroll up), mantenemos la posición técnica
                if (this.isPrepending) {
                    this.restoreScrollPosition();
                    this.isPrepending = false;
                } else {
                    // Si es mensaje nuevo al final o carga inicial completa, vamos al fondo
                    this.scrollToBottom();
                }
            }
        });
    }

    onScroll(event: any) {
        const element = event.target as HTMLElement;
        // Si el usuario llega al tope (umbral de 10px) y no estamos ya cargando
        if (element.scrollTop <= 10 && !this.isLoadingMore() && !this.isLoadingMessages()) {
            this.lastScrollHeight = element.scrollHeight;
            this.isPrepending = true;
            this.loadMore.emit();
        }
    }

    private restoreScrollPosition() {
        setTimeout(() => {
            const el = this.messagesContainer?.nativeElement;
            if (el) {
                // La diferencia de ScrollHeight nos da el desplazamiento exacto para mantener la vista
                const newScrollHeight = el.scrollHeight;
                el.scrollTop = newScrollHeight - this.lastScrollHeight;
            }
        }, 0);
    }

    private scrollToBottom() {
        // Usamos requestAnimationFrame para que ocurra justo después del renderizado del DOM
        requestAnimationFrame(() => {
            try {
                const el = this.messagesContainer?.nativeElement;
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            } catch (err) { }
        });

        // Fallback por si el renderizado tarda un poco más
        setTimeout(() => {
            const el = this.messagesContainer?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
        }, 50);
    }

    getLocationPreview(body: string): string | null {
        const coordsMatch = body.match(/Ubicación:\s*(-?|d+\.\d+),\s*(-?\d+\.\d+)/) || body.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (coordsMatch && coordsMatch.length >= 3) {
            const lat = coordsMatch[coordsMatch.length - 2];
            const lng = coordsMatch[coordsMatch.length - 1];
            // Usamos Yandex Static Maps para una preview limpia y rápida sin necesidad de API Key compleja en front
            return `https://static-maps.yandex.ru/1.x/?lang=es_ES&ll=${lng},${lat}&z=15&l=map&size=300,150&pt=${lng},${lat},pm2rdm`;
        }
        return null;
    }

    openGoogleMaps(body: string) {
        const coordsMatch = body.match(/Ubicación:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/) || body.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (coordsMatch && coordsMatch.length >= 3) {
            const lat = coordsMatch[coordsMatch.length - 2];
            const lng = coordsMatch[coordsMatch.length - 1];
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(url, '_blank');
        }
    }

    openImage(url: string) {
        window.open(url, '_blank');
    }
}
