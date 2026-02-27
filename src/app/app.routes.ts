import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./presentation/pages/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./presentation/layouts/dashboard-layout/dashboard-layout').then(m => m.DashboardLayout),
        children: [
            {
                path: 'group',
                loadComponent: () => import('./presentation/pages/dashboard/group/group').then(m => m.Group)
            },
            {
                path: 'user',
                loadComponent: () => import('./presentation/pages/dashboard/user/user').then(m => m.User)
            },
            {
                path: '',
                redirectTo: 'group',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'auth',
        loadComponent: () => import('./presentation/layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./presentation/pages/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'register',
                loadComponent: () => import('./presentation/pages/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
