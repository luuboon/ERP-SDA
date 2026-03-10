import { Injectable, signal, computed, inject } from '@angular/core';
import { Group } from '../../core/models/group.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class GroupService {
    private userService = inject(UserService);

    private _groups = signal<Group[]>([
        {
            id: 'g-alpha',
            name: 'Alpha Team',
            category: 'Ingeniería',
            level: 'Senior',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
        },
        {
            id: 'g-design',
            name: 'Design Hub',
            category: 'Diseño',
            level: 'Mid',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
        },
        {
            id: 'g-sales',
            name: 'Sales Force',
            category: 'Ventas',
            level: 'Junior',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
        },
    ]);

    readonly groups = this._groups.asReadonly();

    getById(id: string): Group | undefined {
        return this._groups().find(g => g.id === id);
    }

    create(data: Omit<Group, 'id'>): void {
        const newGroup: Group = { id: 'g-' + crypto.randomUUID().slice(0, 8), ...data };
        this._groups.update(list => [...list, newGroup]);
    }

    update(id: string, changes: Partial<Omit<Group, 'id'>>): void {
        this._groups.update(list =>
            list.map(g => (g.id === id ? { ...g, ...changes } : g))
        );
    }

    delete(id: string): void {
        this._groups.update(list => list.filter(g => g.id !== id));
    }

    addMember(groupId: string, userId: string): boolean {
        const group = this.getById(groupId);
        if (!group || group.memberIds.includes(userId)) return false;
        this.update(groupId, { memberIds: [...group.memberIds, userId] });
        return true;
    }

    addMemberByEmail(groupId: string, email: string): boolean {
        const user = this.userService.users().find(u => u.email === email);
        if (!user) return false;
        return this.addMember(groupId, user.id);
    }

    removeMember(groupId: string, userId: string): void {
        const group = this.getById(groupId);
        if (!group) return;
        this.update(groupId, { memberIds: group.memberIds.filter(id => id !== userId) });
    }

    updateTicketCount(groupId: string, count: number): void {
        this.update(groupId, { tickets: count });
    }
}
