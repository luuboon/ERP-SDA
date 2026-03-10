import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'pi pi-chart-bar', route: '/dashboard' },
    { label: 'Tickets', icon: 'pi pi-ticket', route: '/dashboard/tickets' },
    { label: 'Groups', icon: 'pi pi-users', route: '/dashboard/group' },
    { label: 'Users', icon: 'pi pi-user', route: '/dashboard/user' },
  ]);
}
