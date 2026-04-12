import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthRepository } from '../../core/repositories/auth.repository';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private repository = inject(AuthRepository);
    private userService = inject(UserService);
    private router = inject(Router);

    private _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        const result = await this.repository.login(email, password);
        if (result.success && result.user) {
            this._currentUser.set(result.user);
            return { success: true };
        }
        return { success: false, error: result.error };
    }

    async register(data: { name: string; email: string; password: string }): Promise<{ success: boolean; error?: string }> {
        const result = await this.repository.register(data);
        if (result.success && result.user) {
            // Also refresh UserService users list so other components see the new one
            await this.userService.loadUsers();
            this._currentUser.set(result.user);
            return { success: true };
        }
        return { success: false, error: result.error };
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
