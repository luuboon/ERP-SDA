import { Injectable, signal } from '@angular/core';
import { Group } from '../../core/models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
    private _groups = signal<Group[]>([
        {
            id: crypto.randomUUID(),
            name: 'Alpha Team',
            category: 'Ingeniería',
            level: 'Senior',
            author: 'Admin ERP',
            members: 8,
            tickets: 23,
        },
        {
            id: crypto.randomUUID(),
            name: 'Design Hub',
            category: 'Diseño',
            level: 'Mid',
            author: 'Admin ERP',
            members: 4,
            tickets: 11,
        },
        {
            id: crypto.randomUUID(),
            name: 'Sales Force',
            category: 'Ventas',
            level: 'Junior',
            author: 'Admin ERP',
            members: 12,
            tickets: 37,
        },
    ]);

    readonly groups = this._groups.asReadonly();

    create(data: Omit<Group, 'id'>): void {
        const newGroup: Group = { id: crypto.randomUUID(), ...data };
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
}
