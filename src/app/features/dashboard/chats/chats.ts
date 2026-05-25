import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { ChatService, Contact, ChatMessage } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuItem } from 'primeng/api';

import { WebsocketService } from '../../../core/services/websocket.service';
import { ChatList } from './components/chat-list';
import { ChatWindow } from './components/chat-window';
import { MessageInput } from './components/message-input';
import { ContactDialog } from './components/contact-dialog';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [ChatList, ChatWindow, MessageInput, ContactDialog],
  templateUrl: './chats.html',
  styleUrl: './chats.scss',
})
export class Chats implements OnInit {
  private chatService = inject(ChatService);
  private wsService = inject(WebsocketService);
  private authService = inject(AuthService);

  contacts = signal<Contact[]>([]);
  isLoading = signal<boolean>(true);
  isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  // Estados de Chat Activo
  selectedContact = signal<Contact | null>(null);
  activeMessages = signal<ChatMessage[]>([]);
  isLoadingMessages = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasMoreMessages = signal<boolean>(true);

  // Estados para nuevo contacto
  showAddContactDialog = signal<boolean>(false);
  newContactName = signal<string>('');
  newContactPhone = signal<string>('');
  isSavingContact = signal<boolean>(false);
  isEditingContact = signal<boolean>(false);

  // Menú de opciones de chat
  chatMenuItems = signal<MenuItem[]>([]);

  ngOnInit() {
    this.chatService.getContacts().subscribe({
      next: (data) => {
        this.contacts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching chats', err);
        this.isLoading.set(false);
      }
    });

    // Suscripción al stream maestro del Websocket
    this.wsService.newMessage$.subscribe((incomingMessage: ChatMessage) => {
      this.handleIncomingMessage(incomingMessage);
    });

    // Escuchar actualizaciones de datos de contacto
    this.wsService.contactUpdated$.subscribe((updatedContact: Contact) => {
      this.handleContactUpdated(updatedContact);
    });
  }

  // Actualizador universal de la Interfaz con mensajes Push
  private handleIncomingMessage(msg: ChatMessage) {
    if (this.selectedContact()?.id === msg.contactId) {
      this.activeMessages.update(history => {
        if (history.find(m => m.id === msg.id)) {
          return history;
        }

        if (msg.isFromMe) {
          const optimisticIdx = history.findIndex(m => {
            const isTemp = m.id.startsWith('temp-');
            if (!isTemp) return false;

            // Para imágenes, comparamos mediaUrl
            if (msg.type === 'image' && m.type === 'image') {
              return m.mediaUrl === msg.mediaUrl;
            }
            
            // Para texto, mantenemos comparación por body
            return m.body === msg.body;
          });

          if (optimisticIdx !== -1) {
            const newHistory = [...history];
            newHistory[optimisticIdx] = msg;
            return newHistory;
          }
        }

        return [...history, msg];
      });
      
      this.chatService.markAsRead(msg.contactId).subscribe();
    }

    this.contacts.update(contacts => {
      const contactIdx = contacts.findIndex(c => c.id === msg.contactId);
      const isCurrentlyOpen = this.selectedContact()?.id === msg.contactId;
      
      if (contactIdx === -1) {
        // En un escenario ideal, aquí cargaríamos el contacto nuevo desde la API.
        // Por ahora mantenemos la lista actual para evitar inconsistencias de tipos.
        return contacts;
      }

      const contact = contacts[contactIdx];
      const newUnreadCount = (isCurrentlyOpen || msg.isFromMe) ? 0 : contact.unreadCount + 1;

      const updatedContact: Contact = {
        ...contact,
        messages: [msg],
        unreadCount: newUnreadCount
      };

      // Re-ordenar: El contacto actualizado va al principio (estilo WhatsApp)
      const otherContacts = contacts.filter((_, i) => i !== contactIdx);
      return [updatedContact, ...otherContacts];
    });
  }

  private handleContactUpdated(updatedData: Contact) {
    this.contacts.update(list => {
      const index = list.findIndex(c => c.id === updatedData.id);
      if (index === -1) return list;

      const newList = [...list];
      newList[index] = { ...newList[index], ...updatedData };
      return newList;
    });

    if (this.selectedContact()?.id === updatedData.id) {
      this.selectedContact.set({ ...this.selectedContact()!, ...updatedData });
      this.buildChatMenu(this.selectedContact()!);
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.selectedContact()) {
      this.goBackToList(false);
    }
  }

  selectContact(contact: Contact) {
    if (window.innerWidth < 768 && !this.selectedContact()) {
      window.history.pushState({ chatOpen: true }, '');
    }

    this.activeMessages.set([]); // Limpiamos mensajes inmediatamente
    this.selectedContact.set(contact);
    this.isLoadingMessages.set(true);
    
    this.chatService.markAsRead(contact.id).subscribe();

    this.contacts.update(contacts => contacts.map(c => {
      if (c.id === contact.id && c.unreadCount > 0) {
          return { ...c, unreadCount: 0 };
      }
      return c;
    }));
    
    this.chatService.getMessagesByContact(contact.id, 20).subscribe({
      next: (messages) => {
        this.activeMessages.set(messages);
        this.isLoadingMessages.set(false);
        this.hasMoreMessages.set(messages.length === 20);
      },
      error: (err) => {
        console.error('Error fetching messages:', err);
        this.activeMessages.set([]);
        this.isLoadingMessages.set(false);
      }
    });

    this.buildChatMenu(contact);
  }

  loadMoreMessages() {
    const contact = this.selectedContact();
    if (!contact || this.isLoadingMore() || !this.hasMoreMessages()) return;

    const currentMessages = this.activeMessages();
    if (currentMessages.length === 0) return;

    const oldestMessageId = currentMessages[0].id;
    this.isLoadingMore.set(true);

    this.chatService.getMessagesByContact(contact.id, 20, oldestMessageId).subscribe({
      next: (previousMessages) => {
        if (previousMessages.length > 0) {
          this.activeMessages.update(history => [...previousMessages, ...history]);
          this.hasMoreMessages.set(previousMessages.length === 20);
        } else {
          this.hasMoreMessages.set(false);
        }
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        console.error('Error loading more messages:', err);
        this.isLoadingMore.set(false);
      }
    });
  }

  buildChatMenu(contact: Contact) {
    const items: MenuItem[] = [
      { label: 'Ver perfil', icon: 'pi pi-user', command: () => {} }
    ];

    if (contact.name === 'Usuario WhatsApp') {
      items.push({
        label: 'Añadir a contactos',
        icon: 'pi pi-user-plus',
        command: () => {
          this.isEditingContact.set(true);
          this.openAddContactDialog(contact.phoneNumber);
        }
      });
    } else {
      items.push({
        label: 'Editar contacto',
        icon: 'pi pi-pencil',
        command: () => {
          this.isEditingContact.set(true);
          this.newContactName.set(contact.name);
          this.newContactPhone.set(contact.phoneNumber);
          this.showAddContactDialog.set(true);
        }
      });
    }

    if (this.authService.isGlobalAdmin()) {
      items.push({
        label: 'Reiniciar y limpiar chat',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500 font-bold',
        command: () => {
          if (confirm('¿Estás seguro de que quieres eliminar todo el historial de este chat? Esto reiniciará por completo la memoria de la IA para este cliente.')) {
            this.chatService.clearChat(contact.id).subscribe({
              next: () => {
                this.activeMessages.set([]);
                this.contacts.update(list => {
                  const idx = list.findIndex(c => c.id === contact.id);
                  if (idx > -1) {
                    const newList = [...list];
                    newList[idx] = { ...newList[idx], messages: [] };
                    return newList;
                  }
                  return list;
                });
              },
              error: (err) => console.error('Error al limpiar chat', err)
            });
          }
        }
      });
    }

    this.chatMenuItems.set(items);
  }

  goBackToList(triggerHistory: boolean = true) {
    if (triggerHistory && window.innerWidth < 768 && this.selectedContact()) {
        window.history.back();
    }
    this.selectedContact.set(null);
    this.activeMessages.set([]);
  }

  sendMessage(text: string) {
    const contact = this.selectedContact();
    if (!contact || !text) return;

    const tempId = 'temp-' + Math.random().toString(36).substring(2, 12);
    const tempMessage: ChatMessage = {
      id: tempId,
      contactId: contact.id,
      body: text,
      isFromMe: true,
      type: 'text',
      createdAt: new Date().toISOString()
    };
    
    this.activeMessages.update(msgs => [...msgs, tempMessage]);
    
    this.chatService.sendMessage(contact.id, text).subscribe({
      error: (err) => {
        console.error('Error sending message:', err);
        this.activeMessages.update(msgs => msgs.filter(m => m.id !== tempMessage.id)); 
      }
    });
  }

  sendImage(media: { url: string, mimetype: string }) {
    const contact = this.selectedContact();
    if (!contact) return;

    const tempId = 'temp-' + Math.random().toString(36).substring(2, 12);
    const tempMessage: ChatMessage = {
      id: tempId,
      contactId: contact.id,
      body: '📷 Imagen',
      mediaUrl: media.url,
      mimeType: media.mimetype,
      isFromMe: true,
      type: 'image',
      createdAt: new Date().toISOString()
    };
    
    this.activeMessages.update(msgs => [...msgs, tempMessage]);
    
    this.chatService.sendMessage(contact.id, '', 'image', media.url).subscribe({
      error: (err) => {
        console.error('Error sending image:', err);
        this.activeMessages.update(msgs => msgs.filter(m => m.id !== tempMessage.id)); 
      }
    });
  }

  openAddContactDialog(phone: string = '') {
    this.newContactName.set('');
    this.newContactPhone.set(phone);
    this.isEditingContact.set(phone !== '');
    this.showAddContactDialog.set(true);
  }

  saveContact() {
    const name = this.newContactName().trim();
    const phone = this.newContactPhone().trim();

    if (!name || !phone) return;

    this.isSavingContact.set(true);
    this.chatService.createContact(name, phone).subscribe({
      next: (newContact) => {
        this.contacts.update(list => {
          const index = list.findIndex(c => c.id === newContact.id);
          if (index !== -1) {
            const newList = [...list];
            newList[index] = { ...newList[index], ...newContact };
            return newList;
          }
          return [newContact, ...list];
        });

        if (this.selectedContact()?.id === newContact.id) {
          this.selectedContact.set({ ...this.selectedContact()!, ...newContact });
          this.buildChatMenu(this.selectedContact()!);
        }
        
        this.isSavingContact.set(false);
        this.showAddContactDialog.set(false);
      },
      error: (err) => {
        console.error('❌ Error saving contact:', err);
        this.isSavingContact.set(false);
      }
    });
  }
}
