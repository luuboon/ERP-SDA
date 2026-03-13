import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private userService = inject(UserService);
    private router = inject(Router);

    private _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    login(email: string, password: string): { success: boolean; error?: string } {
        const user = this.userService.getByEmail(email);
        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }
        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta' };
        }
        this._currentUser.set(user);
        return { success: true };
    }

    register(data: { name: string; email: string; password: string }): { success: boolean; error?: string } {
        const existing = this.userService.getByEmail(data.email);
        if (existing) {
            return { success: false, error: 'El email ya está registrado' };
        }
        const newUser = this.userService.create({
            name: data.name,
            email: data.email,
            password: data.password,
            permissions: ['ticket:view', 'ticket:create'],
        });
        this._currentUser.set(newUser);
        return { success: true };
    }

    logout(): void {
        this._currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    hasPermission(permission: string): boolean {
        const user = this._currentUser();
        return user ? user.permissions.includes(permission) : false;
    }

    /** Refresh current user data from UserService (after permission changes) */
    refreshCurrentUser(): void {
        const current = this._currentUser();
        if (current) {
            const updated = this.userService.getById(current.id);
            if (updated) this._currentUser.set(updated);
        }
    }
}
