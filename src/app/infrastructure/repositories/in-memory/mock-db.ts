import { User } from '../../../core/models/user.model';
import { ALL_PERMISSIONS, PERMISSIONS } from '../../../core/models/permission.model';
import { Ticket, TicketStatus, TicketPriority } from '../../../core/models/ticket.model';
import { Group } from '../../../core/models/group.model';

export type UserDb = User & { password?: string };

export const MockDB = {
    users: [
        {
            id: 'u-superadmin',
            name: 'Super Admin',
            email: 'admin@erp.com',
            password: 'admin123',
            globalPermissions: [...ALL_PERMISSIONS],
            permissionsByGroup: {
              'g-alpha':  [...ALL_PERMISSIONS],
              'g-design': [...ALL_PERMISSIONS],
              'g-sales':  [...ALL_PERMISSIONS],
            },
        },
        {
            id: 'u-carlos',
            name: 'Carlos Méndez',
            email: 'carlos@erp.com',
            password: 'carlos123',
            globalPermissions: [],
            permissionsByGroup: {
              'g-alpha': [PERMISSIONS.TICKETS_VIEW, PERMISSIONS.TICKETS_MOVE],
              'g-sales': [PERMISSIONS.TICKETS_VIEW],
            },
        },
        {
            id: 'u-ana',
            name: 'Ana García',
            email: 'ana@erp.com',
            password: 'ana123',
            globalPermissions: [],
            permissionsByGroup: {
              'g-design': [PERMISSIONS.TICKETS_ADD, PERMISSIONS.TICKETS_VIEW, PERMISSIONS.TICKETS_MOVE, PERMISSIONS.GROUPS_MANAGE],
              'g-alpha':  [PERMISSIONS.TICKETS_VIEW],
            },
        },
        {
            id: 'u-laura',
            name: 'Laura Torres',
            email: 'laura@erp.com',
            password: 'laura123',
            globalPermissions: [],
            permissionsByGroup: {
              'g-sales': [PERMISSIONS.TICKETS_VIEW, PERMISSIONS.TICKETS_ADD, PERMISSIONS.TICKETS_MOVE],
              'g-alpha': [PERMISSIONS.TICKETS_VIEW],
            },
        },
        {
            id: 'u-miguel',
            name: 'Miguel Ríos',
            email: 'miguel@erp.com',
            password: 'miguel123',
            globalPermissions: [],
            permissionsByGroup: {
              'g-alpha': [PERMISSIONS.TICKETS_VIEW],
            },
        },
    ] as UserDb[],
    
    tickets: [
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
    ] as Ticket[],

    groups: [
        {
            id: 'g-alpha',
            name: 'Alpha Team',
            category: 'Ingeniería',
            level: 'Senior',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
            status: 'active',
        },
        {
            id: 'g-design',
            name: 'Design Hub',
            category: 'Diseño',
            level: 'Mid',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
            status: 'active',
        },
        {
            id: 'g-sales',
            name: 'Sales Force',
            category: 'Ventas',
            level: 'Junior',
            author: 'Admin ERP',
            memberIds: [],
            tickets: 0,
            status: 'active',
        },
    ] as Group[]
};

export function cleanUser(dbUser: UserDb): User {
    const { password, ...clean } = dbUser;
    return clean;
}
