import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../../../application/services/group.service';
import { AuthService } from '../../../../application/services/auth.service';
import { UserService } from '../../../../application/services/user.service';
import { TicketService } from '../../../../application/services/ticket.service';
import { User } from '../../../../core/models/user.model';
import { PERMISSIONS } from '../../../../core/models/permission.model';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-group-selection-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
    templateUrl: './group-selection-page.html',
    styleUrl: './group-selection-page.css',
})
export class GroupSelectionPage {
    private groupService = inject(GroupService);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private ticketService = inject(TicketService);
    private router = inject(Router);

    readonly userGroups = computed(() => {
        const user = this.authService.currentUser();
        if (!user) return [];

        // Admins can see all groups
        if (this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS)) {
            return this.groupService.groups();
        }

        // Groups where the standard user is a member
        return this.groupService.groups().filter(g => g.memberIds.includes(user.id));
    });

    selectGroup(groupId: string): void {
        // We will navigate to the group's specific dashboard
        this.router.navigate(['/dashboard', groupId]);
    }

    getMembers(memberIds: string[]): User[] {
        return memberIds
            .map(id => this.userService.getById(id))
            .filter((u): u is User => u !== undefined);
    }

    getTicketCount(groupId: string): number {
        return this.ticketService.ticketsByGroup(groupId).length;
    }
}
