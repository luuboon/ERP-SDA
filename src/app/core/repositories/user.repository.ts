import { User } from '../models/user.model';

export abstract class UserRepository {
    abstract getUsers(): Promise<User[]>;
    abstract getById(id: string): Promise<User | undefined>;
    abstract getByEmail(email: string): Promise<User | undefined>;
    abstract create(data: Omit<User, 'id'>): Promise<User>;
    abstract update(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
    abstract delete(id: string): Promise<boolean>;
    abstract setGroupPermissions(userId: string, groupId: string, permissions: string[]): Promise<void>;
}
