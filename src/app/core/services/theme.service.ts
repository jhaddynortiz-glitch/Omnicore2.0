import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);
  private storageKey = 'omnicore-theme-dark';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  initTheme() {
    if (isPlatformBrowser(this.platformId)) {
        const storedTheme = localStorage.getItem(this.storageKey);
        
        // Cargar estado de memoria o desde modo oscuro del OS si es su primera vez
        let useDark = false;
        if (storedTheme === 'true') {
            useDark = true;
        } else if (storedTheme === 'false') {
            useDark = false;
        } else {
            useDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        this.applyTheme(useDark);
    }
  }

  toggleTheme() {
    const newVal = !this.isDarkMode();
    this.applyTheme(newVal);
  }

  private applyTheme(setDark: boolean) {
      this.isDarkMode.set(setDark);
      if (isPlatformBrowser(this.platformId)) {
          const element = document.documentElement;
          if (setDark) {
              element.classList.add('app-dark');
              localStorage.setItem(this.storageKey, 'true');
          } else {
              element.classList.remove('app-dark');
              localStorage.setItem(this.storageKey, 'false');
          }
      }
  }
}
