import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Paginated,
  ProjectItem,
  ProjectStatus,
  ResearchCategory,
  Priority,
} from '../models/workspace.models';

export type ProjectPayload = {
  title: string;
  description?: string;
  objective?: string;
  category?: ResearchCategory;
  status?: ProjectStatus;
  priority?: Priority;
  tags?: string[];
};

@Injectable({ providedIn: 'root' })
export class ProjectsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/projects`;

  list(opts: {
    page?: number;
    limit?: number;
    q?: string;
    status?: ProjectStatus;
    archived?: boolean;
  } = {}): Observable<Paginated<ProjectItem>> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', opts.page);
    if (opts.limit) params = params.set('limit', opts.limit);
    if (opts.q) params = params.set('q', opts.q);
    if (opts.status) params = params.set('status', opts.status);
    if (opts.archived) params = params.set('archived', 'true');
    return this.http.get<Paginated<ProjectItem>>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<ProjectItem>(`${this.base}/${id}`);
  }

  create(payload: ProjectPayload) {
    return this.http.post<ProjectItem>(this.base, payload);
  }

  update(id: string, payload: Partial<ProjectPayload>) {
    return this.http.patch<ProjectItem>(`${this.base}/${id}`, payload);
  }

  archive(id: string) {
    return this.http.post<ProjectItem>(`${this.base}/${id}/archive`, {});
  }

  remove(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/${id}`);
  }
}
