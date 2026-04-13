import { Injectable } from '@angular/core';
import { GroupRepository } from '../../../core/repositories/group.repository';
import { Group } from '../../../core/models/group.model';
import { MockDB } from './mock-db';

@Injectable({ providedIn: 'root' })
export class InMemoryGroupRepository implements GroupRepository {
    async getGroups(): Promise<Group[]> {
        return Promise.resolve([...MockDB.groups]);
    }

    async getById(id: string): Promise<Group | undefined> {
        const g = MockDB.groups.find(x => x.id === id);
        return Promise.resolve(g ? { ...g } : undefined);
    }

    async create(data: Omit<Group, 'id' | 'status'>): Promise<Group> {
        const group: Group = {
            id: 'g-' + crypto.randomUUID().slice(0, 8),
            status: 'active',
            ...data,
        };
        MockDB.groups.push(group);
        return Promise.resolve({ ...group });
    }

    async update(id: string, changes: Partial<Omit<Group, 'id'>>): Promise<Group | undefined> {
        const idx = MockDB.groups.findIndex(x => x.id === id);
        if (idx === -1) return Promise.resolve(undefined);

        MockDB.groups[idx] = { ...MockDB.groups[idx], ...changes };
        return Promise.resolve({ ...MockDB.groups[idx] });
    }

    async delete(id: string): Promise<boolean> {
        const initialLen = MockDB.groups.length;
        MockDB.groups = MockDB.groups.filter(x => x.id !== id);
        return Promise.resolve(MockDB.groups.length !== initialLen);
    }

    async addMember(groupId: string, userId: string): Promise<boolean> {
        const group = MockDB.groups.find(g => g.id === groupId);
        if (!group || group.memberIds.includes(userId)) return false;
        group.memberIds.push(userId);
        return true;
    }

    async removeMember(groupId: string, userId: string): Promise<void> {
        const group = MockDB.groups.find(g => g.id === groupId);
        if (!group) return;
        group.memberIds = group.memberIds.filter(id => id !== userId);
    }
}
