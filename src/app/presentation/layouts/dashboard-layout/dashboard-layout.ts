import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, DrawerModule, ButtonModule, PanelMenuModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout implements OnInit {
  drawerVisible: boolean = false;
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Group',
        icon: 'pi pi-users',
        routerLink: '/dashboard/group',
        command: () => this.drawerVisible = false
      },
      {
        label: 'User',
        icon: 'pi pi-user',
        routerLink: '/dashboard/user',
        command: () => this.drawerVisible = false
      },
      {
        label: 'Files',
        icon: 'pi pi-file',
        items: [
          {
            label: 'Documents',
            icon: 'pi pi-file',
            items: [
              {
                label: 'Invoices',
                icon: 'pi pi-file-pdf',
                items: [
                  {
                    label: 'Pending',
                    icon: 'pi pi-stop'
                  },
                  {
                    label: 'Paid',
                    icon: 'pi pi-check-circle'
                  }
                ]
              },
              {
                label: 'Clients',
                icon: 'pi pi-users'
              }
            ]
          },
          {
            label: 'Images',
            icon: 'pi pi-image',
            items: [
              {
                label: 'Logos',
                icon: 'pi pi-image'
              }
            ]
          }
        ]
      },
      {
        label: 'Cloud',
        icon: 'pi pi-cloud',
        items: [
          {
            label: 'Upload',
            icon: 'pi pi-cloud-upload'
          },
          {
            label: 'Download',
            icon: 'pi pi-cloud-download'
          },
          {
            label: 'Sync',
            icon: 'pi pi-refresh'
          }
        ]
      },
      {
        label: 'Devices',
        icon: 'pi pi-desktop',
        items: [
          {
            label: 'Phone',
            icon: 'pi pi-mobile'
          },
          {
            label: 'Desktop',
            icon: 'pi pi-desktop'
          },
          {
            label: 'Tablet',
            icon: 'pi pi-tablet'
          }
        ]
      }
    ];
  }
}
