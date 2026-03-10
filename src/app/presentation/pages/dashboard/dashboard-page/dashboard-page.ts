import {
    ChangeDetectionStrategy,
    Component,
    inject,
    computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../../../application/services/ticket.service';
import { GroupService } from '../../../../application/services/group.service';
import { UserService } from '../../../../application/services/user.service';
import { TicketStatus, TicketPriority } from '../../../../core/models/ticket.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-dashboard-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe, CardModule, ButtonModule, TableModule, TagModule, TooltipModule],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.css',
})
export class DashboardPage {
    private ticketService = inject(TicketService);
    private groupService = inject(GroupService);
    private userService = inject(UserService);
    private router = inject(Router);

    readonly totalTickets = computed(() => this.ticketService.tickets().length);

    readonly statusCounts = this.ticketService.statusCounts;

    readonly completionRate = computed(() => {
        const total = this.totalTickets();
        if (total === 0) return 0;
        const done = this.statusCounts()[TicketStatus.Finalizado];
        return Math.round((done / total) * 100);
    });

    readonly overdueCount = computed(() => {
        const now = new Date();
        return this.ticketService.tickets().filter(
            t => t.status !== TicketStatus.Finalizado && t.dueDate < now
        ).length;
    });

    readonly statusItems = computed(() => {
        const counts = this.statusCounts();
        const total = this.totalTickets();
        return [
            { label: 'Pendiente', count: counts[TicketStatus.Pendiente], icon: 'pi-clock', color: '#f59e0b', bg: '#fef3c7', status: TicketStatus.Pendiente, pct: total ? Math.round((counts[TicketStatus.Pendiente] / total) * 100) : 0 },
            { label: 'En Progreso', count: counts[TicketStatus.EnProgreso], icon: 'pi-sync', color: '#3b82f6', bg: '#dbeafe', status: TicketStatus.EnProgreso, pct: total ? Math.round((counts[TicketStatus.EnProgreso] / total) * 100) : 0 },
            { label: 'Revisión', count: counts[TicketStatus.Revision], icon: 'pi-eye', color: '#8b5cf6', bg: '#ede9fe', status: TicketStatus.Revision, pct: total ? Math.round((counts[TicketStatus.Revision] / total) * 100) : 0 },
            { label: 'Finalizado', count: counts[TicketStatus.Finalizado], icon: 'pi-check-circle', color: '#10b981', bg: '#d1fae5', status: TicketStatus.Finalizado, pct: total ? Math.round((counts[TicketStatus.Finalizado] / total) * 100) : 0 },
        ];
    });

    readonly recentTickets = computed(() => {
        return [...this.ticketService.tickets()]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    });

    readonly groupSummary = computed(() => {
        return this.groupService.groups().map(g => ({
            ...g,
            ticketCount: this.ticketService.ticketsByGroup(g.id).length,
        }));
    });

    getUserName(userId: string): string {
        return this.userService.getById(userId)?.name ?? userId;
    }

    goToTickets(status?: TicketStatus): void {
        if (status) {
            this.router.navigate(['/dashboard/tickets'], { queryParams: { status } });
        } else {
            this.router.navigate(['/dashboard/tickets']);
        }
    }

    goToGroup(groupId: string): void {
        this.router.navigate(['/dashboard/group', groupId]);
    }

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'Pendiente': 'warn', 'En Progreso': 'info', 'Revisión': 'secondary', 'Finalizado': 'success',
        };
        return map[status] ?? 'secondary';
    }

    prioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'Baja': 'secondary', 'Media': 'info', 'Alta': 'warn', 'Urgente': 'danger',
        };
        return map[priority] ?? 'secondary';
    }
}
