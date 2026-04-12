import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./presentation/pages/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'group-selection',
        canActivate: [authGuard],
        loadComponent: () => import('./presentation/pages/dashboard/group-selection-page/group-selection-page').then(m => m.GroupSelectionPage)
    },
    {
        path: 'dashboard/:groupId',
        canActivate: [authGuard],
        loadComponent: () => import('./presentation/layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
        loadChildren: () => import('./presentation/layouts/dashboard-layout/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path: 'auth',
        loadComponent: () => import('./presentation/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
        loadChildren: () => import('./presentation/layouts/auth-layout/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
