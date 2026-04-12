import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

import { UserRepository } from './core/repositories/user.repository';
import { InMemoryUserRepository } from './infrastructure/repositories/in-memory/in-memory-user.repository';
import { TicketRepository } from './core/repositories/ticket.repository';
import { InMemoryTicketRepository } from './infrastructure/repositories/in-memory/in-memory-ticket.repository';
import { GroupRepository } from './core/repositories/group.repository';
import { InMemoryGroupRepository } from './infrastructure/repositories/in-memory/in-memory-group.repository';
import { AuthRepository } from './core/repositories/auth.repository';
import { InMemoryAuthRepository } from './infrastructure/repositories/in-memory/in-memory-auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
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
    { provide: UserRepository, useClass: InMemoryUserRepository },
    { provide: TicketRepository, useClass: InMemoryTicketRepository },
    { provide: GroupRepository, useClass: InMemoryGroupRepository },
    { provide: AuthRepository, useClass: InMemoryAuthRepository }
  ]
};