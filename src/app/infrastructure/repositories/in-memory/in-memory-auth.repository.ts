import { Injectable } from '@angular/core';
import { AuthRepository } from '../../../core/repositories/auth.repository';
import { User } from '../../../core/models/user.model';
import { MockDB, cleanUser } from './mock-db';

@Injectable({ providedIn: 'root' })
export class InMemoryAuthRepository implements AuthRepository {
    async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string; token?: string }> {
        const dbUser = MockDB.users.find(u => u.email === email);
        if (!dbUser) {
            return Promise.resolve({ success: false, error: 'Usuario no encontrado' });
        }
        if (dbUser.password !== password) {
            return Promise.resolve({ success: false, error: 'Contraseña incorrecta' });
        }
        return Promise.resolve({ success: true, user: cleanUser(dbUser), token: 'mock-jwt-token' });
    }

    async register(data: { name: string; email: string; password: string }): Promise<{ success: boolean; user?: User; error?: string; token?: string }> {
        const existing = MockDB.users.find(u => u.email === data.email);
        if (existing) {
            return Promise.resolve({ success: false, error: 'El email ya está registrado' });
        }
        const dbUser = {
            id: 'u-' + crypto.randomUUID().slice(0, 8),
            name: data.name,
            email: data.email,
            password: data.password,
            globalPermissions: [],
            permissionsByGroup: {},
        };
        MockDB.users.push(dbUser);
        return Promise.resolve({ success: true, user: cleanUser(dbUser), token: 'mock-jwt-token' });
    }
}
