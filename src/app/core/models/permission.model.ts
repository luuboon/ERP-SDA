/**
 * Permission constants and helper utilities.
 * The app uses permissions (NOT roles) to control access.
 */

export const PERMISSIONS = {
    // Ticket permissions
    TICKET_CREATE: 'ticket:create',
    TICKET_EDIT: 'ticket:edit',
    TICKET_DELETE: 'ticket:delete',
    TICKET_VIEW: 'ticket:view',

    // Group permissions
    GROUP_ADD: 'group:add',
    GROUP_EDIT: 'group:edit',
    GROUP_DELETE: 'group:delete',

    // User management permissions
    USER_CREATE: 'user:create',
    USER_EDIT: 'user:edit',
    USER_DELETE: 'user:delete',
    USER_VIEW: 'user:view',
    USER_MANAGE_PERMISSIONS: 'user:manage-permissions',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** All available permissions as an array (for UI iteration) */
export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/** Check if a user's permission list includes a specific permission */
export function hasPermission(permissions: string[], permission: string): boolean {
    return permissions.includes(permission);
}

/** Returns true if the user has every permission in the system */
export function hasAllPermissions(permissions: string[]): boolean {
    return ALL_PERMISSIONS.every(p => permissions.includes(p));
}
