import { Injectable, signal } from '@angular/core';
import { User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _users = signal<User[]>([
        {
            id: 'u-admin',
            name: 'Admin ERP',
            email: 'admin@erp.com',
            role: 'Administrador',
        },
        {
            id: 'u-ana',
            name: 'Ana García',
            email: 'ana.garcia@erp.com',
            role: 'Analista',
        },
        {
            id: 'u-carlos',
            name: 'Carlos Méndez',
            email: 'carlos.mendez@erp.com',
            role: 'Soporte',
        },
        {
            id: 'u-laura',
            name: 'Laura Torres',
            email: 'laura.torres@erp.com',
            role: 'Viewer',
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
            list.map(u => (u.id === id ? { ...u, ...changes } : u))
        );
    }

    delete(id: string): void {
        this._users.update(list => list.filter(u => u.id !== id));
    }
}
