import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserRepository } from '../../../core/repositories/user.repository';
import { User } from '../../../core/models/user.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpUserRepository extends UserRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/users`;

  async getUsers(): Promise<User[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<User>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<User | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<User>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async getByEmail(_email: string): Promise<User | undefined> {
    // El backend no expone búsqueda por email directamente — no se usa en el frontend
    return undefined;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const res = await firstValueFrom(this.http.post<ApiResponse<User>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<User>>(`${this.base}/${id}`, changes)
      );
      return res.data[0];
    } catch { return undefined; }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`));
      return true;
    } catch { return false; }
  }
}
