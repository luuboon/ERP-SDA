# Contexto y Configuración Base - ERP Luu

## Entorno de Desarrollo
* **Gestor de paquetes:** `pnpm`
* **Framework:** Angular 20+ (Standalone & Zoneless)
* **Librería UI:** PrimeNG 21+ (con PrimeUIX)

---

## Aprendizajes Clave de Configuración

### 1. Angular 20 es "Zoneless" por defecto
* **El problema:** Configurar con `provideZoneChangeDetection()` colapsa la app con error `NG0908`.
* **La solución:** Usar `provideZonelessChangeDetection()` en `app.config.ts`.

### 2. El nuevo motor de temas de PrimeNG (v18+)
* **El problema:** Importar `@import "primeng/resources/themes/..."` en `styles.css` lanza errores de compilación.
* **La solución:** Instalar `@primeuix/themes` y configurar vía `providePrimeNG({ theme: { preset: Lara } })` en `app.config.ts`.

### 3. Animaciones en PrimeNG
* `provideAnimationsAsync()` sigue siendo requerido para efectos visuales de PrimeNG (ripple, overlays). Aunque el IDE lo marque como deprecated, no eliminarlo.

### 4. Componentes Standalone — Regla de Oro
* Cada componente de PrimeNG usado en el template **debe importarse explícitamente** en el array `imports: []` del componente TypeScript. Error si no: `NG8001: is not a known element`.

### 5. Layouts y Doble Anidamiento (Double Nesting)
* **El problema:** Renderizados extraños o estiramientos extremos (ej. `min-height: 100vh` en componentes anidados) causados por envolver componentes de página (ej. `LoginComponent`) dentro de contenedores de layout (`AuthLayoutComponent`) que también definen sus propias tarjetas (`.auth-card`) o alturas máximas.
* **La solución:** El contenedor de Layout debe proporcionar limpiamente el `<router-outlet></router-outlet>`. La responsabilidad de crear el contenedor visual recae en el componente de la página, o si el Layout define la envoltura estructural, la página hija no debe recrearla ni forzar tamaños absolutos.

---

## Best Practices Aplicadas (Audit 2026-02-27)

### Angular 20 + Zoneless
| Práctica | Estado |
|---|---|
| `provideZonelessChangeDetection()` | ✅ Aplicado |
| Todos los componentes `standalone: true` | ✅ Aplicado |
| Lazy loading con `loadComponent` en todas las rutas | ✅ Aplicado |
| `ChangeDetectionStrategy.OnPush` en todos los componentes | ✅ Aplicado |
| Estado reactivo con `signal<T>()` en lugar de propiedades mutables | ✅ Aplicado en DashboardLayout |
| Control flow moderno (`@if`, `@for`, `@empty`) en templates | ✅ Usado en dashboard nav |
| `CommonModule` eliminado (built-in en Angular 17+) | ✅ Removido de Group |
| `inject()` para inyección de dependencias (vs. constructor params) | ✅ En login |

### PrimeNG v21
| Práctica | Estado |
|---|---|
| Tema configurado con `@primeuix/themes` (Lara preset) | ✅ |
| `provideAnimationsAsync()` incluido para ripple/overlays | ✅ |
| Notificaciones con `MessageService` + `<p-toast>` | ✅ En login |
| Cada componente PrimeNG importado explícitamente | ✅ |

### Pendientes Documentados
| Item | Decisión |
|---|---|
| `styles.css` tiene 391 líneas de utilidades Tailwind-like | Mantener por ahora, usar clases semánticas en nuevos componentes |
| Convención de nombres `Group`/`User` sin sufijo | Convención del proyecto (no es un error) |

---

## Patrón de Notificaciones (UI)

El patrón de feedback al usuario es: **PrimeNG `MessageService` + `<p-toast />`**

```typescript
// En el componente:
providers: [MessageService]
private messageService = inject(MessageService);

// Éxito:
this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Operación completada' });
// Error:
this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error' });
```

```html
<!-- En el template, primera línea: -->
<p-toast />
```

---

## Patrón de Formularios Reactivos

Usar `ReactiveFormsModule` + `FormBuilder` + `Validators`. Formularios siempre con:
- `FormBuilder` inyectado con `inject(FormBuilder)`
- Validaciones inline con `Validators`
- Bindings con `formGroup` + `formControlName`
- Botón submit deshabilitado si `form.invalid`

---

## Arquitectura de Capas

```
src/app/
├── core/
│   └── models/         ← Interfaces/Modelos de dominio (User, Group)
├── application/
│   └── services/       ← Servicios de aplicación con signals (UserService, GroupService)
└── presentation/
    ├── layouts/         ← DashboardLayout, AuthLayout
    └── pages/
        ├── auth/        ← Login, Register
        └── dashboard/   ← User, Group
```

### Convención de servicios (con Signals)
```typescript
@Injectable({ providedIn: 'root' })
export class GroupService {
  // Estado reactivo
  private _groups = signal<Group[]>([]);
  readonly groups = this._groups.asReadonly();

  // Operaciones CRUD con notificación via MessageService
  create(group: Omit<Group, 'id'>): void { ... }
  update(id: string, changes: Partial<Group>): void { ... }
  delete(id: string): void { ... }
}
```

---

## Archivo Base de Configuración (`src/app/app.config.ts`)

```typescript
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Lara, options: { darkModeSelector: '.app-dark' } }
    })
  ]
};
```