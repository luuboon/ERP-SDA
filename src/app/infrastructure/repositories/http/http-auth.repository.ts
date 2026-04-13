import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthRepository } from '../../../core/repositories/auth.repository';
import { User } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpAuthRepository extends AuthRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  async login(email: string, password: string) {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<{ token: string; user: User }>>
          (`${this.base}/login`, { email, password })
      );
      const item = res.data[0];
      return { success: true, user: item.user, token: item.token };
    } catch (err: any) {
      return { success: false, error: err.error?.message ?? 'Error al iniciar sesión' };
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<User>>(`${this.base}/register`, data)
      );
      return { success: true, user: res.data[0] };
    } catch (err: any) {
      return { success: false, error: err.error?.message ?? 'Error al registrarse' };
    }
  }
}
