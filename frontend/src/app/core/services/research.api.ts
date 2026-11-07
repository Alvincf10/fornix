import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Paginated,
  ResearchItem,
  ResearchStatus,
  ResearchCategory,
  Priority,
} from '../models/workspace.models';

export type ResearchPayload = {
  title: string;
  description?: string;
  objective?: string;
  category?: ResearchCategory;
  status?: ResearchStatus;
  priority?: Priority;
  tags?: string[];
};

@Injectable({ providedIn: 'root' })
export class ResearchApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/research`;

  list(opts: {
    page?: number;
    limit?: number;
    q?: string;
    status?: ResearchStatus;
    archived?: boolean;
  } = {}): Observable<Paginated<ResearchItem>> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    if (opts.q) params = params.set('q', opts.q);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.archived) params = params.set('archived', 'true');
    return this.http.get<Paginated<ResearchItem>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<ResearchItem>(`${this.base}/${id}`);
  }

  create(payload: ResearchPayload) {
    return this.http.post<ResearchItem>(this.base, payload);
  }

  update(id: string, payload: Partial<ResearchPayload>) {
    return this.http.patch<ResearchItem>(`${this.base}/${id}`, payload);
  }

  archive(id: string) {
    return this.http.post<ResearchItem>(`${this.base}/${id}/archive`, {});
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
