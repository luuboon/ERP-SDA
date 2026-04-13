import { Injectable, signal, computed, inject } from '@angular/core';
import { Group } from '../../core/models/group.model';
import { UserService } from './user.service';
import { GroupRepository } from '../../core/repositories/group.repository';

@Injectable({ providedIn: 'root' })
export class GroupService {
    private userService = inject(UserService);
    private repository = inject(GroupRepository);
    private _groups = signal<Group[]>([]);

    readonly groups = this._groups.asReadonly();

    constructor() {
        this.loadGroups();
    }

    async loadGroups(): Promise<void> {
        const groups = await this.repository.getGroups();
        this._groups.set(groups);
    }

    getById(id: string): Group | undefined {
        return this._groups().find(g => g.id === id);
    }

    async create(data: Omit<Group, 'id' | 'status'>): Promise<void> {
        const newGroup = await this.repository.create(data);
        this._groups.update(list => [...list, newGroup]);
    }

    async update(id: string, changes: Partial<Omit<Group, 'id'>>): Promise<void> {
        const updated = await this.repository.update(id, changes);
        if (updated) {
            this._groups.update(list => list.map(g => (g.id === id ? updated : g)));
        }
    }

    async delete(id: string): Promise<void> {
        const success = await this.repository.delete(id);
        if (success) {
            this._groups.update(list => list.filter(g => g.id !== id));
        }
    }

    async addMember(groupId: string, userId: string): Promise<boolean> {
        const success = await this.repository.addMember(groupId, userId);
        if (success) await this.loadGroups();
        return success;
    }

    async addMemberByEmail(groupId: string, email: string): Promise<boolean> {
        const user = this.userService.users().find(u => u.email === email);
        if (!user) return false;
        return this.addMember(groupId, user.id);
    }

    async removeMember(groupId: string, userId: string): Promise<void> {
        await this.repository.removeMember(groupId, userId);
        await this.loadGroups();
    }

    async updateTicketCount(groupId: string, count: number): Promise<void> {
        await this.update(groupId, { tickets: count });
    }
}
