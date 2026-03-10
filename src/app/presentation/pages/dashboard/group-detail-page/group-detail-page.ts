import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    computed,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { GroupService } from '../../../../application/services/group.service';
import { UserService } from '../../../../application/services/user.service';
import { TicketService } from '../../../../application/services/ticket.service';
import { Group } from '../../../../core/models/group.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-group-detail-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        FormsModule,
        DatePipe,
        ButtonModule,
        CardModule,
        TableModule,
        InputTextModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        TooltipModule,
        SelectModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './group-detail-page.html',
    styleUrl: './group-detail-page.css',
})
export class GroupDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private groupService = inject(GroupService);
    private userService = inject(UserService);
    private ticketService = inject(TicketService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    group = signal<Group | null>(null);
    selectedUserId = signal<string | null>(null);

    readonly members = computed(() => {
        const g = this.group();
        if (!g) return [];
        return g.memberIds
            .map(id => this.userService.getById(id))
            .filter(u => u !== undefined);
    });

    readonly availableUsers = computed(() => {
        const g = this.group();
        if (!g) return [];
        return this.userService.users()
            .filter(u => !g.memberIds.includes(u.id))
            .map(u => ({ label: `${u.name} (${u.email})`, value: u.id }));
    });

    readonly groupTickets = computed(() => {
        const g = this.group();
        if (!g) return [];
        return this.ticketService.ticketsByGroup(g.id);
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.refreshGroup(id);
        }
    }

    private refreshGroup(id: string): void {
        const g = this.groupService.getById(id);
        if (g) {
            this.group.set({ ...g });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard/group']);
    }

    addMember(): void {
        const g = this.group();
        const userId = this.selectedUserId();
        if (!g || !userId) return;

        const success = this.groupService.addMember(g.id, userId);
        if (success) {
            const userName = this.userService.getById(userId)?.name ?? userId;
            this.messageService.add({ severity: 'success', summary: 'Miembro añadido', detail: `"${userName}" fue agregado al grupo` });
            this.selectedUserId.set(null);
            this.refreshGroup(g.id);
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el miembro' });
        }
    }

    confirmRemoveMember(userId: string, userName: string): void {
        const g = this.group();
        if (!g) return;

        this.confirmationService.confirm({
            message: `¿Eliminar a "<strong>${userName}</strong>" del grupo?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.groupService.removeMember(g.id, userId);
                this.messageService.add({ severity: 'warn', summary: 'Miembro eliminado', detail: `"${userName}" fue eliminado del grupo` });
                this.refreshGroup(g.id);
            },
        });
    }

    goToTicket(ticketId: string): void {
        this.router.navigate(['/dashboard/tickets'], { queryParams: { ticket: ticketId } });
    }

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
            'Baja': 'secondary',
            'Media': 'info',
            'Alta': 'warn',
            'Urgente': 'danger',
        };
        return map[priority] ?? 'secondary';
    }

    getUserName(userId: string): string {
        return this.userService.getById(userId)?.name ?? userId;
    }
}
