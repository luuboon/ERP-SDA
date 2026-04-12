import { Injectable } from '@angular/core';
import { UserRepository } from '../../../core/repositories/user.repository';
import { User } from '../../../core/models/user.model';
import { MockDB, cleanUser } from './mock-db';

@Injectable({ providedIn: 'root' })
export class InMemoryUserRepository implements UserRepository {
    async getUsers(): Promise<User[]> {
        return Promise.resolve(MockDB.users.map(cleanUser));
    }

    async getById(id: string): Promise<User | undefined> {
        const u = MockDB.users.find(x => x.id === id);
        return Promise.resolve(u ? cleanUser(u) : undefined);
    }

    async getByEmail(email: string): Promise<User | undefined> {
        const u = MockDB.users.find(x => x.email === email);
        return Promise.resolve(u ? cleanUser(u) : undefined);
    }

    async create(data: Omit<User, 'id'>): Promise<User> {
        const dbUser = { id: 'u-' + crypto.randomUUID().slice(0, 8), ...data, password: 'defaultpassword123' };
        MockDB.users.push(dbUser);
        return Promise.resolve(cleanUser(dbUser));
    }

    async update(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
        const idx = MockDB.users.findIndex(x => x.id === id);
        if (idx === -1) return Promise.resolve(undefined);
        MockDB.users[idx] = { ...MockDB.users[idx], ...changes };
        return Promise.resolve(cleanUser(MockDB.users[idx]));
    }

    async delete(id: string): Promise<boolean> {
        const initialLen = MockDB.users.length;
        MockDB.users = MockDB.users.filter(x => x.id !== id);
        return Promise.resolve(MockDB.users.length !== initialLen);
    }
}
