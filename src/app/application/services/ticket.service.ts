import { Injectable, signal, computed, inject } from '@angular/core';
import { Ticket, TicketStatus, TicketPriority } from '../../core/models/ticket.model';
import { TicketRepository } from '../../core/repositories/ticket.repository';

@Injectable({ providedIn: 'root' })
export class TicketService {
    private repository = inject(TicketRepository);
    private _tickets = signal<Ticket[]>([]);

    readonly tickets = this._tickets.asReadonly();

    readonly statusCounts = computed(() => {
        const list = this._tickets();
        return {
            [TicketStatus.Pendiente]: list.filter(t => t.status === TicketStatus.Pendiente).length,
            [TicketStatus.EnProgreso]: list.filter(t => t.status === TicketStatus.EnProgreso).length,
            [TicketStatus.Revision]: list.filter(t => t.status === TicketStatus.Revision).length,
            [TicketStatus.Finalizado]: list.filter(t => t.status === TicketStatus.Finalizado).length,
        };
    });

    constructor() {
        this.loadTickets();
    }

    async loadTickets(): Promise<void> {
        const items = await this.repository.getTickets();
        this._tickets.set(items);
    }

    getById(id: string): Ticket | undefined {
        return this._tickets().find(t => t.id === id);
    }

    ticketsByGroup(groupId: string): Ticket[] {
        return this._tickets().filter(t => t.groupId === groupId);
    }

    ticketsByStatus(status: TicketStatus): Ticket[] {
        return this._tickets().filter(t => t.status === status);
    }

    ticketsByAssignee(userId: string): Ticket[] {
        return this._tickets().filter(t => t.assignedTo === userId);
    }

    async create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): Promise<void> {
        const ticket = await this.repository.create(data);
        this._tickets.update(list => [...list, ticket]);
    }

    async update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, changedBy: string): Promise<void> {
        const updated = await this.repository.update(id, changes, changedBy);
        if (updated) {
            this._tickets.update(list => list.map(t => t.id === id ? updated : t));
        }
    }

    async updateStatus(id: string, status: TicketStatus, changedBy: string): Promise<void> {
        await this.update(id, { status }, changedBy);
    }

    async delete(id: string): Promise<void> {
        const success = await this.repository.delete(id);
        if (success) {
            this._tickets.update(list => list.filter(t => t.id !== id));
        }
    }

    async addComment(ticketId: string, author: string, content: string): Promise<void> {
        const updated = await this.repository.addComment(ticketId, author, content);
        if (updated) {
            this._tickets.update(list => list.map(t => t.id === ticketId ? updated : t));
        }
    }

    async reloadById(id: string): Promise<Ticket | undefined> {
        const updated = await this.repository.getById(id);
        if (updated) {
            this._tickets.update(list => list.map(t => t.id === id ? updated : t));
        }
        return updated;
    }
}
