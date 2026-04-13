# 📋 Plan — Conectar Frontend Angular al Backend

## Contexto
El frontend ya tiene la arquitectura de repositorios lista.
Actualmente usa implementaciones `InMemory*`.
Solo hay que crear implementaciones `Http*` y cambiar el `provide` en `app.config.ts`.
**Cero cambios en servicios, components ni UI.**

---

## BLOQUE 1 — Configuración base

### Tarea 1.1 — Crear `src/environments/`

Crear dos archivos para manejar la URL del Gateway según el entorno:

**`src/environments/environment.ts` (desarrollo local):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

**`src/environments/environment.prod.ts` (producción):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://erp-gateway-production.up.railway.app',
};
```

---

### Tarea 1.2 — Crear `src/app/core/interceptors/auth.interceptor.ts`

Este interceptor se ejecuta en CADA request HTTP que haga Angular.
Su trabajo es leer el token de la cookie y agregarlo al header `Authorization`.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

// Lee la cookie erp_token y la agrega como Bearer token
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getCookie('erp_token');
  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
```

---

### Tarea 1.3 — Registrar el interceptor en `app.config.ts`

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Cambiar:
provideHttpClient()
// Por:
provideHttpClient(withInterceptors([authInterceptor]))
```

---

## BLOQUE 2 — Implementaciones Http de cada repositorio

Crear en `src/app/infrastructure/repositories/http/`

---

### Tarea 2.1 — `http-auth.repository.ts`

Implementa `AuthRepository` llamando al Gateway.

```typescript
@Injectable({ providedIn: 'root' })
export class HttpAuthRepository extends AuthRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  async login(email: string, password: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<{ token: string; user: User }>>
          (`${this.base}/login`, { email, password })
      );
      const item = res.data[0];
      return { success: true, user: item.user, token: item.token };
    } catch (err: any) {
      return { success: false, error: err.error?.message ?? 'Error al iniciar sesión' };
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<User>>(`${this.base}/register`, data)
      );
      return { success: true, user: res.data[0] };
    } catch (err: any) {
      return { success: false, error: err.error?.message ?? 'Error al registrarse' };
    }
  }
}
```

**Tipo helper `ApiResponse`** — crear en `src/app/core/models/api-response.model.ts`:
```typescript
export interface ApiResponse<T> {
  statusCode: number;
  intOpCode:  string;
  data:       T[];
}
```

---

### Tarea 2.2 — `http-user.repository.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class HttpUserRepository extends UserRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/users`;

  async getUsers(): Promise<User[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<User>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<User | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<User>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async getByEmail(_email: string): Promise<User | undefined> {
    // El backend no expone búsqueda por email directamente — no se usa en el frontend
    return undefined;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const res = await firstValueFrom(this.http.post<ApiResponse<User>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<User>>(`${this.base}/${id}`, changes)
      );
      return res.data[0];
    } catch { return undefined; }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`));
      return true;
    } catch { return false; }
  }
}
```

---

### Tarea 2.3 — `http-group.repository.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class HttpGroupRepository extends GroupRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/groups`;

  async getGroups(): Promise<Group[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Group>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<Group | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<Group>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async create(data: Omit<Group, 'id' | 'status'>): Promise<Group> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Group>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<Group, 'id'>>): Promise<Group | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<Group>>(`${this.base}/${id}`, changes)
      );
      return res.data[0];
    } catch { return undefined; }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`));
      return true;
    } catch { return false; }
  }
}
```

---

### Tarea 2.4 — `http-ticket.repository.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class HttpTicketRepository extends TicketRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/tickets`;

  async getTickets(): Promise<Ticket[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Ticket>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<Ticket>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async getByGroup(groupId: string): Promise<Ticket[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Ticket>>(`${this.base}?groupId=${groupId}`)
    );
    return res.data;
  }

  async create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): Promise<Ticket> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Ticket>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, _changedBy: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<Ticket>>(`${this.base}/${id}`, changes)
      );
      return res.data[0];
    } catch { return undefined; }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`));
      return true;
    } catch { return false; }
  }

  async addComment(ticketId: string, _author: string, content: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<Ticket>>(`${this.base}/${ticketId}/comments`, { content })
      );
      return res.data[0];
    } catch { return undefined; }
  }
}
```

---

## BLOQUE 3 — Cambiar providers en `app.config.ts`

Este es el único cambio que activa el backend real.
Cambiar los 4 `provide`:

```typescript
// ANTES
{ provide: AuthRepository,   useClass: InMemoryAuthRepository },
{ provide: UserRepository,   useClass: InMemoryUserRepository },
{ provide: GroupRepository,  useClass: InMemoryGroupRepository },
{ provide: TicketRepository, useClass: InMemoryTicketRepository },

// DESPUÉS
{ provide: AuthRepository,   useClass: HttpAuthRepository },
{ provide: UserRepository,   useClass: HttpUserRepository },
{ provide: GroupRepository,  useClass: HttpGroupRepository },
{ provide: TicketRepository, useClass: HttpTicketRepository },
```

---

## BLOQUE 4 — Ajustes menores en servicios existentes

### Tarea 4.1 — `AuthService` — leer usuario desde JWT en cookie al recargar

Actualmente si el usuario recarga la página, `_currentUser` se resetea a null
porque vive en memoria. Con el backend real necesitamos restaurarlo desde el JWT.

Agregar en `AuthService`:

```typescript
// Llamar en el constructor para restaurar sesión al recargar
initFromCookie(): void {
  const token = this.getCookieValue('erp_token');
  if (!token) return;

  try {
    // Decodificar el payload del JWT (sin verificar firma — eso lo hace el backend)
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 > Date.now()) {
      this._currentUser.set({
        id:                 payload.sub,
        email:              payload.email,
        name:               payload.name ?? '',
        globalPermissions:  payload.globalPermissions  ?? [],
        permissionsByGroup: payload.permissionsByGroup ?? {},
      });
    } else {
      this.clearCookie('erp_token'); // token expirado
    }
  } catch {
    this.clearCookie('erp_token');
  }
}

private getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}
```

Llamar `initFromCookie()` en `app.ts` o en el constructor de `AuthService`.

---

### Tarea 4.2 — `GroupService` — cambiar de sync a async

Actualmente `GroupService.getById()` es síncrono (devuelve directamente del signal).
Con el backend es async. Revisar los componentes que llaman a `groupService.getById()`
y asegurarse que manejan la promesa.

---

## BLOQUE 5 — CORS en el Gateway

Una vez que el frontend esté deployado (ej: Vercel, Netlify, o GitHub Pages),
actualizar la variable en Railway:

```
CORS_ORIGINS=https://tu-frontend.vercel.app,http://localhost:4200
```

---

## Orden de ejecución

```
1. Tarea 1.1 — Crear environments/
2. Tarea 1.2 — Crear auth.interceptor.ts
3. Tarea 1.3 — Registrar interceptor en app.config.ts
4. Tarea 2.1 — HttpAuthRepository
5. Tarea 2.2 — HttpUserRepository
6. Tarea 2.3 — HttpGroupRepository
7. Tarea 2.4 — HttpTicketRepository
8. Tarea 4.1 — initFromCookie en AuthService
9. Tarea 3   — Cambiar providers en app.config.ts  ← ÚLTIMO PASO
10. Probar login en local apuntando al Gateway de Railway
```

---

## Verificación final

- [ ] Login guarda token en cookie y popula `currentUser`
- [ ] Al recargar la página, la sesión se restaura desde la cookie
- [ ] El Kanban carga tickets reales desde Neon
- [ ] Crear un ticket persiste en la BD
- [ ] Cambiar de grupo actualiza permisos correctamente
- [ ] Los botones controlados por `*appHasPermission` aparecen/desaparecen según el usuario