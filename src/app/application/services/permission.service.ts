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
