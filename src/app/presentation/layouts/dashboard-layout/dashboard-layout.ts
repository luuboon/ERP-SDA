import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, PanelMenuModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Group',
        icon: 'pi pi-users',
        routerLink: '/dashboard/group'
      },
      {
        label: 'User',
        icon: 'pi pi-user',
        routerLink: '/dashboard/user'
      }
    ];
  }
}
