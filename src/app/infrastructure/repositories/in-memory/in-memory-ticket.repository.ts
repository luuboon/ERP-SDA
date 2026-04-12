import { Injectable } from '@angular/core';
import { TicketRepository } from '../../../core/repositories/ticket.repository';
import { Ticket, TicketHistoryEntry, TicketComment } from '../../../core/models/ticket.model';
import { MockDB } from './mock-db';

@Injectable({ providedIn: 'root' })
export class InMemoryTicketRepository implements TicketRepository {
    async getTickets(): Promise<Ticket[]> {
        return Promise.resolve([...MockDB.tickets]);
    }

    async getById(id: string): Promise<Ticket | undefined> {
        const t = MockDB.tickets.find(x => x.id === id);
        return Promise.resolve(t ? { ...t } : undefined);
    }

    async getByGroup(groupId: string): Promise<Ticket[]> {
        return Promise.resolve(MockDB.tickets.filter(x => x.groupId === groupId));
    }

    async create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): Promise<Ticket> {
        const ticket: Ticket = {
            id: 't-' + crypto.randomUUID().slice(0, 8),
            createdAt: new Date(),
            comments: [],
            history: [],
            ...data,
        };
        MockDB.tickets.push(ticket);
        return Promise.resolve({ ...ticket });
    }

    async update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, changedBy: string): Promise<Ticket | undefined> {
        const idx = MockDB.tickets.findIndex(x => x.id === id);
        if (idx === -1) return Promise.resolve(undefined);

        const t = MockDB.tickets[idx];
        const historyEntries: TicketHistoryEntry[] = [];
        const keys = Object.keys(changes) as (keyof typeof changes)[];
        
        for (const key of keys) {
            const oldVal = String(t[key] ?? '');
            const newVal = String(changes[key] ?? '');
            if (oldVal !== newVal) {
                historyEntries.push({
                    id: 'h-' + crypto.randomUUID().slice(0, 8),
                    field: key,
                    oldValue: oldVal,
                    newValue: newVal,
                    changedBy,
                    date: new Date(),
                });
            }
        }

        MockDB.tickets[idx] = { 
            ...t, 
            ...changes, 
            history: [...t.history, ...historyEntries] 
        };
        return Promise.resolve({ ...MockDB.tickets[idx] });
    }

    async delete(id: string): Promise<boolean> {
        const initialLen = MockDB.tickets.length;
        MockDB.tickets = MockDB.tickets.filter(x => x.id !== id);
        return Promise.resolve(MockDB.tickets.length !== initialLen);
    }

    async addComment(ticketId: string, author: string, content: string): Promise<Ticket | undefined> {
        const idx = MockDB.tickets.findIndex(x => x.id === ticketId);
        if (idx === -1) return Promise.resolve(undefined);

        const comment: TicketComment = {
            id: 'c-' + crypto.randomUUID().slice(0, 8),
            author,
            content,
            date: new Date(),
        };

        const t = MockDB.tickets[idx];
        MockDB.tickets[idx] = { ...t, comments: [...t.comments, comment] };
        return Promise.resolve({ ...MockDB.tickets[idx] });
    }
}
