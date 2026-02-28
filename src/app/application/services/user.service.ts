import { Injectable, signal } from '@angular/core';
import { User } from '../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _users = signal<User[]>([
        {
            id: crypto.randomUUID(),
            name: 'Admin ERP',
            email: 'admin@erp.com',
            role: 'Administrador',
        },
        {
            id: crypto.randomUUID(),
            name: 'Ana García',
            email: 'ana.garcia@erp.com',
            role: 'Analista',
        },
        {
            id: crypto.randomUUID(),
            name: 'Carlos Méndez',
            email: 'carlos.mendez@erp.com',
            role: 'Soporte',
        },
        {
            id: crypto.randomUUID(),
            name: 'Laura Torres',
            email: 'laura.torres@erp.com',
            role: 'Viewer',
        },
    ]);

    readonly users = this._users.asReadonly();

    create(data: Omit<User, 'id'>): void {
        const newUser: User = { id: crypto.randomUUID(), ...data };
        this._users.update(list => [...list, newUser]);
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
