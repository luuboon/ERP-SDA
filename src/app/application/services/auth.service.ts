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

    constructor() {
        this.initFromCookie();
    }

    async login(email: string, password: string): Promise<{ success: boolean; error?: string, token?: string, user?: User }> {
        const result = await this.repository.login(email, password);
        if (result.success && result.user) {
            this._currentUser.set(result.user);
            // El backend regresará el token. Por ahora simulamos uno o usamos el del mock si existiera.
            this.setCookie('erp_token', result.token || 'mock-jwt-token', 8); // 8 horas
            return { ...result };
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
        this.clearCookie('erp_token');
        this.router.navigate(['/auth/login']);
    }

    /** Refresh current user data from UserService (after permission changes) */
    refreshCurrentUser(): void {
        const current = this._currentUser();
        if (current) {
            const updated = this.userService.getById(current.id);
            if (updated) this._currentUser.set(updated);
        }
    }

    private setCookie(name: string, value: string, hours: number): void {
        const expires = new Date(Date.now() + hours * 3600 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
    }

    private clearCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    initFromCookie(): void {
        const token = this.getCookieValue('erp_token');
        if (!token) return;

        try {
            // Decodificar el payload del JWT (sin verificar firma — eso lo hace el backend)
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 > Date.now()) {
                this._currentUser.set({
                    id:                 payload.sub,
                    email:              payload.email,
                    name:               payload.name ?? '',
                    globalPermissions:  payload.globalPermissions  ?? [],
                    permissionsByGroup: payload.permissionsByGroup ?? {},
                });
            } else {
                this.clearCookie('erp_token'); // token expirado
            }
        } catch {
            this.clearCookie('erp_token');
        }
    }

    private getCookieValue(name: string): string | null {
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : null;
    }
}
