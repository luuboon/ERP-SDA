# 📋 Plan de Implementación — Frontend ERP-SDA
# Cambios requeridos por el documento de requerimientos

> Basado en revisión completa del código actual vs requerimientos del proyecto.
> Cada tarea indica exactamente **qué archivo tocar**, **qué cambiar** y **por qué**.

---

## BLOQUE 1 — Modelo de permisos por grupo

### Por qué cambia
Los permisos actuales son **globales** (`user.permissions = string[]`).
El requerimiento dice: un usuario puede tener `tickets:add` en el Grupo A
pero NO en el Grupo B. Requiere estructura **por grupo**.

---

### Tarea 1.1 — `core/models/permission.model.ts`

**Acción:** Reemplazar todo el archivo.

**Cambios:**
- Los strings de permisos cambian de `ticket:create` → `tickets:add`, etc.
- Agregar nuevo tipo `GroupPermissions` (mapa groupId → permisos)

**Nuevo contenido:**
```typescript
export const PERMISSIONS = {
  // Tickets
  TICKETS_ADD:    'tickets:add',
  TICKETS_MOVE:   'tickets:move',
  TICKETS_VIEW:   'tickets:view',
  TICKETS_DELETE: 'tickets:delete',

  // Groups
  GROUPS_MANAGE:  'groups:manage',

  // Users
  USERS_MANAGE:   'users:manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

// Mapa de permisos por grupo: { 'g-alpha': ['tickets:add', 'tickets:view'], ... }
export type GroupPermissionsMap = Record<string, Permission[]>;

export function hasPermission(permsForGroup: string[], permission: string): boolean {
  return permsForGroup.includes(permission);
}
```

---

### Tarea 1.2 — `core/models/user.model.ts`

**Acción:** Cambiar la estructura del campo de permisos.

**Antes:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  permissions: string[];   // ← global, incorrecto
  avatar?: string;
}
```

**Después:**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  // Permisos globales (admin del sistema, no dependen del grupo)
  globalPermissions: string[];
  // Permisos por grupo: { 'g-alpha': ['tickets:add', 'tickets:view'] }
  permissionsByGroup: Record<string, string[]>;
  avatar?: string;
}
```

---

### Tarea 1.3 — `infrastructure/repositories/in-memory/mock-db.ts`

**Acción:** Actualizar todos los usuarios con la nueva estructura.

**Ejemplo para el superadmin:**
```typescript
{
  id: 'u-superadmin',
  name: 'Super Admin',
  email: 'admin@erp.com',
  password: 'admin123',
  globalPermissions: [...ALL_PERMISSIONS],
  permissionsByGroup: {
    'g-alpha':  [...ALL_PERMISSIONS],
    'g-design': [...ALL_PERMISSIONS],
    'g-sales':  [...ALL_PERMISSIONS],
  },
}
```

**Para un usuario normal (Carlos, solo puede ver y mover tickets en g-alpha):**
```typescript
{
  id: 'u-carlos',
  name: 'Carlos Méndez',
  email: 'carlos@erp.com',
  password: 'carlos123',
  globalPermissions: [],
  permissionsByGroup: {
    'g-alpha': ['tickets:view', 'tickets:move'],
    'g-sales': ['tickets:view'],
  },
}
```

**Para Ana (puede gestionar grupos en g-design):**
```typescript
{
  id: 'u-ana',
  name: 'Ana García',
  email: 'ana@erp.com',
  password: 'ana123',
  globalPermissions: [],
  permissionsByGroup: {
    'g-design': ['tickets:add', 'tickets:view', 'tickets:move', 'groups:manage'],
    'g-alpha':  ['tickets:view'],
  },
}
```

---

## BLOQUE 2 — PermissionService (nuevo servicio central)

### Por qué es necesario
El requerimiento exige un servicio con exactamente esta API:
```typescript
hasPermission(permission: string): boolean
refreshPermissionsForGroup(groupId: string): void
```
Todos los componentes y la directiva deben usar ESTE servicio, no `AuthService.hasPermission()`.

---

### Tarea 2.1 — Crear `application/services/permission.service.ts`

**Archivo nuevo completo:**
```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private authService = inject(AuthService);

  // El groupId activo — se actualiza cuando el usuario cambia de grupo
  private _activeGroupId = signal<string>('');

  readonly activeGroupId = this._activeGroupId.asReadonly();

  // Permisos efectivos del usuario en el grupo activo:
  // = globalPermissions UNION permissionsByGroup[groupId]
  readonly effectivePermissions = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];

    const global = user.globalPermissions ?? [];
    const forGroup = user.permissionsByGroup?.[this._activeGroupId()] ?? [];

    // Unión sin duplicados
    return [...new Set([...global, ...forGroup])];
  });

  /**
   * Verifica si el usuario tiene el permiso en el grupo activo.
   * Este es el método que usa la directiva appHasPermission y los componentes.
   */
  hasPermission(permission: string): boolean {
    return this.effectivePermissions().includes(permission);
  }

  /**
   * Se llama cuando el usuario selecciona o cambia de grupo.
   * Recalcula los permisos efectivos automáticamente vía signal.
   */
  refreshPermissionsForGroup(groupId: string): void {
    this._activeGroupId.set(groupId);
  }
}
```

---

### Tarea 2.2 — Actualizar `AuthService`

**Eliminar** el método `hasPermission()` de `AuthService`.
Ese método ya no debe existir ahí — toda verificación de permisos
pasa por `PermissionService`.

**Agregar** guardado del token en cookie al hacer login:

```typescript
// En el método login(), después de this._currentUser.set(result.user):
this.setCookie('erp_token', result.token, 8); // 8 horas

// Nuevo método privado:
private setCookie(name: string, value: string, hours: number): void {
  const expires = new Date(Date.now() + hours * 3600 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

// En logout(), limpiar la cookie:
private clearCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
```

**Nota:** Por ahora el token viene del mock. Cuando se conecte al backend real,
el campo `token` lo devolverá el Gateway en `data[0].token`.

---

## BLOQUE 3 — Directiva `appHasPermission`

### Por qué es estructural (no solo CSS)
El requerimiento dice: "el elemento se **elimina del DOM**", no solo ocultado.
Eso requiere una directiva estructural (`*appHasPermission`) que use `ViewContainerRef`.

---

### Tarea 3.1 — Crear `core/directives/has-permission.directive.ts`

```typescript
import {
  Directive, Input, OnInit, OnDestroy,
  TemplateRef, ViewContainerRef, inject, effect
} from '@angular/core';
import { PermissionService } from '../../application/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  private templateRef     = inject(TemplateRef<unknown>);
  private viewContainer   = inject(ViewContainerRef);
  private permissionSvc   = inject(PermissionService);

  private _permission = '';
  private _hasView    = false;

  @Input()
  set appHasPermission(permission: string) {
    this._permission = permission;
    this.updateView();
  }

  ngOnInit(): void {
    // Reaccionar reactivamente cuando cambien los permisos efectivos
    // (cuando el usuario cambia de grupo)
    effect(() => {
      // Leer el signal para suscribirse a cambios
      this.permissionSvc.effectivePermissions();
      this.updateView();
    });
  }

  private updateView(): void {
    if (this.permissionSvc.hasPermission(this._permission)) {
      if (!this._hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this._hasView = true;
      }
    } else {
      if (this._hasView) {
        this.viewContainer.clear();
        this._hasView = false;
      }
    }
  }
}
```

**Uso en templates:**
```html
<!-- El botón no existe en el DOM si el usuario no tiene tickets:add -->
<p-button
  *appHasPermission="'tickets:add'"
  label="Nuevo Ticket"
  icon="pi pi-plus"
  (onClick)="openCreate()"
/>
```

---

## BLOQUE 4 — Actualizar AuthGuard y DashboardLayout

### Tarea 4.1 — `core/guards/auth.guard.ts`

Sin cambios estructurales. Solo verificar que `authService.isLoggedIn()` 
funciona después de los cambios a `AuthService`.

---

### Tarea 4.2 — `presentation/layouts/dashboard-layout/dashboard-layout.ts`

**Cambios:**
1. Inyectar `PermissionService` en lugar de usar `authService.hasPermission()`
2. Llamar a `permissionService.refreshPermissionsForGroup(groupId)` en `ngOnInit`
   cuando se obtiene el `groupId` de los params
3. Actualizar `navItems` para usar los nuevos strings de permisos:
   - `PERMISSIONS.GROUP_ADD` → `PERMISSIONS.GROUPS_MANAGE`
   - `PERMISSIONS.USER_VIEW` → `PERMISSIONS.USERS_MANAGE`
4. Agregar al nav: ítem "Tickets" apuntando a `dashboard/:id/tickets`

**En ngOnInit:**
```typescript
this.route.paramMap.subscribe(params => {
  const id = params.get('groupId');
  if (id) {
    this.groupId.set(id);
    this.permissionService.refreshPermissionsForGroup(id); // ← NUEVO
    this.verifyAccess(id);
  }
});
```

**navItems actualizado:**
```typescript
readonly navItems = computed(() => {
  const id = this.groupId();
  if (!id) return [];
  return [
    { label: 'Dashboard',  icon: 'pi pi-chart-bar', route: `/dashboard/${id}`,         exact: true },
    { label: 'Tickets',    icon: 'pi pi-ticket',     route: `/dashboard/${id}/tickets`              },
    { label: 'Grupos',     icon: 'pi pi-users',      route: `/dashboard/${id}/group`,
      permission: PERMISSIONS.GROUPS_MANAGE },
    { label: 'Usuarios',   icon: 'pi pi-user',       route: `/dashboard/${id}/user`,
      permission: PERMISSIONS.USERS_MANAGE },
    { label: 'Perfil',     icon: 'pi pi-id-card',    route: `/dashboard/${id}/profile`              },
  ].filter(item => !item.permission || this.permissionService.hasPermission(item.permission));
});
```

---

## BLOQUE 5 — Actualizar componentes existentes

### Tarea 5.1 — `tickets-page/tickets-page.ts`

**Cambios:**
1. Eliminar el método `hasPermission()` local — usar `PermissionService`
2. Actualizar todos los strings de permiso:
   - `'ticket:create'` → `'tickets:add'`
   - `PERMISSIONS.USER_MANAGE_PERMISSIONS` → `PERMISSIONS.USERS_MANAGE`
3. La lógica de drag-and-drop para mover estado:
   - El usuario puede mover SOLO si tiene `tickets:move` **Y** el ticket le está asignado
   - **O** si tiene `users:manage` (admin)
4. Inyectar `PermissionService` en lugar de llamar a `authService.hasPermission()`

**Lógica de canMove corregida:**
```typescript
canMoveTicket(ticket: Ticket): boolean {
  const user = this.authService.currentUser();
  if (!user) return false;
  const isAssigned = ticket.assignedTo === user.id;
  const hasMove    = this.permissionService.hasPermission(PERMISSIONS.TICKETS_MOVE);
  const isAdmin    = this.permissionService.hasPermission(PERMISSIONS.USERS_MANAGE);
  return (isAssigned && hasMove) || isAdmin;
}
```

**En `onDrop()`:**
```typescript
onDrop(status: TicketStatus): void {
  const ticket = this.draggedTicket();
  if (!ticket) return;

  if (!this.canMoveTicket(ticket)) {
    this.messageService.add({
      severity: 'error',
      summary: 'Permiso denegado',
      detail: 'Solo puedes mover tickets asignados a ti con permiso tickets:move'
    });
    this.draggedTicket.set(null);
    return;
  }
  // ... resto de la lógica
}
```

---

### Tarea 5.2 — `tickets-page/tickets-page.html`

**Cambios:**
1. Reemplazar `@if (hasPermission('ticket:create'))` por la directiva:
```html
<!-- ANTES -->
@if (hasPermission('ticket:create')) {
  <p-button label="Nuevo Ticket" ... />
}

<!-- DESPUÉS (se elimina del DOM, no solo se oculta) -->
<p-button
  *appHasPermission="'tickets:add'"
  label="Nuevo Ticket"
  icon="pi pi-plus"
  severity="contrast"
  (onClick)="openCreate()"
/>
```

2. El botón de mover estado en el Kanban también debe validar con la directiva
   (solo visible si tiene `tickets:move`)

---

### Tarea 5.3 — `dashboard-page/dashboard-page.ts` y `.html`

**Cambios en .ts:**
1. Inyectar `PermissionService`
2. Reemplazar `hasPermission()` local por `permissionService.hasPermission()`
3. Actualizar string: `'ticket:create'` → `'tickets:add'`

**Cambios en .html:**
```html
<!-- ANTES -->
@if (hasPermission('ticket:create')) {
  <p-button label="Nuevo Ticket" ... />
}

<!-- DESPUÉS -->
<p-button
  *appHasPermission="'tickets:add'"
  label="Nuevo Ticket"
  icon="pi pi-plus"
  severity="contrast"
  (onClick)="goToTickets()"
/>
```

---

### Tarea 5.4 — `group/group.ts` y `group-detail-page/group-detail-page.ts`

**Cambios:**
- Reemplazar verificaciones de `PERMISSIONS.GROUP_ADD/EDIT/DELETE`
  por `PERMISSIONS.GROUPS_MANAGE` (el requerimiento unifica todo en un solo permiso)
- Usar `PermissionService.hasPermission()` y directiva `*appHasPermission`

---

### Tarea 5.5 — `user/user.ts`

**Cambios:**
- Reemplazar `PERMISSIONS.USER_MANAGE_PERMISSIONS` y similares
  por `PERMISSIONS.USERS_MANAGE`
- La vista de gestión de permisos debe mostrar permisos **por grupo**:
  al editar un usuario, mostrar un selector de grupo y los permisos
  que tiene en ese grupo específico

---

## BLOQUE 6 — Actualizar repositorios in-memory

### Tarea 6.1 — `in-memory-user.repository.ts` y `in-memory-auth.repository.ts`

**Cambios:**
- Al crear usuario nuevo (register), inicializar `globalPermissions: []`
  y `permissionsByGroup: {}`
- `cleanUser()` ya elimina el password, no necesita cambios estructurales
  pero debe devolver el nuevo shape de `User`

### Tarea 6.2 — `in-memory-user.repository.ts` — método `updatePermissions`

Agregar un nuevo método al repositorio (y a la interface `UserRepository`):
```typescript
abstract updateGroupPermissions(
  userId: string,
  groupId: string,
  permissions: string[]
): Promise<User | undefined>;
```

Esto lo necesita la vista de Admin User para asignar permisos por grupo.

---

## BLOQUE 7 — Registrar la directiva globalmente

### Tarea 7.1 — `app.config.ts`

No necesita cambios para la directiva (es standalone).
Pero sí agregar `provideHttpClient()` para cuando se conecte al backend:

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

providers: [
  // ... existentes
  provideHttpClient(withFetch()),
]
```

### Tarea 7.2 — Importar `HasPermissionDirective` en cada componente que la use

Cada componente que use `*appHasPermission` debe importarla:
```typescript
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  imports: [
    // ... otros imports
    HasPermissionDirective,
  ]
})
```

Componentes afectados:
- `tickets-page.ts`
- `dashboard-page.ts`
- `group/group.ts`
- `group-detail-page.ts`
- `user/user.ts`
- `dashboard-layout.ts`

---

## BLOQUE 8 — Archivos a crear (resumen)

| Archivo nuevo | Descripción |
|---|---|
| `application/services/permission.service.ts` | Servicio central de permisos por grupo |
| `core/directives/has-permission.directive.ts` | Directiva estructural `*appHasPermission` |

---

## BLOQUE 9 — Archivos a modificar (resumen)

| Archivo | Cambios |
|---|---|
| `core/models/permission.model.ts` | Nuevos strings, nuevo tipo `GroupPermissionsMap` |
| `core/models/user.model.ts` | `permissions[]` → `globalPermissions[]` + `permissionsByGroup{}` |
| `infrastructure/.../mock-db.ts` | Usuarios con nueva estructura de permisos |
| `application/services/auth.service.ts` | Cookie para token, eliminar `hasPermission()` |
| `core/repositories/user.repository.ts` | Agregar `updateGroupPermissions()` |
| `infrastructure/.../in-memory-user.repository.ts` | Implementar `updateGroupPermissions()` |
| `presentation/layouts/dashboard-layout/dashboard-layout.ts` | `PermissionService`, nuevas nav items |
| `presentation/pages/dashboard/tickets-page/tickets-page.ts` | `PermissionService`, nuevos permisos, `canMoveTicket()` |
| `presentation/pages/dashboard/tickets-page/tickets-page.html` | Directiva en botones |
| `presentation/pages/dashboard/dashboard-page/dashboard-page.ts` | `PermissionService` |
| `presentation/pages/dashboard/dashboard-page/dashboard-page.html` | Directiva en botones |
| `presentation/pages/dashboard/group/group.ts` | `GROUPS_MANAGE`, `PermissionService` |
| `presentation/pages/dashboard/group-detail-page/group-detail-page.ts` | ídem |
| `presentation/pages/dashboard/user/user.ts` | `USERS_MANAGE`, permisos por grupo |
| `app.config.ts` | Agregar `provideHttpClient()` |

---

## Orden de ejecución recomendado

```
1. Tarea 1.1 — Actualizar permission.model.ts        (base de todo)
2. Tarea 1.2 — Actualizar user.model.ts              (base de todo)
3. Tarea 1.3 — Actualizar mock-db.ts                 (datos de prueba)
4. Tarea 2.1 — Crear PermissionService               (servicio central)
5. Tarea 2.2 — Actualizar AuthService                (cookies + eliminar hasPermission)
6. Tarea 3.1 — Crear directiva HasPermission         (directiva estructural)
7. Tarea 4.2 — Actualizar DashboardLayout            (nav + refreshPermissions)
8. Tarea 5.1 — Actualizar TicketsPage .ts            (canMoveTicket, permisos)
9. Tarea 5.2 — Actualizar TicketsPage .html          (directiva en botones)
10. Tarea 5.3 — Actualizar DashboardPage             (directiva en botones)
11. Tarea 5.4 — Actualizar Group pages               (GROUPS_MANAGE)
12. Tarea 5.5 — Actualizar User page                 (USERS_MANAGE, permisos por grupo)
13. Tarea 6.1/6.2 — Actualizar repositorios          (nueva estructura)
14. Tarea 7.1/7.2 — app.config + imports             (provideHttpClient, directiva)
```

---

## Validación final — checklist antes de entregar

- [ ] La directiva `*appHasPermission` elimina del DOM (no solo oculta)
- [ ] Cambiar de grupo actualiza los permisos sin recargar la página
- [ ] El botón "Agregar Ticket" solo aparece con `tickets:add`
- [ ] El botón "Mover estado" solo aparece si tiene `tickets:move` Y el ticket está asignado al usuario
- [ ] El nav solo muestra "Grupos" a quien tiene `groups:manage`
- [ ] El nav solo muestra "Usuarios" a quien tiene `users:manage`
- [ ] El token se guarda en cookie (verificar en DevTools → Application → Cookies)
- [ ] No hay `alert()` en ningún componente (usar `p-toast` de PrimeNG)
- [ ] El `PermissionService` expone exactamente `hasPermission()` y `refreshPermissionsForGroup()`
```