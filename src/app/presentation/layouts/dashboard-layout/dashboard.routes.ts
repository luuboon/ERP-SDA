import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../pages/dashboard/dashboard-page/dashboard-page').then(m => m.DashboardPage)
    },
    {
        path: 'tickets',
        loadComponent: () => import('../../pages/dashboard/tickets-page/tickets-page').then(m => m.TicketsPage)
    },
    {
        path: 'group',
        loadComponent: () => import('../../pages/dashboard/group/group').then(m => m.Group)
    },
    {
        path: 'group/:id',
        loadComponent: () => import('../../pages/dashboard/group-detail-page/group-detail-page').then(m => m.GroupDetailPage)
    },
    {
        path: 'user',
        loadComponent: () => import('../../pages/dashboard/user/user').then(m => m.User)
    },
];
