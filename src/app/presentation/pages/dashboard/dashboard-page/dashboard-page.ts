import {
    ChangeDetectionStrategy,
    Component,
    inject,
    computed,
    signal,
    OnInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../../../application/services/ticket.service';
import { GroupService } from '../../../../application/services/group.service';
import { UserService } from '../../../../application/services/user.service';
import { TicketStatus, TicketPriority, Ticket } from '../../../../core/models/ticket.model';
import { DashboardLayout } from '../../../../presentation/layouts/dashboard-layout/dashboard-layout'; // Unused? Just testing. Actually we don't need layout.
import { PermissionService } from '../../../../application/services/permission.service';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-dashboard-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DatePipe, CardModule, ButtonModule, TableModule, TagModule, TooltipModule, HasPermissionDirective],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
    private ticketService = inject(TicketService);
    private groupService = inject(GroupService);
    private userService = inject(UserService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private permissionService = inject(PermissionService);

    groupId = signal<string>('');

    ngOnInit() {
        this.route.parent?.paramMap.subscribe(params => {
            const id = params.get('groupId');
            if (id) {
                this.groupId.set(id);
            }
        });
    }

    readonly currentGroup = computed(() => {
        return this.groupService.getById(this.groupId());
    });

    readonly groupTickets = computed(() => {
        return this.ticketService.ticketsByGroup(this.groupId());
    });

    readonly totalTickets = computed(() => this.groupTickets().length);

    readonly completionRate = computed(() => {
        const total = this.totalTickets();
        if (total === 0) return 0;
        const done = this.groupTickets().filter(t => t.status === TicketStatus.Finalizado).length;
        return Math.round((done / total) * 100);
    });

    readonly overdueCount = computed(() => {
        const now = new Date();
        return this.groupTickets().filter(
            t => t.status !== TicketStatus.Finalizado && t.dueDate < now
        ).length;
    });

    readonly statusItems = computed(() => {
        const tickets = this.groupTickets();
        const total = tickets.length;
        const pending = tickets.filter(t => t.status === TicketStatus.Pendiente).length;
        const inProgress = tickets.filter(t => t.status === TicketStatus.EnProgreso).length;
        const review = tickets.filter(t => t.status === TicketStatus.Revision).length;
        const done = tickets.filter(t => t.status === TicketStatus.Finalizado).length;

        return [
            { label: 'Pendiente', count: pending, icon: 'pi-clock', color: '#f59e0b', bg: '#fef3c7', status: TicketStatus.Pendiente, pct: total ? Math.round((pending / total) * 100) : 0 },
            { label: 'En Progreso', count: inProgress, icon: 'pi-sync', color: '#3b82f6', bg: '#dbeafe', status: TicketStatus.EnProgreso, pct: total ? Math.round((inProgress / total) * 100) : 0 },
            { label: 'Revisión', count: review, icon: 'pi-eye', color: '#8b5cf6', bg: '#ede9fe', status: TicketStatus.Revision, pct: total ? Math.round((review / total) * 100) : 0 },
            { label: 'Finalizado', count: done, icon: 'pi-check-circle', color: '#10b981', bg: '#d1fae5', status: TicketStatus.Finalizado, pct: total ? Math.round((done / total) * 100) : 0 },
        ];
    });

    readonly recentTickets = computed(() => {
        return [...this.groupTickets()]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    });

    getUserName(userId: string): string {
        return this.userService.getById(userId)?.name ?? userId;
    }

    goToTickets(status?: TicketStatus): void {
        const id = this.groupId();
        if (status) {
            this.router.navigate(['/dashboard', id, 'tickets'], { queryParams: { status } });
        } else {
            this.router.navigate(['/dashboard', id, 'tickets']);
        }
    }

    goToGroup(groupId: string): void {
        this.router.navigate(['/dashboard', this.groupId(), 'group', groupId]);
    }

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'Pendiente': 'warn', 'En Progreso': 'info', 'Revisión': 'secondary', 'Finalizado': 'success',
        };
        return map[status] ?? 'secondary';
    }

    prioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'Muy Baja': 'secondary',
            'Baja': 'secondary',
            'Media Baja': 'info',
            'Media': 'info',
            'Media Alta': 'warn',
            'Alta': 'warn',
            'Urgente': 'danger',
        };
        return map[priority] ?? 'secondary';
    }
}
