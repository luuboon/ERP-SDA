import { Observable } from 'rxjs';
import { Ticket, TicketStatus } from '../models/ticket.model';

export abstract class TicketRepository {
    abstract getTickets(): Promise<Ticket[]>;
    abstract getById(id: string): Promise<Ticket | undefined>;
    abstract getByGroup(groupId: string): Promise<Ticket[]>;
    abstract create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): Promise<Ticket>;
    abstract update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, changedBy: string): Promise<Ticket | undefined>;
    abstract delete(id: string): Promise<boolean>;
    abstract addComment(ticketId: string, author: string, content: string): Promise<Ticket | undefined>;
}
