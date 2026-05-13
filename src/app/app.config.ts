import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const OpalinePreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#fff3f1',
            100: '#ffe3de',
            200: '#ffccc3',
            300: '#ffaba1',
            400: '#ff7767',
            500: '#FF634A', // Color Cinabrio principal
            600: '#ed4226',
            700: '#c72e15',
            800: '#a52a16',
            900: '#892716',
            950: '#4b1008'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#F4F4F6',   // Opaline base
                    100: '#E7E7E7',  // Opaline gris claro
                    200: '#D2D2D4',  // Opaline gris medio
                    300: '#bababc',
                    400: '#9c9c9f',
                    500: '#848488',
                    600: '#646468',
                    700: '#444448',
                    800: '#2b2b2b',
                    900: '#1a1a1a',
                    950: '#0e0e0e'
                }
            },
            dark: {
                surface: {
                    0: '#101010',
                    50: '#141414',
                    100: '#1A1A1A',
                    200: '#262626',
                    300: '#3D3D3D',
                    400: '#525252',
                    500: '#737373',
                    600: '#A3A3A3',
                    700: '#D4D4D4',
                    800: '#E5E5E5',
                    900: '#F5F5F5',
                    950: '#FAFAFA'
                }
            }
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: OpalinePreset,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        })
    ]
};
