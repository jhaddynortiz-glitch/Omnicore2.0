import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full p-3 surface-card border-top-1 surface-border flex align-items-center gap-2 z-1 relative shadow-1">
        <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none;" />
        @if (isUploading()) {
            <i class="pi pi-spin pi-spinner text-primary text-xl p-2"></i>
        } @else {
            <i class="pi pi-paperclip text-600 text-xl cursor-pointer hover:text-primary transition-colors p-2" (click)="fileInput.click()"></i>
        }
        
        <!-- Botón Emoji + Picker -->
        <div class="relative">
            <i class="pi pi-face-smile text-600 text-xl cursor-pointer hover:text-primary transition-colors p-2"
               [class.text-primary]="showEmojiPicker()"
               (click)="toggleEmojiPicker()"></i>

            <!-- Panel de Emojis -->
            @if (showEmojiPicker()) {
                <div class="emoji-picker surface-card border-1 surface-border border-round-xl shadow-4"
                     style="position: absolute; bottom: 3rem; left: -1rem; width: 320px; z-index: 50;">
                    
                    <!-- Categorías (Tabs) -->
                    <div class="flex gap-1 px-2 pt-2 pb-1 border-bottom-1 surface-border overflow-x-auto" style="scrollbar-width: none;">
                        @for (cat of emojiCategories; track cat.name) {
                            <span (click)="activeEmojiCategory.set($index)"
                                  class="cursor-pointer p-2 border-round-lg text-lg transition-colors text-center flex-shrink-0"
                                  [ngClass]="activeEmojiCategory() === $index ? 'surface-hover' : 'hover:surface-hover'"
                                  [title]="cat.name">
                                {{cat.icon}}
                            </span>
                        }
                    </div>

                    <!-- Grid de Emojis -->
                    <div class="p-2 overflow-y-auto" style="height: 220px; scrollbar-width: thin;">
                        <div class="flex flex-wrap gap-1">
                            @for (emoji of emojiCategories[activeEmojiCategory()].emojis; track emoji) {
                                <span (click)="insertEmoji(emoji)"
                                      class="cursor-pointer p-1 border-round-lg hover:surface-hover transition-colors text-center"
                                      style="font-size: 1.4rem; width: 2.2rem; height: 2.2rem; display: inline-flex; align-items: center; justify-content: center;">
                                    {{emoji}}
                                </span>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>

        <!-- Backdrop invisible para cerrar el picker al tocar fuera -->
        @if (showEmojiPicker()) {
            <div (click)="closeEmojiPicker()" 
                 style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 49;"></div>
        }
        
        <div class="flex-auto flex align-items-center border-round-3xl surface-ground px-3 py-2">
            <input type="text" [(ngModel)]="messageText" (keyup.enter)="handleSend()" (focus)="closeEmojiPicker()" placeholder="Agrega un mensaje" class="w-full surface-ground border-none text-700 text-base" style="outline: none; box-shadow: none;" />
            <i class="pi pi-microphone text-500 cursor-pointer text-xl hover:text-primary transition-colors ml-2"></i>
        </div>
        
        <div (click)="handleSend()" class="bg-primary text-white border-round-circle flex-shrink-0 w-3rem h-3rem flex align-items-center justify-content-center shadow-2 cursor-pointer hover:bg-primary-reverse transition-colors ml-2">
            <i class="pi pi-send text-xl"></i>
        </div>
    </div>
  `
})
export class MessageInput {
  messageText = '';
  showEmojiPicker = signal(false);
  activeEmojiCategory = signal(0);
  
  messageSent = output<string>();
  imageSent = output<{ url: string, mimetype: string }>();

  private chatService = inject(ChatService);
  isUploading = signal(false);

  emojiCategories = [
    { name: 'Caritas', icon: '😊', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','🤮','🤧','😇','🥳','🥺','🤠','🤡','🤥','🤫','🤭','🧐','🤓'] },
    { name: 'Gestos', icon: '👋', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🙏','✍','💪','🦾','🦿'] },
    { name: 'Corazones', icon: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣','💕','💞','💓','💗','💖','💘','💝','💟'] },
    { name: 'Objetos', icon: '📦', emojis: ['📦','📫','📪','📬','📭','📮','🏷','💰','💳','📱','💻','⌨','🖥','🖨','📷','📹','🎥','📞','☎','📟','📠','📺','📻','🎙','🎧','🎤','🔔','🔕','📢','📣'] },
    { name: 'Comida', icon: '🍔', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅',' avocado','🍆','🥔','🥕','🌽','🌶','🫑','🥒','🥬','🧅','🧄','🥜','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🫔','🥗','🍿','🧂','🥤','🧋','🍺','🍷','🥂','🍾','☕','🍵'] },
    { name: 'Viajes', icon: '✈️', emojis: ['🚗','🚕','🚙','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍','🛵','🚲','🛴','🚏','🛣','🛤','⛽','🏁','🚦','🚧','⚓','⛵','🚤','🛳','⛴','🛥','🚢','✈','🛩','🛫','🛬','🪂','💺','🚁','🚀','🛸'] },
    { name: 'Símbolos', icon: '✅', emojis: ['✅','❌','⭕','🚫','💯','❗','❓','‼','⁉','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','▪','▫','◾','◽','🔺','🔻','💠','🔘','🏳','🏴','🚩'] }
  ];

  handleSend() {
    const text = this.messageText.trim();
    if (text) {
      this.messageSent.emit(text);
      this.messageText = '';
    }
  }

  toggleEmojiPicker() {
    this.showEmojiPicker.update(v => !v);
  }

  insertEmoji(emoji: string) {
    this.messageText += emoji;
  }

  closeEmojiPicker() {
    this.showEmojiPicker.set(false);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading.set(true);
      this.chatService.uploadFile(file).subscribe({
        next: (res) => {
          this.imageSent.emit({ url: res.url, mimetype: res.mimetype });
          this.isUploading.set(false);
          // Opcional: limpiar el input
          event.target.value = '';
        },
        error: (err) => {
          console.error('Error uploading file', err);
          this.isUploading.set(false);
        }
      });
    }
  }
}
