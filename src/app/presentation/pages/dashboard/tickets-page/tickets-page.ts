import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    computed,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../../../application/services/ticket.service';
import { GroupService } from '../../../../application/services/group.service';
import { UserService } from '../../../../application/services/user.service';
import { AuthService } from '../../../../application/services/auth.service';
import { Ticket, TicketStatus, TicketPriority } from '../../../../core/models/ticket.model';
import { PERMISSIONS } from '../../../../core/models/permission.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TimelineModule } from 'primeng/timeline';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
    selector: 'app-tickets-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        DatePipe,
        ButtonModule,
        CardModule,
        TableModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        DatePickerModule,
        IftaLabelModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        TooltipModule,
        ToggleButtonModule,
        TimelineModule,
        DragDropModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './tickets-page.html',
    styleUrl: './tickets-page.css',
})
export class TicketsPage implements OnInit {
    private ticketService = inject(TicketService);
    private groupService = inject(GroupService);
    private userService = inject(UserService);
    private messageService = inject(MessageService);
    private authService = inject(AuthService);
    private confirmationService = inject(ConfirmationService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    groupId = signal<string>('');

    readonly isSuperAdmin = computed(() =>
        this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS)
    );

    readonly tickets = computed(() => {
        if (this.isSuperAdmin()) {
            return this.ticketService.tickets();
        }
        const gId = this.groupId();
        const user = this.authService.currentUser();
        const groupTickets = this.ticketService.ticketsByGroup(gId);
        if (!user) return groupTickets;
        // Include tickets from other groups that are assigned to this user
        const assignedFromOtherGroups = this.ticketService.tickets()
            .filter(t => t.assignedTo === user.id && t.groupId !== gId);
        return [...groupTickets, ...assignedFromOtherGroups];
    });

    readonly groups = this.groupService.groups;
    readonly users = this.userService.users;

    readonly statuses = Object.values(TicketStatus);
    readonly priorities = Object.values(TicketPriority);
    readonly kanbanColumns = [TicketStatus.Pendiente, TicketStatus.EnProgreso, TicketStatus.Revision, TicketStatus.Finalizado];

    isListView = signal(false);
    statusFilter = signal<string | null>(null);

    // Dialogs
    createDialogVisible = signal(false);
    detailDialogVisible = signal(false);
    editingId = signal<string | null>(null);
    selectedTicket = signal<Ticket | null>(null);

    // Comment
    newComment = signal('');

    // Drag & drop
    draggedTicket = signal<Ticket | null>(null);

    // Groups / Users as select options
    readonly groupOptions = computed(() =>
        this.groups().map(g => ({ label: g.name, value: g.id }))
    );
    readonly userOptions = computed(() =>
        this.users().map(u => ({ label: u.name, value: u.id }))
    );

    ticketForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', Validators.required],
        priority: [TicketPriority.Media as string, Validators.required],
        assignedTo: [''],
        dueDate: [null as Date | null, Validators.required],
        groupId: ['', Validators.required],
        status: [TicketStatus.Pendiente as string],
    });

    ngOnInit(): void {
        this.ticketForm.get('assignedTo')?.valueChanges.subscribe(userId => {
            if (userId) {
                const userGroups = this.groups().filter(g => g.memberIds.includes(userId));
                if (userGroups.length > 0) {
                    const currentGroupId = this.ticketForm.get('groupId')?.value;
                    const isUserInCurrentGroup = userGroups.some(g => g.id === currentGroupId);
                    if (!this.editingId() || !isUserInCurrentGroup) {
                        this.ticketForm.get('groupId')?.setValue(userGroups[0].id);
                    }
                }
            }
        });
        this.route.parent?.paramMap.subscribe(params => {
            const id = params.get('groupId');
            if (id) {
                this.groupId.set(id);
            }
        });
        const statusParam = this.route.snapshot.queryParamMap.get('status');
        if (statusParam && this.statuses.includes(statusParam as TicketStatus)) {
            this.statusFilter.set(statusParam);
            this.isListView.set(true);
        }
    }

    quickFilter = signal<string | null>(null);

    readonly filteredTickets = computed(() => {
        let base = this.tickets();

        // Quick Filters
        const qf = this.quickFilter();
        if (qf === 'mis-tickets') {
            const user = this.authService?.currentUser(); // Note: authService injected below
            if (user) base = base.filter(t => t.assignedTo === user.id);
        } else if (qf === 'sin-asignar') {
            base = base.filter(t => !t.assignedTo);
        } else if (qf === 'prioridad-alta') {
            base = base.filter(t => t.priority === TicketPriority.Alta || t.priority === TicketPriority.Urgente);
        }

        // Status Filter
        const filter = this.statusFilter();
        if (filter) base = base.filter(t => t.status === filter);

        return base;
    });

    ticketsByColumn(status: TicketStatus): Ticket[] {
        return this.filteredTickets().filter(t => t.status === status);
    }

    getUserName(userId: string): string {
        return this.userService.getById(userId)?.name ?? userId;
    }

    getGroupName(groupId: string): string {
        return this.groupService.getById(groupId)?.name ?? groupId;
    }

    // Create / Edit
    openCreate(): void {
        this.editingId.set(null);
        this.ticketForm.enable();
        this.ticketForm.reset({ priority: TicketPriority.Media, status: TicketStatus.Pendiente, groupId: this.groupId() });
        this.createDialogVisible.set(true);
    }

    openEdit(ticket: Ticket): void {
        this.editingId.set(ticket.id);
        const user = this.authService.currentUser();
        const isCreator = ticket.createdBy === user?.id;
        const isAssigned = ticket.assignedTo === user?.id;
        const isSuperAdmin = user && this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS);

        if (isCreator || isSuperAdmin) {
            this.ticketForm.enable();
        } else if (isAssigned) {
            this.ticketForm.disable();
            this.ticketForm.controls.status.enable();
        } else {
            this.ticketForm.disable();
        }

        this.ticketForm.patchValue({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            assignedTo: ticket.assignedTo,
            dueDate: ticket.dueDate,
            groupId: ticket.groupId,
            status: ticket.status,
        });
        this.createDialogVisible.set(true);
    }

    saveTicket(): void {
        if (this.ticketForm.invalid) return;
        const val = this.ticketForm.getRawValue(); // gets values even if disabled
        const id = this.editingId();
        const user = this.authService.currentUser();
        const userName = user?.name || 'Unknown';

        if (id) {
            this.ticketService.update(id, {
                title: val.title!,
                description: val.description!,
                priority: val.priority! as TicketPriority,
                assignedTo: val.assignedTo || '',
                dueDate: val.dueDate!,
                groupId: val.groupId!,
                status: val.status! as TicketStatus,
            }, userName);
            this.messageService.add({ severity: 'success', summary: 'Ticket actualizado', detail: `"${val.title}" actualizado` });
        } else {
            this.ticketService.create({
                title: val.title!,
                description: val.description!,
                priority: val.priority! as TicketPriority,
                assignedTo: val.assignedTo || '',
                createdBy: user?.id ?? '',
                dueDate: val.dueDate!,
                groupId: val.groupId!,
                status: TicketStatus.Pendiente,
            });
            this.messageService.add({ severity: 'success', summary: 'Ticket creado', detail: `"${val.title}" creado exitosamente` });
        }
        this.createDialogVisible.set(false);
        this.refreshDetail();
    }

    canEditCurrentTicket(ticket: Ticket): boolean {
        const u = this.authService.currentUser();
        if (!u) return false;
        return ticket.createdBy === u.id || ticket.assignedTo === u.id || this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS);
    }

    canDeleteCurrentTicket(ticket: Ticket): boolean {
        const u = this.authService.currentUser();
        if (!u) return false;
        return ticket.createdBy === u.id || this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS);
    }

    confirmDelete(ticket: Ticket): void {
        this.confirmationService.confirm({
            message: `¿Eliminar el ticket "<strong>${ticket.title}</strong>"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.ticketService.delete(ticket.id);
                this.detailDialogVisible.set(false);
                this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: `"${ticket.title}" fue eliminado` });
            },
        });
    }

    // Detail
    openDetail(ticket: Ticket): void {
        this.selectedTicket.set(ticket);
        this.newComment.set('');
        this.detailDialogVisible.set(true);
    }

    refreshDetail(): void {
        const current = this.selectedTicket();
        if (current) {
            const updated = this.ticketService.getById(current.id);
            if (updated) this.selectedTicket.set({ ...updated });
        }
    }

    addComment(): void {
        const ticket = this.selectedTicket();
        const comment = this.newComment().trim();
        const userName = this.authService.currentUser()?.name || 'Unknown';
        if (!ticket || !comment) return;
        this.ticketService.addComment(ticket.id, userName, comment);
        this.newComment.set('');
        this.refreshDetail();
    }

    // Drag & drop
    onDragStart(ticket: Ticket): void {
        this.draggedTicket.set(ticket);
    }

    onDragEnd(): void {
        this.draggedTicket.set(null);
    }

    onDrop(status: TicketStatus): void {
        const ticket = this.draggedTicket();
        if (!ticket) return;

        const u = this.authService.currentUser();
        const canEdit = u && (ticket.createdBy === u.id || ticket.assignedTo === u.id || this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS));

        if (!canEdit) {
            this.messageService.add({ severity: 'error', summary: 'Permiso denegado', detail: 'Solo el creador o asignado puede mover este ticket' });
            this.draggedTicket.set(null);
            return;
        }

        if (ticket.status !== status) {
            const userName = u?.name || 'Unknown';
            this.ticketService.updateStatus(ticket.id, status, userName);
            this.messageService.add({
                severity: 'info',
                summary: 'Estado cambiado',
                detail: `"${ticket.title}" → ${status}`,
            });
        }
        this.draggedTicket.set(null);
    }

    // UI helpers
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

    columnColor(status: TicketStatus): string {
        const map: Record<string, string> = {
            'Pendiente': '#f59e0b',
            'En Progreso': '#3b82f6',
            'Revisión': '#8b5cf6',
            'Finalizado': '#10b981',
        };
        return map[status] ?? '#94a3b8';
    }

    clearFilter(): void {
        this.statusFilter.set(null);
    }

    hasPermission(permission: string): boolean {
        return this.authService.hasPermission(permission);
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard', this.groupId()]);
    }
}
