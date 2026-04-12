import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../../core/models/user.model';
import { ALL_PERMISSIONS, hasAllPermissions } from '../../core/models/permission.model';
import { UserRepository } from '../../core/repositories/user.repository';

@Injectable({ providedIn: 'root' })
export class UserService {
    private repository = inject(UserRepository);
    private _users = signal<User[]>([]);

    readonly users = this._users.asReadonly();

    constructor() {
        this.loadUsers();
    }

    async loadUsers(): Promise<void> {
        const users = await this.repository.getUsers();
        this._users.set(users);
    }

    getById(id: string): User | undefined {
        return this._users().find(u => u.id === id);
    }

    getByEmail(email: string): User | undefined {
        return this._users().find(u => u.email === email);
    }

    async create(data: Omit<User, 'id'>): Promise<User> {
        const newUser = await this.repository.create(data);
        this._users.update(list => [...list, newUser]);
        return newUser;
    }

    async update(id: string, changes: Partial<Omit<User, 'id'>>): Promise<void> {
        const updated = await this.repository.update(id, changes);
        if (updated) {
            this._users.update(list => list.map(u => u.id === id ? updated : u));
        }
    }

    async delete(id: string): Promise<void> {
        const success = await this.repository.delete(id);
        if (success) {
            this._users.update(list => list.filter(u => u.id !== id));
        }
    }

    async grantAllPermissions(userId: string): Promise<void> {
        await this.update(userId, { permissions: [...ALL_PERMISSIONS] });
    }

    getPermissionLabel(user: User): string {
        if (hasAllPermissions(user.permissions)) return 'Acceso total';
        if (user.permissions.length >= 6) return 'Avanzado';
        if (user.permissions.length >= 3) return 'Estándar';
        return 'Básico';
    }
}
