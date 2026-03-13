import { ChangeDetectionStrategy, Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../application/services/auth.service';
import { TicketService } from '../../../../application/services/ticket.service';
import { TicketStatus } from '../../../../core/models/ticket.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-user-profile-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, CardModule, TableModule, TagModule],
    templateUrl: './user-profile-page.html',
    styleUrl: './user-profile-page.css',
})
export class UserProfilePage implements OnInit {
    private authService = inject(AuthService);
    private ticketService = inject(TicketService);
    private route = inject(ActivatedRoute);

    readonly currentUser = this.authService.currentUser;
    groupId = signal<string>('');

    ngOnInit(): void {
        this.route.parent?.paramMap.subscribe(params => {
            const id = params.get('groupId');
            if (id) {
                this.groupId.set(id);
            }
        });
    }

    readonly userTickets = computed(() => {
        const user = this.currentUser();
        const id = this.groupId();
        if (!user || !id) return [];
        return this.ticketService.ticketsByGroup(id).filter(t => t.assignedTo === user.id);
    });

    readonly ticketStats = computed(() => {
        const tickets = this.userTickets();
        const pending = tickets.filter(t => t.status === TicketStatus.Pendiente).length;
        const progress = tickets.filter(t => t.status === TicketStatus.EnProgreso).length;
        const done = tickets.filter(t => t.status === TicketStatus.Finalizado).length;
        return { pending, progress, done, total: tickets.length };
    });

    statusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            'Pendiente': 'warn',
            'En Progreso': 'info',
            'Revisión': 'secondary',
            'Finalizado': 'success',
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
