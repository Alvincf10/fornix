import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  LucideArchive,
  LucideFileText,
  LucideFlag,
  LucideFlaskConical,
  LucideFolderKanban,
  LucideLayoutDashboard,
  LucideSearch,
  provideLucideIcons,
} from '@lucide/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideLucideIcons(
      LucideLayoutDashboard,
      LucideFlaskConical,
      LucideFolderKanban,
      LucideFlag,
      LucideFileText,
      LucideSearch,
      LucideArchive,
    ),
  ],
};

