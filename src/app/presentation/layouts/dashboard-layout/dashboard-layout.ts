import { ChangeDetectionStrategy, Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';
import { PERMISSIONS } from '../../../core/models/permission.model';
import { GroupService } from '../../../application/services/group.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);

  readonly currentUser = this.authService.currentUser;

  groupId = signal<string>('');

  readonly currentGroup = computed(() => {
    const id = this.groupId();
    return this.groupService.getById(id);
  });

  readonly navItems = computed(() => {
    const id = this.groupId();
    if (!id) return [];

    const all: NavItem[] = [
      { label: 'Dashboard', icon: 'pi pi-chart-bar', route: `/dashboard/${id}`, exact: true },
      { label: 'Tickets', icon: 'pi pi-ticket', route: `/dashboard/${id}/tickets`, permission: PERMISSIONS.TICKET_VIEW },
      { label: 'Groups', icon: 'pi pi-users', route: `/dashboard/${id}/group`, permission: PERMISSIONS.GROUP_ADD },
      { label: 'Users', icon: 'pi pi-user', route: `/dashboard/${id}/user`, permission: PERMISSIONS.USER_VIEW },
    ];
    return all.filter(item => !item.permission || this.authService.hasPermission(item.permission));
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('groupId');
      if (id) {
        this.groupId.set(id);
        this.verifyAccess(id);
      }
    });

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
    }
  }

  private verifyAccess(groupId: string): void {
    const group = this.groupService.getById(groupId);
    const user = this.currentUser();
    
    if (!user || !group) {
        this.router.navigate(['/group-selection']);
        return;
    }

    const isMember = group.memberIds.includes(user.id);
    const isSuperAdmin = this.authService.hasPermission(PERMISSIONS.USER_MANAGE_PERMISSIONS);
    const isAuthor = group.author === user.name;

    if (!isMember && !isSuperAdmin && !isAuthor) {
        this.router.navigate(['/group-selection']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
