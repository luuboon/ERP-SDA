import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

import { UserRepository } from './core/repositories/user.repository';
import { HttpUserRepository } from './infrastructure/repositories/http/http-user.repository';
import { TicketRepository } from './core/repositories/ticket.repository';
import { HttpTicketRepository } from './infrastructure/repositories/http/http-ticket.repository';
import { GroupRepository } from './core/repositories/group.repository';
import { HttpGroupRepository } from './infrastructure/repositories/http/http-group.repository';
import { AuthRepository } from './core/repositories/auth.repository';
import { HttpAuthRepository } from './infrastructure/repositories/http/http-auth.repository';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    { provide: UserRepository, useClass: HttpUserRepository },
    { provide: TicketRepository, useClass: HttpTicketRepository },
    { provide: GroupRepository, useClass: HttpGroupRepository },
    { provide: AuthRepository, useClass: HttpAuthRepository }
  ]
};