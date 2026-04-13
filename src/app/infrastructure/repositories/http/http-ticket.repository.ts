import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TicketRepository } from '../../../core/repositories/ticket.repository';
import { Ticket } from '../../../core/models/ticket.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpTicketRepository extends TicketRepository {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/tickets`;

  async getTickets(): Promise<Ticket[]> {
    const res = await firstValueFrom(this.http.get<ApiResponse<Ticket>>(this.base));
    return res.data;
  }

  async getById(id: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<Ticket>>(`${this.base}/${id}`));
      return res.data[0];
    } catch { return undefined; }
  }

  async getByGroup(groupId: string): Promise<Ticket[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Ticket>>(`${this.base}?groupId=${groupId}`)
    );
    return res.data;
  }

  async create(data: Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>): Promise<Ticket> {
    const res = await firstValueFrom(this.http.post<ApiResponse<Ticket>>(this.base, data));
    return res.data[0];
  }

  async update(id: string, changes: Partial<Omit<Ticket, 'id' | 'createdAt' | 'comments' | 'history'>>, _changedBy: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.patch<ApiResponse<Ticket>>(`${this.base}/${id}`, changes)
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

  async addComment(ticketId: string, _author: string, content: string): Promise<Ticket | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<Ticket>>(`${this.base}/${ticketId}/comments`, { content })
      );
      return res.data[0];
    } catch { return undefined; }
  }
}
