import { Injectable, signal, computed } from '@angular/core';
import {
    Ticket,
    TicketStatus,
    TicketPriority,
    TicketComment,
    TicketHistoryEntry,
} from '../../core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
    private _tickets = signal<Ticket[]>([
        {
            id: 't-001',
            title: 'Configurar entorno de desarrollo',
            description: 'Instalar todas las dependencias y configurar el entorno local para el equipo.',
            status: TicketStatus.Finalizado,
            assignedTo: 'u-carlos',
            createdBy: 'u-superadmin',
            priority: TicketPriority.Alta,
            createdAt: new Date('2026-02-15'),
            dueDate: new Date('2026-02-28'),
            comments: [
                { id: 'c1', author: 'Super Admin', content: 'Ya está listo el repo base.', date: new Date('2026-02-16') },
            ],
            history: [
                { id: 'h1', field: 'status', oldValue: 'Pendiente', newValue: 'En Progreso', changedBy: 'Carlos Méndez', date: new Date('2026-02-17') },
                { id: 'h2', field: 'status', oldValue: 'En Progreso', newValue: 'Finalizado', changedBy: 'Carlos Méndez', date: new Date('2026-02-25') },
            ],
            groupId: 'g-alpha',
        },
        {
            id: 't-002',
            title: 'Diseñar wireframes del dashboard',
            description: 'Crear wireframes de baja fidelidad para la vista principal del ERP.',
            status: TicketStatus.EnProgreso,
            assignedTo: 'u-ana',
            createdBy: 'u-ana',
            priority: TicketPriority.Media,
            createdAt: new Date('2026-02-20'),
            dueDate: new Date('2026-03-15'),
            comments: [],
            history: [
                { id: 'h3', field: 'status', oldValue: 'Pendiente', newValue: 'En Progreso', changedBy: 'Ana García', date: new Date('2026-02-22') },
            ],
            groupId: 'g-design',
        },
        {
            id: 't-003',
            title: 'Implementar módulo de autenticación',
            description: 'Login, registro y recuperación de contraseña con JWT.',
            status: TicketStatus.Revision,
            assignedTo: 'u-superadmin',
            createdBy: 'u-superadmin',
            priority: TicketPriority.Urgente,
            createdAt: new Date('2026-02-18'),
            dueDate: new Date('2026-03-10'),
            comments: [
                { id: 'c2', author: 'Ana García', content: 'Revisar la validación del token.', date: new Date('2026-03-05') },
            ],
            history: [
                { id: 'h4', field: 'status', oldValue: 'Pendiente', newValue: 'En Progreso', changedBy: 'Super Admin', date: new Date('2026-02-20') },
                { id: 'h5', field: 'status', oldValue: 'En Progreso', newValue: 'Revisión', changedBy: 'Super Admin', date: new Date('2026-03-04') },
            ],
            groupId: 'g-alpha',
        },
        {
            id: 't-004',
            title: 'Preparar presentación de ventas Q1',
            description: 'Slides con métricas del primer trimestre para el board meeting.',
            status: TicketStatus.Pendiente,
            assignedTo: 'u-laura',
            createdBy: 'u-laura',
            priority: TicketPriority.Baja,
            createdAt: new Date('2026-03-01'),
            dueDate: new Date('2026-03-20'),
            comments: [],
            history: [],
            groupId: 'g-sales',
        },
        {
            id: 't-005',
            title: 'Corregir bug en formulario de contacto',
            description: 'El campo email no valida correctamente los dominios con TLD largo.',
            status: TicketStatus.Pendiente,
            assignedTo: 'u-carlos',
            createdBy: 'u-superadmin',
            priority: TicketPriority.Alta,
            createdAt: new Date('2026-03-05'),
            dueDate: new Date('2026-03-12'),
            comments: [],
            history: [],
            groupId: 'g-alpha',
        },
        {
            id: 't-006',
            title: 'Actualizar guía de estilos',
            description: 'Documentar la paleta de colores y tipografía actualizada del sistema.',
            status: TicketStatus.EnProgreso,
            assignedTo: 'u-ana',
            createdBy: 'u-superadmin',
            priority: TicketPriority.Media,
            createdAt: new Date('2026-03-02'),
            dueDate: new Date('2026-03-18'),
            comments: [
                { id: 'c3', author: 'Super Admin', content: 'Incluir los nuevos tokens del tema Lara.', date: new Date('2026-03-03') },
            ],
            history: [
                { id: 'h6', field: 'status', oldValue: 'Pendiente', newValue: 'En Progreso', changedBy: 'Ana García', date: new Date('2026-03-04') },
            ],
            groupId: 'g-design',
        },
    ]);

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

    create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): void {
        const ticket: Ticket = {
            id: 't-' + crypto.randomUUID().slice(0, 8),
            createdAt: new Date(),
            comments: [],
            history: [],
            ...data,
        };
        this._tickets.update(list => [...list, ticket]);
    }

    update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, changedBy: string): void {
        this._tickets.update(list =>
            list.map(t => {
                if (t.id !== id) return t;

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

                return { ...t, ...changes, history: [...t.history, ...historyEntries] };
            })
        );
    }

    updateStatus(id: string, status: TicketStatus, changedBy: string): void {
        this.update(id, { status }, changedBy);
    }

    delete(id: string): void {
        this._tickets.update(list => list.filter(t => t.id !== id));
    }

    addComment(ticketId: string, author: string, content: string): void {
        const comment: TicketComment = {
            id: 'c-' + crypto.randomUUID().slice(0, 8),
            author,
            content,
            date: new Date(),
        };
        this._tickets.update(list =>
            list.map(t => (t.id === ticketId ? { ...t, comments: [...t.comments, comment] } : t))
        );
    }
}
