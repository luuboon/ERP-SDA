import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GroupRepository } from '../../../core/repositories/group.repository';
import { Group } from '../../../core/models/group.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpGroupRepository extends GroupRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/groups`;

  async getGroups(): Promise<Group[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Group>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<Group | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<Group>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async create(data: Omit<Group, 'id' | 'status'>): Promise<Group> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Group>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<Group, 'id'>>): Promise<Group | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<Group>>(`${this.base}/${id}`, changes)
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
