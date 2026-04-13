/**
 * Permission constants and helper utilities.
 * The app uses permissions (NOT roles) to control access.
 */

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

/** All available permissions as an array (for UI iteration) */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

// Mapa de permisos por grupo: { 'g-alpha': ['tickets:add', 'tickets:view'], ... }
export type GroupPermissionsMap = Record<string, Permission[]>;

export function hasPermission(permsForGroup: string[], permission: string): boolean {
  return permsForGroup.includes(permission);
}
