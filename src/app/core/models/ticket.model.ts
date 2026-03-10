export enum TicketStatus {
    Pendiente = 'Pendiente',
    EnProgreso = 'En Progreso',
    Revision = 'Revisión',
    Finalizado = 'Finalizado',
}

export enum TicketPriority {
    Baja = 'Baja',
    Media = 'Media',
    Alta = 'Alta',
    Urgente = 'Urgente',
}

export interface TicketComment {
    id: string;
    author: string;
    content: string;
    date: Date;
}

export interface TicketHistoryEntry {
    id: string;
    field: string;
    oldValue: string;
    newValue: string;
    changedBy: string;
    date: Date;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    assignedTo: string;
    priority: TicketPriority;
    createdAt: Date;
    dueDate: Date;
    comments: TicketComment[];
    history: TicketHistoryEntry[];
    groupId: string;
}
