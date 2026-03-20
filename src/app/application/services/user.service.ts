import { Injectable, signal, computed } from '@angular/core';
import { User } from '../../core/models/user.model';
import { ALL_PERMISSIONS, hasAllPermissions, PERMISSIONS } from '../../core/models/permission.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _users = signal<User[]>([
        {
            id: 'u-superadmin',
            name: 'Super Admin',
            email: 'admin@erp.com',
            password: 'admin123',
            permissions: [...ALL_PERMISSIONS],
        },
        {
            id: 'u-carlos',
            name: 'Carlos Méndez',
            email: 'carlos@erp.com',
            password: 'carlos123',
            permissions: [
                PERMISSIONS.TICKET_EDIT,
                PERMISSIONS.TICKET_VIEW,
            ],
        },
        {
            id: 'u-ana',
            name: 'Ana García',
            email: 'ana@erp.com',
            password: 'ana123',
            permissions: [
                PERMISSIONS.TICKET_CREATE, PERMISSIONS.TICKET_EDIT,
                PERMISSIONS.TICKET_VIEW,
                PERMISSIONS.GROUP_ADD, PERMISSIONS.GROUP_EDIT, PERMISSIONS.GROUP_DELETE,
            ],
        },
        {
            id: 'u-laura',
            name: 'Laura Torres',
            email: 'laura@erp.com',
            password: 'laura123',
            permissions: [
                PERMISSIONS.TICKET_VIEW,
                PERMISSIONS.TICKET_CREATE,
            ],
        },
        {
            id: 'u-miguel',
            name: 'Miguel Ríos',
            email: 'miguel@erp.com',
            password: 'miguel123',
            permissions: [
                PERMISSIONS.TICKET_VIEW,
            ],
        },
    ]);

    readonly users = this._users.asReadonly();

    getById(id: string): User | undefined {
        return this._users().find(u => u.id === id);
    }

    getByEmail(email: string): User | undefined {
        return this._users().find(u => u.email === email);
    }

    create(data: Omit<User, 'id'>): User {
        const newUser: User = { id: 'u-' + crypto.randomUUID().slice(0, 8), ...data };
        this._users.update(list => [...list, newUser]);
        return newUser;
    }

    update(id: string, changes: Partial<Omit<User, 'id'>>): void {
        this._users.update(list =>
            list.map(u => u.id === id ? { ...u, ...changes } : u)
        );
    }

    delete(id: string): void {
        this._users.update(list => list.filter(u => u.id !== id));
    }

    /** Grant every available permission to a user */
    grantAllPermissions(userId: string): void {
        this.update(userId, { permissions: [...ALL_PERMISSIONS] });
    }

    /** Get a display label for a user's permission level */
    getPermissionLabel(user: User): string {
        if (hasAllPermissions(user.permissions)) return 'Acceso total';
        if (user.permissions.length >= 6) return 'Avanzado';
        if (user.permissions.length >= 3) return 'Estándar';
        return 'Básico';
    }
}
