import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
    {
        path: 'group',
        loadComponent: () => import('../../pages/dashboard/group/group').then(m => m.Group)
    },
    {
        path: 'user',
        loadComponent: () => import('../../pages/dashboard/user/user').then(m => m.User)
    },
    {
        path: '',
        redirectTo: 'group',
        pathMatch: 'full'
    }
];
